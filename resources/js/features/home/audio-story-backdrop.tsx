"use client";

import {useEffect, useRef} from "react";

import "./audio-story-backdrop.css";

export interface AudioStoryBackdropProps {
  readonly active: boolean;
  readonly hidden: boolean;
  readonly reducedMotion: boolean;
  readonly preload: boolean;
  readonly dayPoster: string;
  readonly dayPosterSrcSet?: string | undefined;
  readonly nightPoster: string;
  readonly nightPosterSrcSet?: string | undefined;
  readonly sources: {
    readonly video: string;
    readonly videoSmall: string;
    readonly webm: string;
    readonly webmSmall: string;
  };
}

const RETURN_FADE_MS = 1_100;
const STALL_TIMEOUT_MS = 8_000;

/** A decorative transition: its completion never ends the Audio Story itself. */
export function AudioStoryBackdrop({
  active,
  hidden,
  reducedMotion,
  preload,
  dayPoster,
  dayPosterSrcSet,
  nightPoster,
  nightPosterSrcSet,
  sources,
}: AudioStoryBackdropProps) {
  const plateRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const wasActive = useRef(false);
  const shouldLoad = (preload || active) && !reducedMotion;

  useEffect(() => {
    // Source children are added only once Explore becomes available. Explicitly
    // run resource selection so engines also support that deferred insertion.
    videoRef.current?.load();
  }, [
    shouldLoad,
    sources.video,
    sources.videoSmall,
    sources.webm,
    sources.webmSmall,
  ]);

  useEffect(() => {
    const plate = plateRef.current;
    const video = videoRef.current;
    const poster = posterRef.current;
    if (!plate || !video || !poster) return;

    const entering = active && !wasActive.current;
    wasActive.current = active;
    let disposed = false;
    let frame: number | null = null;
    let nextFrame: number | null = null;
    let videoFrame: number | null = null;
    let watchdog: ReturnType<typeof setInterval> | null = null;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let lastProgress = performance.now();
    let lastTime = video.currentTime;

    const cancelFrames = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      if (nextFrame !== null) cancelAnimationFrame(nextFrame);
      if (videoFrame !== null) video.cancelVideoFrameCallback(videoFrame);
      frame = nextFrame = videoFrame = null;
    };
    const stopWatchdog = () => {
      if (watchdog !== null) clearInterval(watchdog);
      watchdog = null;
    };
    const reset = () => {
      video.pause();
      // Seeking an empty or unsupported media resource may throw in older engines.
      try {
        video.currentTime = 0;
      } catch {
        // The next successful source load starts at zero already.
      }
      video.dataset.visible = "false";
      poster.dataset.visible = "false";
      plate.dataset.state = "idle";
    };
    const revealPoster = () => {
      const show = () => {
        if (!disposed && poster.complete && poster.naturalWidth > 0)
          poster.dataset.visible = "true";
      };
      if (typeof poster.decode === "function")
        void poster.decode().then(show, show);
      else if (poster.complete) show();
      else poster.addEventListener("load", show, { once: true });
    };
    const settle = (state: "settled" | "fallback") => {
      if (disposed) return;
      stopWatchdog();
      cancelFrames();
      video.pause();
      plate.dataset.state = state;
      // Retain the last decoded video frame beneath the poster, including while
      // the image is decoding. Ending the clip must never expose a blank frame.
      revealPoster();
    };
    const onEnded = () => settle("settled");
    const onError = () => settle("fallback");
    const showFirstFrame = () => {
      if (
        disposed ||
        plate.dataset.state === "settled" ||
        plate.dataset.state === "fallback"
      )
        return;
      video.dataset.visible = "true";
      plate.dataset.state = "playing";
    };
    const requestFirstFrame = () => {
      if (video.dataset.visible === "true" || disposed) return;
      if (typeof video.requestVideoFrameCallback === "function") {
        if (videoFrame === null)
          videoFrame = video.requestVideoFrameCallback(() => {
            videoFrame = null;
            showFirstFrame();
          });
      } else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        if (frame === null && nextFrame === null)
          frame = requestAnimationFrame(() => {
            frame = null;
            nextFrame = requestAnimationFrame(() => {
              nextFrame = null;
              showFirstFrame();
            });
          });
      }
    };
    const onProgress = () => {
      if (video.currentTime > lastTime + 0.01) {
        lastProgress = performance.now();
        lastTime = video.currentTime;
      }
      requestFirstFrame();
    };

    if (!active) {
      video.pause();
      // Leave the current frame intact while the entire plate fades to day.
      if (plate.dataset.state !== "idle")
        resetTimer = setTimeout(reset, reducedMotion ? 0 : RETURN_FADE_MS);
    } else if (reducedMotion) {
      reset();
      settle("settled");
    } else {
      if (entering) {
        reset();
        plate.dataset.state = "loading";
        lastTime = 0;
      }
      if (
        !hidden &&
        plate.dataset.state !== "settled" &&
        plate.dataset.state !== "fallback"
      ) {
        video.addEventListener("loadeddata", requestFirstFrame);
        video.addEventListener("playing", requestFirstFrame);
        video.addEventListener("timeupdate", onProgress);
        video.addEventListener("ended", onEnded);
        video.addEventListener("error", onError);
        requestFirstFrame();
        watchdog = setInterval(() => {
          if (performance.now() - lastProgress >= STALL_TIMEOUT_MS)
            settle("fallback");
        }, 500);
        try {
          void video.play().catch(() => {
            if (!disposed) settle("fallback");
          });
        } catch {
          settle("fallback");
        }
      } else video.pause();
    }

    return () => {
      disposed = true;
      cancelFrames();
      stopWatchdog();
      if (resetTimer !== null) clearTimeout(resetTimer);
      video.pause();
      video.removeEventListener("loadeddata", requestFirstFrame);
      video.removeEventListener("playing", requestFirstFrame);
      video.removeEventListener("timeupdate", onProgress);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    };
  }, [active, hidden, reducedMotion]);

  return (
    <div
      ref={plateRef}
      className="scene-plate scene-plate--night audio-story-backdrop"
      data-testid="audio-story-backdrop"
      data-active={active}
      data-state="idle"
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="audio-story-backdrop__media audio-story-backdrop__day"
        src={dayPoster}
        srcSet={dayPosterSrcSet}
        sizes="100vw"
        alt=""
        draggable={false}
      />
      <video
        ref={videoRef}
        className="audio-story-backdrop__media audio-story-backdrop__video"
        data-testid="audio-story-transition"
        data-visible="false"
        preload={shouldLoad ? "auto" : "none"}
        muted
        playsInline
        disablePictureInPicture
        tabIndex={-1}
      >
        {shouldLoad && (
          <>
            <source
              src={sources.webmSmall}
              type="video/webm"
              media="(max-width: 760px)"
            />
            <source
              src={sources.videoSmall}
              type="video/mp4"
              media="(max-width: 760px)"
            />
            <source src={sources.webm} type="video/webm" />
            <source src={sources.video} type="video/mp4" />
          </>
        )}
      </video>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={posterRef}
        className="audio-story-backdrop__media audio-story-backdrop__night"
        src={nightPoster}
        srcSet={nightPosterSrcSet}
        sizes="100vw"
        alt=""
        draggable={false}
        data-visible="false"
      />
    </div>
  );
}
