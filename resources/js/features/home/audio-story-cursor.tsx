"use client";

import {type RefObject, useEffect, useRef} from "react";

import "./audio-story-cursor.css";

interface Point {
  readonly x: number;
  readonly y: number;
}

export interface AudioStoryCursorProps {
  readonly audioRef: RefObject<HTMLAudioElement | null>;
  readonly regionRef: RefObject<HTMLElement | null>;
  readonly reducedMotion: boolean;
  readonly initialPoint: Point | null;
}

const POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const CONTROL_SELECTOR =
  'button, a, input, select, textarea, summary, label, [role="button"], [role="link"], [contenteditable="true"], audio[controls], video[controls]';
const MEDIA_EVENTS = [
  "timeupdate",
  "durationchange",
  "loadedmetadata",
  "seeking",
  "seeked",
  "emptied",
  "ended",
  "play",
  "playing",
  "pause",
] as const;

export function getAudioStoryProgress(currentTime: number, duration: number) {
  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    !Number.isFinite(currentTime)
  ) {
    return 0;
  }
  return Math.min(1, Math.max(0, currentTime / duration));
}

export function AudioStoryCursor({
  audioRef,
  regionRef,
  reducedMotion,
  initialPoint,
}: AudioStoryCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const reducedRef = useRef(reducedMotion);
  const initialX = initialPoint?.x;
  const initialY = initialPoint?.y;

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const region = regionRef.current;
    const audio = audioRef.current;
    const cursor = cursorRef.current;
    const progressArc = progressRef.current;
    if (!region || !audio || !cursor || !progressArc) return;

    const pointerPreference = window.matchMedia(POINTER_QUERY);
    let disposed = false;
    let visible = false;
    let current: Point | null = null;
    let target: Point | null = null;
    let frame: number | null = null;
    let previousTime: number | null = null;
    let lastProgress: number | null = null;

    const stopFrame = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
    };
    const hide = () => {
      visible = false;
      current = null;
      target = null;
      cursor.dataset.visible = "false";
      cursor.style.visibility = "hidden";
      delete region.dataset.audioCursorVisible;
      stopFrame();
    };
    const writePosition = () => {
      if (!current) return;
      cursor.style.transform = `translate3d(${current.x - 40}px, ${current.y - 40}px, 0)`;
    };
    const syncProgress = () => {
      if (disposed) return;
      const progress = getAudioStoryProgress(audio.currentTime, audio.duration);
      if (progress === lastProgress) return;
      lastProgress = progress;
      cursor.dataset.progress = String(progress);
      progressArc.style.strokeDashoffset = String(1 - progress);
    };
    const isMoving = () =>
      current !== null &&
      target !== null &&
      (Math.abs(target.x - current.x) > 0.05 ||
        Math.abs(target.y - current.y) > 0.05);
    const isPlaying = () => !audio.paused && !audio.ended;

    const renderFrame = (now: number) => {
      frame = null;
      if (
        disposed ||
        !visible ||
        document.hidden ||
        !pointerPreference.matches
      ) {
        previousTime = null;
        return;
      }
      if (current && target) {
        // Exponential smoothing keeps the same ~100ms lag at any refresh rate.
        const elapsed = Math.max(0, now - (previousTime ?? now));
        const blend = reducedRef.current ? 1 : 1 - Math.exp(-elapsed / 100);
        current = {
          x: current.x + (target.x - current.x) * blend,
          y: current.y + (target.y - current.y) * blend,
        };
        if (!isMoving()) current = target;
        writePosition();
      }
      syncProgress();
      previousTime = now;
      if (isMoving() || isPlaying()) frame = requestAnimationFrame(renderFrame);
      else previousTime = null;
    };
    const schedule = () => {
      if (
        disposed ||
        !visible ||
        document.hidden ||
        !pointerPreference.matches ||
        (!isMoving() && !isPlaying())
      ) {
        stopFrame();
        return;
      }
      if (frame === null) {
        previousTime = performance.now();
        frame = requestAnimationFrame(renderFrame);
      }
    };
    const isControl = (element: EventTarget | null) => {
      const control =
        element instanceof Element ? element.closest(CONTROL_SELECTOR) : null;
      return (
        control !== null && !control.classList.contains("audio-exit-surface")
      );
    };
    const showAt = (point: Point) => {
      if (
        disposed ||
        document.hidden ||
        !pointerPreference.matches ||
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y)
      ) {
        hide();
        return;
      }
      target = point;
      if (!current || reducedRef.current) current = point;
      writePosition();
      syncProgress();
      visible = true;
      cursor.dataset.visible = "true";
      cursor.style.visibility = "visible";
      region.dataset.audioCursorVisible = "true";
      schedule();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || isControl(event.target)) {
        hide();
        return;
      }
      showAt({ x: event.clientX, y: event.clientY });
    };
    const onMedia = () => {
      syncProgress();
      schedule();
    };
    const onVisibility = () => {
      if (document.hidden) hide();
    };
    const onPointerPreference = () => {
      if (!pointerPreference.matches) hide();
    };

    region.addEventListener("pointermove", onPointer, { passive: true });
    region.addEventListener("pointerover", onPointer, { passive: true });
    region.addEventListener("pointerdown", onPointer, { passive: true });
    region.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", hide);
    pointerPreference.addEventListener("change", onPointerPreference);
    for (const event of MEDIA_EVENTS) audio.addEventListener(event, onMedia);

    syncProgress();
    if (typeof initialX === "number" && typeof initialY === "number") {
      const underneath =
        typeof document.elementFromPoint === "function"
          ? document.elementFromPoint(initialX, initialY)
          : null;
      if (
        !isControl(underneath) &&
        (!underneath || region.contains(underneath))
      ) {
        showAt({ x: initialX, y: initialY });
      }
    }

    return () => {
      disposed = true;
      hide();
      region.removeEventListener("pointermove", onPointer);
      region.removeEventListener("pointerover", onPointer);
      region.removeEventListener("pointerdown", onPointer);
      region.removeEventListener("pointerleave", hide);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", hide);
      pointerPreference.removeEventListener("change", onPointerPreference);
      for (const event of MEDIA_EVENTS)
        audio.removeEventListener(event, onMedia);
    };
  }, [audioRef, regionRef, initialX, initialY]);

  return (
    <div
      ref={cursorRef}
      className="audio-story-cursor"
      data-testid="audio-story-cursor"
      data-progress="0"
      data-visible="false"
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 80" fill="none" focusable="false">
        <circle className="audio-story-cursor__track" cx="40" cy="40" r="39" />
        <circle
          ref={progressRef}
          className="audio-story-cursor__progress"
          cx="40"
          cy="40"
          r="39"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="1"
          transform="rotate(-90 40 40)"
        />
        <path
          className="audio-story-cursor__cross"
          d="m35 35 10 10m0-10L35 45"
        />
      </svg>
    </div>
  );
}
