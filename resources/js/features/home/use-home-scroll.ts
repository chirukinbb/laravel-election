"use client";

import {type Dispatch, type RefObject, useEffect} from "react";

import {type HomeExperienceAction, homeExperienceReducer, type HomeExperienceState,} from "./home-stage";

export interface UseHomeScrollOptions {
  readonly stateRef: RefObject<HomeExperienceState>;
  readonly dispatch: Dispatch<HomeExperienceAction>;
  readonly regionRef: RefObject<HTMLElement | null>;
  readonly reducedMotion: boolean;
  readonly onTurnStart: () => void;
}

const CONTROL_SELECTOR =
  'button, a, input, select, textarea, summary, [role="button"], [role="link"], [contenteditable="true"]';
const ENDPOINT_INTENT = 12;
const GESTURE_GAP = 180;
const TOUCH_INTENT = 8;

interface TouchGesture {
  readonly identifier: number;
  readonly startX: number;
  readonly startY: number;
  lastY: number;
  axis: "pending" | "vertical" | "horizontal";
}

export function useHomeScroll({
  stateRef,
  dispatch,
  regionRef,
  reducedMotion,
  onTurnStart,
}: UseHomeScrollOptions) {
  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;

    // Native events can arrive before React commits the previous dispatch.
    // Project through the same reducer locally without mutating the caller's ref.
    let observedState = stateRef.current;
    let projectedState = observedState;
    let pendingDelta = 0;
    let pendingPhase: "home" | "reveal" | null = null;
    let lastInputTime = -Infinity;
    let lastInputSource: "wheel" | "touch" | null = null;
    let touch: TouchGesture | null = null;

    const currentState = () => {
      if (stateRef.current !== observedState) {
        observedState = stateRef.current;
        projectedState = observedState;
      }
      return projectedState;
    };
    const send = (action: HomeExperienceAction) => {
      projectedState = homeExperienceReducer(currentState(), action);
      dispatch(action);
    };
    const resetIntent = () => {
      pendingDelta = 0;
      pendingPhase = null;
      lastInputTime = -Infinity;
      lastInputSource = null;
    };
    const isStorySurface = (state: HomeExperienceState) =>
      state.phase === "home" ||
      state.phase === "turning" ||
      state.phase === "reveal";
    const isControl = (target: EventTarget | null) =>
      target instanceof Element &&
      (target.closest('[data-navigation-surface="true"]') !== null ||
        (!target.closest('[data-scene-surface="true"]') &&
          target.closest(CONTROL_SELECTOR) !== null));

    const progressBy = (delta: number, source: "wheel" | "touch") => {
      const current = currentState();
      if (!isStorySurface(current)) {
        resetIntent();
        return;
      }
      if (!Number.isFinite(delta) || Math.abs(delta) < 0.25) return;

      // Once the visitor asks to go Home, let the reverse clip play smoothly.
      // Continued upward wheel inertia or the same downward swipe must not
      // replace native playback with repeated frame seeks. Opposite input can
      // still take control and move toward Explore again.
      if (
        current.phase === "turning" &&
        current.turnDriver === "return" &&
        delta < 0
      ) {
        resetIntent();
        return;
      }

      // Outward inertia at either completed scene is a no-op, not a new turn.
      if (
        (current.phase === "home" && delta < 0) ||
        (current.phase === "reveal" && delta > 0)
      ) {
        resetIntent();
        return;
      }

      let acceptedDelta = delta;
      if (current.phase === "home" || current.phase === "reveal") {
        const now = performance.now();
        if (
          pendingPhase !== current.phase ||
          source !== lastInputSource ||
          now - lastInputTime > GESTURE_GAP
        )
          pendingDelta = 0;
        pendingPhase = current.phase;
        lastInputSource = source;
        lastInputTime = now;
        pendingDelta += delta;
        // Start the Home fade with the first intentional downward movement.
        if (
          Math.abs(pendingDelta) <
          (current.phase === "home" ? 0.5 : ENDPOINT_INTENT)
        )
          return;
        acceptedDelta = pendingDelta;
      }
      resetIntent();

      if (reducedMotion) {
        send({ type: acceptedDelta > 0 ? "SHOW_REVEAL" : "SHOW_HOME" });
        return;
      }
      if (current.phase === "reveal" && acceptedDelta < 0) {
        onTurnStart();
        send({ type: "START_RETURN" });
        return;
      }
      if (current.phase !== "turning" || current.turnDriver !== "scroll") {
        onTurnStart();
        send({ type: "START_TURN", driver: "scroll" });
      }
      send({
        type: "TURN_PROGRESS",
        progress:
          current.turnProgress +
          acceptedDelta / Math.max(400, window.innerHeight * 0.8),
        driver: "scroll",
      });
    };

    const onWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        event.shiftKey ||
        isControl(event.target) ||
        !Number.isFinite(event.deltaX) ||
        !Number.isFinite(event.deltaY) ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX)
      )
        return;
      if (!isStorySurface(currentState())) {
        resetIntent();
        return;
      }
      event.preventDefault();
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1;
      progressBy(event.deltaY * unit, "wheel");
    };

    const onTouchStart = (event: TouchEvent) => {
      touch = null;
      resetIntent();
      const point = event.touches[0];
      if (
        event.touches.length !== 1 ||
        !point ||
        isControl(event.target) ||
        !isStorySurface(currentState())
      )
        return;
      touch = {
        identifier: point.identifier,
        startX: point.clientX,
        startY: point.clientY,
        lastY: point.clientY,
        axis: "pending",
      };
    };
    const endTouch = () => {
      touch = null;
      resetIntent();
    };
    const onTouchMove = (event: TouchEvent) => {
      const point = event.touches[0];
      if (
        !touch ||
        !point ||
        event.touches.length !== 1 ||
        point.identifier !== touch.identifier ||
        isControl(event.target) ||
        !isStorySurface(currentState())
      ) {
        endTouch();
        return;
      }
      if (touch.axis === "pending") {
        const horizontal = Math.abs(point.clientX - touch.startX);
        const vertical = Math.abs(point.clientY - touch.startY);
        if (Math.max(horizontal, vertical) < TOUCH_INTENT) return;
        touch.axis = vertical > horizontal ? "vertical" : "horizontal";
      }
      if (touch.axis !== "vertical") return;
      event.preventDefault();
      const delta = (touch.lastY - point.clientY) * 2;
      touch.lastY = point.clientY;
      progressBy(delta, "touch");
    };

    region.addEventListener("wheel", onWheel, { passive: false });
    region.addEventListener("touchstart", onTouchStart, { passive: true });
    region.addEventListener("touchmove", onTouchMove, { passive: false });
    region.addEventListener("touchend", endTouch);
    region.addEventListener("touchcancel", endTouch);
    return () => {
      endTouch();
      region.removeEventListener("wheel", onWheel);
      region.removeEventListener("touchstart", onTouchStart);
      region.removeEventListener("touchmove", onTouchMove);
      region.removeEventListener("touchend", endTouch);
      region.removeEventListener("touchcancel", endTouch);
    };
  }, [stateRef, dispatch, regionRef, reducedMotion, onTurnStart]);
}
