"use client";

import {type RefObject, useEffect, useRef} from "react";

import "./inspect-cursor.css";

export interface InspectCursorProps {
  readonly regionRef: RefObject<HTMLElement | null>;
  readonly reducedMotion: boolean;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

const CANVAS_SELECTOR = "[data-tree-scene] canvas";
const CONTROL_SELECTOR =
  'header, nav, button, a, input, select, textarea, summary, label, [role="button"], [role="link"], [role="menu"], [role="listbox"], [contenteditable="true"], .language-selector, .language-options';

export function InspectCursor({
  regionRef,
  reducedMotion,
}: InspectCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(reducedMotion);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const region = regionRef.current;
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!region || !cursor || !ring) return;
    const owner = region.ownerDocument;
    const preference = window.matchMedia("(hover: hover) and (pointer: fine)");
    let disposed = false;
    let current: Point | null = null;
    let target: Point | null = null;
    let frame: number | null = null;
    let previousTime: number | null = null;
    let dragStart: (Point & { pointerId: number }) | null = null;

    const stopFrame = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
    };
    const setDragging = (dragging: boolean) => {
      cursor.dataset.dragging = String(dragging);
      ring.style.transform = dragging ? "scale(0.78)" : "scale(1)";
    };
    const endDrag = () => {
      dragStart = null;
      setDragging(false);
    };
    const hide = () => {
      current = null;
      target = null;
      cursor.dataset.visible = "false";
      cursor.style.visibility = "hidden";
      delete region.dataset.inspectCursorVisible;
      stopFrame();
    };
    const resetAndHide = () => {
      endDrag();
      hide();
    };
    const writePosition = () => {
      if (current) {
        cursor.style.transform = `translate3d(${current.x - 32}px, ${current.y - 32}px, 0)`;
      }
    };
    const isMoving = () =>
      current !== null &&
      target !== null &&
      (Math.abs(target.x - current.x) > 0.05 ||
        Math.abs(target.y - current.y) > 0.05);
    const tick = (now: number) => {
      if (disposed) return;
      frame = null;
      if (!current || !target || owner.hidden || !preference.matches) {
        previousTime = null;
        return;
      }
      const elapsed = Math.max(0, now - (previousTime ?? now));
      const blend = reducedRef.current ? 1 : 1 - Math.exp(-elapsed / 100);
      current = {
        x: current.x + (target.x - current.x) * blend,
        y: current.y + (target.y - current.y) * blend,
      };
      if (!isMoving()) current = target;
      writePosition();
      previousTime = now;
      if (isMoving()) frame = requestAnimationFrame(tick);
      else previousTime = null;
    };

    const physicalTarget = (event: PointerEvent) =>
      typeof owner.elementFromPoint === "function"
        ? owner.elementFromPoint(event.clientX, event.clientY)
        : event.target instanceof Element
          ? event.target
          : null;
    const isOverHeader = (point: Point) =>
      Array.from(region.querySelectorAll("header")).some((header) => {
        const box = header.getBoundingClientRect();
        return (
          box.width > 0 &&
          box.height > 0 &&
          !header.closest("[hidden], [inert]") &&
          point.x >= box.left &&
          point.x <= box.right &&
          point.y >= box.top &&
          point.y <= box.bottom
        );
      });
    const follow = (event: PointerEvent) => {
      if (disposed) return null;
      if (
        event.pointerType !== "mouse" ||
        owner.hidden ||
        !preference.matches
      ) {
        resetAndHide();
        return null;
      }
      const point = { x: event.clientX, y: event.clientY };
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        hide();
        return null;
      }
      // OrbitControls captures its canvas. Hit-testing uses the physical pointer
      // location so a captured move over the header still hides this decoration.
      const hit = physicalTarget(event);
      if (
        !hit ||
        !region.contains(hit) ||
        hit.closest(CONTROL_SELECTOR) ||
        isOverHeader(point)
      ) {
        hide();
        return null;
      }
      target = point;
      if (!current || reducedRef.current) current = point;
      writePosition();
      cursor.dataset.visible = "true";
      cursor.style.visibility = "visible";
      region.dataset.inspectCursorVisible = "true";
      if (isMoving() && frame === null) {
        previousTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
      return hit;
    };
    const onMove = (event: PointerEvent) => {
      if (dragStart?.pointerId === event.pointerId) {
        if ((event.buttons & 1) === 0) endDrag();
        else if (
          Math.hypot(
            event.clientX - dragStart.x,
            event.clientY - dragStart.y,
          ) >= 3
        ) {
          setDragging(true);
        }
      }
      follow(event);
    };
    const onDown = (event: PointerEvent) => {
      const hit = follow(event);
      if (event.button !== 0) return;
      endDrag();
      if (
        hit?.matches(CANVAS_SELECTOR) &&
        event.target instanceof Element &&
        event.target.matches(CANVAS_SELECTOR) &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey
      )
        dragStart = {
          x: event.clientX,
          y: event.clientY,
          pointerId: event.pointerId,
        };
    };
    const onUp = (event: PointerEvent) => {
      if (
        dragStart?.pointerId === event.pointerId &&
        (event.button === 0 || (event.buttons & 1) === 0)
      )
        endDrag();
      follow(event);
    };
    const onCancel = (event: PointerEvent) => {
      if (!dragStart || dragStart.pointerId === event.pointerId) resetAndHide();
    };
    const onLostCapture = (event: PointerEvent) => {
      if (dragStart?.pointerId === event.pointerId) endDrag();
    };
    const onVisibility = () => {
      if (owner.hidden) resetAndHide();
    };
    const onPreference = () => {
      if (!preference.matches) resetAndHide();
    };
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) hide();
    };
    const options = { capture: true, passive: true };
    owner.addEventListener("pointermove", onMove, options);
    owner.addEventListener("pointerover", onMove, options);
    owner.addEventListener("pointerdown", onDown, options);
    owner.addEventListener("pointerup", onUp, options);
    owner.addEventListener("pointercancel", onCancel, options);
    owner.addEventListener("lostpointercapture", onLostCapture, options);
    owner.addEventListener("pointerout", onPointerOut, options);
    region.addEventListener("pointerleave", hide);
    owner.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", resetAndHide);
    preference.addEventListener("change", onPreference);

    return () => {
      disposed = true;
      resetAndHide();
      owner.removeEventListener("pointermove", onMove, true);
      owner.removeEventListener("pointerover", onMove, true);
      owner.removeEventListener("pointerdown", onDown, true);
      owner.removeEventListener("pointerup", onUp, true);
      owner.removeEventListener("pointercancel", onCancel, true);
      owner.removeEventListener("lostpointercapture", onLostCapture, true);
      owner.removeEventListener("pointerout", onPointerOut, true);
      region.removeEventListener("pointerleave", hide);
      owner.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", resetAndHide);
      preference.removeEventListener("change", onPreference);
    };
  }, [regionRef]);

  return (
    <div
      ref={cursorRef}
      className="inspect-cursor"
      data-testid="inspect-cursor"
      data-visible="false"
      data-dragging="false"
      data-reduced-motion={reducedMotion}
      aria-hidden="true"
    >
      <div ref={ringRef} className="inspect-cursor__ring" />
    </div>
  );
}
