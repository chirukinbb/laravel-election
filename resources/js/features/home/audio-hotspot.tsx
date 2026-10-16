"use client";

import {type MouseEvent, useEffect, useRef} from "react";

import "./audio-hotspot.css";

export interface AudioHotspotProps {
  readonly label: string;
  readonly onActivate: (event: MouseEvent<HTMLButtonElement>) => void;
  readonly reducedMotion: boolean;
  readonly reference: boolean;
}

const POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const NEAR_DISTANCE = 110;
const MAX_TRAVEL = 18;
const LAG_MS = 120;

export function AudioHotspot({
  label,
  onActivate,
  reducedMotion,
  reference,
}: AudioHotspotProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    const preference = window.matchMedia(POINTER_QUERY);
    let disposed = false;
    let frame: number | null = null;
    let previousTime = 0;
    let current = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let anchor: {
      x: number;
      y: number;
      halfWidth: number;
      halfHeight: number;
    } | null = null;

    const writePosition = () => {
      button.style.setProperty("--hotspot-x", `${current.x}px`);
      button.style.setProperty("--hotspot-y", `${current.y}px`);
    };
    const stopFrame = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };
    const renderFrame = (now: number) => {
      frame = null;
      if (disposed) return;
      const blend = 1 - Math.exp(-Math.max(0, now - previousTime) / LAG_MS);
      current.x += (target.x - current.x) * blend;
      current.y += (target.y - current.y) * blend;
      const settled =
        Math.hypot(target.x - current.x, target.y - current.y) < 0.02;
      if (settled) current = { ...target };
      writePosition();
      previousTime = now;
      if (!settled) frame = requestAnimationFrame(renderFrame);
    };
    const schedule = () => {
      if (disposed || frame !== null) return;
      if (Math.hypot(target.x - current.x, target.y - current.y) < 0.02) {
        current = { ...target };
        writePosition();
        return;
      }
      previousTime = performance.now();
      frame = requestAnimationFrame(renderFrame);
    };
    const reset = (immediate = false) => {
      button.dataset.magneticActive = "false";
      target = { x: 0, y: 0 };
      if (immediate || reducedMotion) {
        stopFrame();
        current = { ...target };
        writePosition();
      } else schedule();
    };
    const invalidateGeometry = () => {
      anchor = null;
      reset(true);
    };
    const onPointer = (event: PointerEvent) => {
      if (
        disposed ||
        document.hidden ||
        !preference.matches ||
        event.pointerType !== "mouse" ||
        !Number.isFinite(event.clientX) ||
        !Number.isFinite(event.clientY)
      ) {
        reset(true);
        return;
      }
      // Cache the original center, excluding our own translation, to prevent drift.
      if (!anchor) {
        const bounds = button.getBoundingClientRect();
        anchor = {
          x: bounds.left + bounds.width / 2 - current.x,
          y: bounds.top + bounds.height / 2 - current.y,
          halfWidth: bounds.width / 2,
          halfHeight: bounds.height / 2,
        };
      }
      const dx = event.clientX - anchor.x;
      const dy = event.clientY - anchor.y;
      const distance = Math.hypot(dx, dy);
      const nearby = distance < NEAR_DISTANCE;
      button.dataset.magneticActive = String(nearby);
      if (!nearby) {
        reset();
        return;
      }
      if (reducedMotion) return;
      // Fade attraction at the edge of the near zone; cap total travel at 18px.
      const influence = Math.min(1, (NEAR_DISTANCE - distance) / 30);
      const travel = Math.min(MAX_TRAVEL, distance * 0.28) * influence;
      const x = distance ? (dx / distance) * travel : 0;
      const y = distance ? (dy / distance) * travel : 0;
      target = {
        x: Math.min(
          window.innerWidth - anchor.halfWidth - 4 - anchor.x,
          Math.max(anchor.halfWidth + 4 - anchor.x, x),
        ),
        y: Math.min(
          window.innerHeight - anchor.halfHeight - 4 - anchor.y,
          Math.max(anchor.halfHeight + 4 - anchor.y, y),
        ),
      };
      schedule();
    };
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) reset();
    };
    const onBlur = () => reset(true);
    const onVisibility = () => {
      if (document.hidden) reset(true);
    };
    const onPreference = () => {
      if (!preference.matches) reset(true);
    };
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(invalidateGeometry);
    observer?.observe(button);
    if (button.offsetParent) observer?.observe(button.offsetParent);
    document.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("scroll", invalidateGeometry, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", invalidateGeometry);
    window.addEventListener("blur", onBlur);
    preference.addEventListener("change", onPreference);
    writePosition();

    return () => {
      disposed = true;
      stopFrame();
      observer?.disconnect();
      document.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("scroll", invalidateGeometry, true);
      window.removeEventListener("resize", invalidateGeometry);
      window.removeEventListener("blur", onBlur);
      preference.removeEventListener("change", onPreference);
      current = { x: 0, y: 0 };
      button.dataset.magneticActive = "false";
      writePosition();
    };
  }, [reducedMotion, reference]);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`audio-hotspot${reference ? " audio-hotspot--reference" : ""}`}
      aria-label={label}
      data-testid="audio-hotspot"
      data-magnetic-active="false"
      data-reduced-motion={reducedMotion}
      onClick={onActivate}
    >
      <span className="hotspot-ring" aria-hidden="true" />
      <span className="hotspot-core" aria-hidden="true" />
    </button>
  );
}
