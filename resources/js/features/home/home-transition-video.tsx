"use client";

import {useEffect, useRef, useState} from "react";
import type {HomePhase, TurnDriver} from "./home-stage";

export interface HomeTransitionVideoProps {
  readonly src: string;
  readonly smallSrc: string | null;
  readonly reverseSrc: string | null;
  readonly reverseSmallSrc: string | null;
  readonly durationHint: number;
  readonly frameRateHint: number;
  readonly phase: HomePhase;
  readonly driver: TurnDriver | null;
  readonly progress: number;
  readonly hidden: boolean;
  readonly onProgress: (progress: number, driver: TurnDriver) => void;
  readonly onReady: () => void;
  readonly onError: () => void;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const isSurface = (phase: HomePhase) =>
  phase === "home" || phase === "turning" || phase === "reveal";

type VideoLane = "forward" | "reverse";
type VideoStatus = "loading" | "ready" | "error";

/** Persistent decoded timelines: the return clip plays natively, without seeks per frame. */
export function HomeTransitionVideo(props: HomeTransitionVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reverseVideoRef = useRef<HTMLVideoElement>(null);
  const latest = useRef(props);
  const runtime = useRef<{ sync: () => void } | null>(null);
  const [status, setStatus] = useState<VideoStatus>("loading");
  const [reverseStatus, setReverseStatus] = useState<VideoStatus>("loading");
  const [displayLane, setDisplayLane] = useState<VideoLane | null>(null);

  useEffect(() => {
    latest.current = props;
    runtime.current?.sync();
  }, [props]);

  useEffect(() => {
    const video = videoRef.current;
    const reverseVideo = reverseVideoRef.current;
    if (!video || !reverseVideo) return;
    // Choose once on mount, before assigning src. No desktop media request is
    // emitted by server HTML or by resizing an already loaded mobile scene.
    const smallScreen = matchMedia("(max-width: 900px)").matches;
    const source = smallScreen && props.smallSrc ? props.smallSrc : props.src;
    const reverseSource =
      smallScreen && props.reverseSmallSrc
        ? props.reverseSmallSrc
        : props.reverseSrc;
    let disposed = false;
    let failed = false;
    let ready = false;
    let prepared = false;
    let lane: VideoLane = "forward";
    let targetVideo = video;
    let reverseLoaded = false;
    let reverseFailed = false;
    let mode = "";
    let generation = 0;
    let desired = clamp(latest.current.progress);
    let autoStarted = false;
    let returnRunning = false;
    let driveFrame = 0;
    let decodedFrame = 0;
    let paintFrame = 0;
    let paintFallback = 0;
    let stallTimer: ReturnType<typeof setTimeout> | null = null;
    let lastAutoTime = -1;
    setStatus("loading");
    setReverseStatus("loading");
    setDisplayLane(null);

    const blocked = () => latest.current.hidden || document.hidden;
    const active = () => isSurface(latest.current.phase) && !blocked();
    const automatic = () =>
      latest.current.phase === "turning" && latest.current.driver === "auto";
    const reversing = () =>
      latest.current.phase === "turning" && latest.current.driver === "return";
    const nativePlayback = () =>
      automatic() || (reversing() && lane === "reverse");
    const duration = () =>
      Number.isFinite(targetVideo.duration) && targetVideo.duration > 0
        ? targetVideo.duration
        : 0;
    const frameSeconds = () =>
      1 /
      (latest.current.frameRateHint > 0 ? latest.current.frameRateHint : 24);
    const endTime = () => Math.max(0, duration() - frameSeconds() / 2);
    const targetTime = () =>
      (lane === "reverse" ? 1 - desired : desired) * endTime();
    const closeToTarget = () =>
      Math.abs(targetVideo.currentTime - targetTime()) <= frameSeconds() / 2;

    const clearStall = () => {
      if (stallTimer !== null) clearTimeout(stallTimer);
      stallTimer = null;
    };
    const cancelDrive = () => {
      generation += 1;
      cancelAnimationFrame(driveFrame);
      driveFrame = 0;
      if (decodedFrame) targetVideo.cancelVideoFrameCallback(decodedFrame);
      decodedFrame = 0;
      if (paintFrame) targetVideo.cancelVideoFrameCallback(paintFrame);
      paintFrame = 0;
      cancelAnimationFrame(paintFallback);
      paintFallback = 0;
      autoStarted = false;
      returnRunning = false;
      video.pause();
      reverseVideo.pause();
    };
    const fail = () => {
      if (disposed || failed) return;
      failed = true;
      cancelDrive();
      clearStall();
      setStatus("error");
      setReverseStatus("error");
      setDisplayLane(null);
      latest.current.onError();
    };
    const watchStall = (refresh = false) => {
      // A settled scrubber can remain paused indefinitely. A pending seek may
      // still be waiting for an unbuffered range and needs the loading watchdog.
      if (
        !active() ||
        (prepared && !nativePlayback() && !targetVideo.seeking)
      ) {
        clearStall();
        return;
      }
      if (refresh) clearStall();
      if (stallTimer === null) stallTimer = setTimeout(fail, 15_000);
    };

    const markReady = () => {
      if (disposed || failed || prepared || !active()) return;
      if (targetVideo.seeking || targetVideo.readyState < 2 || !closeToTarget())
        return;
      prepared = true;
      if (lane === "forward") setStatus("ready");
      else setReverseStatus("ready");
      setDisplayLane(lane);
      if (!ready) {
        ready = true;
        latest.current.onReady();
      }
      watchStall();
      pump();
    };
    const gateFirstFrame = () => {
      if (prepared || paintFrame || paintFallback || targetVideo.readyState < 2)
        return;
      const run = generation;
      if (typeof targetVideo.requestVideoFrameCallback === "function") {
        paintFrame = targetVideo.requestVideoFrameCallback(() => {
          paintFrame = 0;
          if (run !== generation) return;
          markReady();
        });
      }
      // A paused frame may have been presented before this listener registered.
      // loadeddata/seeked + HAVE_CURRENT_DATA guarantees that decoded frame;
      // two paint opportunities avoid depending on another playback frame.
      paintFallback = requestAnimationFrame(() => {
        paintFallback = requestAnimationFrame(() => {
          paintFallback = 0;
          if (run !== generation) return;
          if (paintFrame) targetVideo.cancelVideoFrameCallback(paintFrame);
          paintFrame = 0;
          markReady();
        });
      });
    };

    const emitAutoProgress = (time = targetVideo.currentTime) => {
      if (disposed || failed || !active() || !nativePlayback() || !autoStarted)
        return;
      if (duration() <= 0) return;
      if (time > lastAutoTime + 0.001) {
        lastAutoTime = time;
        watchStall(true);
      }
      const fraction = clamp(time / duration());
      latest.current.onProgress(
        lane === "reverse" ? 1 - fraction : fraction,
        lane === "reverse" ? "return" : "auto",
      );
    };
    const watchPlayback = (run: number) => {
      if (
        disposed ||
        failed ||
        run !== generation ||
        !nativePlayback() ||
        !active()
      )
        return;
      if (typeof targetVideo.requestVideoFrameCallback === "function") {
        decodedFrame = targetVideo.requestVideoFrameCallback(
          (_now, metadata) => {
            decodedFrame = 0;
            if (run !== generation) return;
            emitAutoProgress(metadata.mediaTime);
            watchPlayback(run);
          },
        );
      } else {
        driveFrame = requestAnimationFrame(() => {
          driveFrame = 0;
          emitAutoProgress();
          watchPlayback(run);
        });
      }
    };
    const startAutomatic = () => {
      if (autoStarted || !prepared || !active() || !nativePlayback()) return;
      autoStarted = true;
      const playingVideo = targetVideo;
      lastAutoTime = playingVideo.currentTime;
      const run = generation;
      watchPlayback(run);
      watchStall(true);
      void playingVideo.play().then(
        () => {
          // An old play promise must never pause a newer run on the same clip.
          if (run !== generation) return;
          if (disposed || failed || !nativePlayback() || !active())
            playingVideo.pause();
        },
        (error: unknown) => {
          if (disposed || run !== generation) return;
          if (error instanceof DOMException && error.name === "AbortError")
            return;
          fail();
        },
      );
    };

    const startReturn = () => {
      if (
        returnRunning ||
        !prepared ||
        !active() ||
        !reversing() ||
        lane === "reverse"
      )
        return;
      returnRunning = true;
      const run = generation;
      const from = desired;
      const clipDuration = duration() || latest.current.durationHint;
      const milliseconds = Math.max(400, clipDuration * 1_000 * from);
      let elapsed = 0;
      let previousTime: number | null = null;
      const tick = (now: number) => {
        driveFrame = 0;
        if (
          disposed ||
          failed ||
          run !== generation ||
          !active() ||
          !reversing()
        )
          return;
        if (previousTime !== null) elapsed += Math.min(64, now - previousTime);
        previousTime = now;
        const fraction = Math.min(1, elapsed / milliseconds);
        const eased = fraction * fraction * (3 - 2 * fraction);
        desired = from * (1 - eased);
        latest.current.onProgress(desired, "return");
        pump();
        if (fraction < 1) driveFrame = requestAnimationFrame(tick);
      };
      driveFrame = requestAnimationFrame(tick);
    };

    const pump = () => {
      if (disposed || failed || !active()) return;
      watchStall();
      if (nativePlayback() && autoStarted) return;
      if (duration() <= 0 || targetVideo.readyState < 1 || targetVideo.seeking)
        return;
      targetVideo.pause();
      targetVideo.dataset.seekTarget = targetTime().toFixed(4);
      if (!closeToTarget()) {
        try {
          targetVideo.currentTime = targetTime();
          watchStall();
        } catch {
          fail();
        }
        return;
      }
      gateFirstFrame();
      if (prepared) {
        startAutomatic();
        startReturn();
      }
    };
    const sync = () => {
      if (disposed || failed) return;
      const state = latest.current;
      // Warm the return clip as Explore approaches, never on the initial Home.
      if (
        !reverseLoaded &&
        reverseSource &&
        (state.phase === "reveal" || reversing() || state.progress >= 0.8)
      ) {
        reverseLoaded = true;
        reverseVideo.preload = "auto";
        reverseVideo.src = reverseSource;
      }
      const nextLane: VideoLane =
        reversing() && reverseSource && !reverseFailed ? "reverse" : "forward";
      const nextMode = `${state.phase}:${state.driver ?? "none"}:${blocked()}:${nextLane}`;
      if (nextMode !== mode) {
        cancelDrive();
        if (lane !== nextLane) prepared = false;
        lane = nextLane;
        targetVideo = lane === "reverse" ? reverseVideo : video;
        video.dataset.active = String(lane === "forward");
        reverseVideo.dataset.active = String(lane === "reverse");
        mode = nextMode;
      }
      if (!returnRunning) desired = clamp(state.progress);
      watchStall();
      pump();
    };
    const listen = (element: HTMLVideoElement) => {
      const mediaReady = () => {
        if (element === targetVideo) pump();
      };
      const ended = () => {
        if (
          !disposed &&
          !failed &&
          element === targetVideo &&
          nativePlayback() &&
          active()
        )
          latest.current.onProgress(
            lane === "reverse" ? 0 : 1,
            lane === "reverse" ? "return" : "auto",
          );
      };
      const mediaError = () => {
        if (
          !element.error ||
          element.error.code === MediaError.MEDIA_ERR_ABORTED
        )
          return;
        if (element === reverseVideo) {
          reverseFailed = true;
          setReverseStatus("error");
          // Keep the original seek-based return usable if an optional export
          // cannot load. Switching back still waits for its decoded frame.
          sync();
        } else fail();
      };
      const timeUpdate = () => {
        if (
          element === targetVideo &&
          typeof element.requestVideoFrameCallback !== "function"
        )
          emitAutoProgress();
      };
      const readyEvents = [
        "loadedmetadata",
        "loadeddata",
        "seeking",
        "seeked",
        "canplay",
      ];
      readyEvents.forEach((event) =>
        element.addEventListener(event, mediaReady),
      );
      element.addEventListener("ended", ended);
      element.addEventListener("error", mediaError);
      element.addEventListener("timeupdate", timeUpdate);
      return () => {
        readyEvents.forEach((event) =>
          element.removeEventListener(event, mediaReady),
        );
        element.removeEventListener("ended", ended);
        element.removeEventListener("error", mediaError);
        element.removeEventListener("timeupdate", timeUpdate);
        element.removeAttribute("src");
        element.load();
      };
    };
    const cleanForward = listen(video);
    const cleanReverse = listen(reverseVideo);
    runtime.current = { sync };
    document.addEventListener("visibilitychange", sync);
    video.src = source;
    sync();

    return () => {
      disposed = true;
      runtime.current = null;
      cancelDrive();
      clearStall();
      document.removeEventListener("visibilitychange", sync);
      cleanForward();
      cleanReverse();
    };
  }, [props.src, props.smallSrc, props.reverseSrc, props.reverseSmallSrc]);

  return (
    <>
      <video
        ref={videoRef}
        className="turn-video scene-parallax-plane"
        data-testid="home-transition-video"
        data-state={status}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{
          visibility:
            displayLane === "forward" && isSurface(props.phase)
              ? "visible"
              : "hidden",
        }}
      />
      <video
        ref={reverseVideoRef}
        className="turn-video scene-parallax-plane"
        data-testid="home-transition-reverse-video"
        data-state={reverseStatus}
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        style={{
          visibility:
            displayLane === "reverse" && isSurface(props.phase)
              ? "visible"
              : "hidden",
        }}
      />
    </>
  );
}
