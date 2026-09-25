"use client";

import {type RefObject, useCallback, useEffect, useRef} from "react";

interface RailDrag {
  id: number;
  x: number;
  y: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  started: boolean;
}

/** Three identical five-image groups allow the middle group to wrap seamlessly. */
export function useEditorialRail(
  railRef: RefObject<HTMLDivElement | null>,
  reduced: boolean,
) {
  const runtime = useRef<{ move: (direction: number) => void } | null>(null);
  const moveRail = useCallback((direction: number) => {
    runtime.current?.move(direction);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const root = rail.closest(".golden-leaves") ?? rail.parentElement;
    let frame = 0;
    let lastFrame = 0;
    let observed = false;
    let cycle = 0;
    let maxScroll = 0;
    let initialized = false;
    let velocity = 0;
    let remainingMove = 0;
    let drag: RailDrag | null = null;
    let suppressClickUntil = 0;
    let blurred = false;
    let fractionalMove = 0;
    let lastWrittenScroll = rail.scrollLeft;
    rail.dataset.dragging = "false";

    const focused = () => rail.contains(document.activeElement);
    const available = () =>
      observed &&
      !document.hidden &&
      !blurred &&
      !root?.querySelector(".leaves-dialog[open]");
    const canLoop = () => cycle > 0 && maxScroll >= cycle;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
    };
    const moveBy = (amount: number, wrap: boolean) => {
      const actual = rail.scrollLeft;
      // Preserve subpixel travel on browsers that round each scrollTo call.
      // A native wheel, keyboard or focus scroll becomes the new origin.
      if (actual !== lastWrittenScroll) fractionalMove = 0;
      let next = actual + amount + fractionalMove;
      if (wrap && canLoop()) {
        // The safe repeat range fits even when one group is narrower than the viewport.
        const lower = Math.max(0, (maxScroll - cycle) / 2);
        next = lower + ((((next - lower) % cycle) + cycle) % cycle);
      }
      next = Math.max(0, Math.min(maxScroll, next));
      rail.scrollTo({ left: next, behavior: "instant" });
      lastWrittenScroll = rail.scrollLeft;
      fractionalMove = next - lastWrittenScroll;
    };
    const tick = (time: number) => {
      frame = 0;
      if (!available() || drag) {
        lastFrame = 0;
        return;
      }
      const elapsed = lastFrame ? Math.min(40, time - lastFrame) : 16;
      lastFrame = time;
      const wrap = !focused();
      if (Math.abs(remainingMove) > 0.5) {
        const amount = remainingMove * (1 - Math.exp(-elapsed / 140));
        remainingMove -= amount;
        moveBy(amount, wrap);
      } else if (Math.abs(velocity) > 0.015 && !reduced) {
        moveBy(velocity * elapsed, wrap);
        velocity *= Math.exp(-elapsed / 240);
      } else if (!reduced && !focused() && canLoop()) {
        velocity = 0;
        remainingMove = 0;
        moveBy(elapsed * 0.014, true);
      } else {
        lastFrame = 0;
        velocity = 0;
        remainingMove = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!available() || drag) {
        stop();
        return;
      }
      if (
        !frame &&
        (Math.abs(remainingMove) > 0.5 ||
          (!reduced &&
            (Math.abs(velocity) > 0.015 || (!focused() && canLoop()))))
      ) {
        frame = requestAnimationFrame(tick);
      }
    };
    const finishDrag = (inertia: boolean) => {
      const ended = drag;
      drag = null;
      rail.dataset.dragging = "false";
      if (ended) {
        if (ended.started) suppressClickUntil = performance.now() + 450;
        velocity =
          inertia &&
          ended.started &&
          !reduced &&
          performance.now() - ended.lastTime < 100
            ? ended.velocity
            : 0;
        if (rail.hasPointerCapture(ended.id))
          rail.releasePointerCapture(ended.id);
      }
      wake();
    };
    const measure = () => {
      const first = rail.children[0];
      const nextGroup = rail.children[5];
      const previous = cycle;
      if (first instanceof HTMLElement && nextGroup instanceof HTMLElement) {
        cycle = nextGroup.offsetLeft - first.offsetLeft;
      } else {
        cycle = 0;
      }
      maxScroll = rail.scrollWidth - rail.clientWidth;
      if (canLoop() && !drag && !focused()) {
        if (!initialized) {
          rail.scrollTo({ left: cycle, behavior: "instant" });
          fractionalMove = 0;
          lastWrittenScroll = rail.scrollLeft;
          initialized = true;
        } else if (previous > 0 && previous !== cycle) {
          const progress =
            (((rail.scrollLeft % previous) + previous) % previous) / previous;
          rail.scrollTo({
            left: cycle + progress * cycle,
            behavior: "instant",
          });
          fractionalMove = 0;
          lastWrittenScroll = rail.scrollLeft;
          moveBy(0, true);
        }
      }
      wake();
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary || !available()) return;
      suppressClickUntil = 0;
      velocity = 0;
      remainingMove = 0;
      stop();
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        lastX: event.clientX,
        lastTime: performance.now(),
        velocity: 0,
        started: false,
      };
    };
    const pointerMove = (event: PointerEvent) => {
      const active = drag;
      if (!active || event.pointerId !== active.id) return;
      const dx = event.clientX - active.x;
      const dy = event.clientY - active.y;
      if (!active.started) {
        if (
          event.pointerType === "touch" &&
          Math.abs(dy) > 6 &&
          Math.abs(dy) > Math.abs(dx)
        ) {
          finishDrag(false);
          return;
        }
        if (Math.abs(dx) <= 6) return;
        active.started = true;
        rail.dataset.dragging = "true";
        rail.setPointerCapture(event.pointerId);
      }
      if (event.cancelable) event.preventDefault();
      const now = performance.now();
      const amount = active.lastX - event.clientX;
      const speed = amount / Math.max(8, now - active.lastTime);
      active.velocity =
        active.velocity * 0.55 + Math.max(-3, Math.min(3, speed)) * 0.45;
      active.lastX = event.clientX;
      active.lastTime = now;
      moveBy(amount, true);
    };
    const pointerUp = (event: PointerEvent) => {
      if (drag?.id === event.pointerId) finishDrag(true);
    };
    const pointerCancel = (event: PointerEvent) => {
      if (drag?.id === event.pointerId) finishDrag(false);
    };
    const click = (event: MouseEvent) => {
      if (event.detail !== 0 && performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressClickUntil = 0;
      }
    };
    const nativeDrag = (event: DragEvent) => event.preventDefault();
    const focusIn = () => {
      velocity = 0;
      if (!remainingMove) stop();
    };
    const focusOut = () => queueMicrotask(wake);
    const visibility = () => {
      if (document.hidden) finishDrag(false);
      wake();
    };
    const blur = () => {
      blurred = true;
      finishDrag(false);
    };
    const focus = () => {
      blurred = false;
      wake();
    };
    runtime.current = {
      move(direction) {
        if (!direction) return;
        velocity = 0;
        const amount = Math.sign(direction) * rail.clientWidth * 0.4;
        if (reduced) moveBy(amount, !focused());
        else {
          remainingMove += amount;
          wake();
        }
      },
    };

    const intersection = new IntersectionObserver((entries) => {
      observed = Boolean(entries[0]?.isIntersecting);
      if (!observed) {
        velocity = 0;
        remainingMove = 0;
        finishDrag(false);
      }
      wake();
    });
    intersection.observe(rail);
    const resize = new ResizeObserver(measure);
    resize.observe(rail);
    for (const child of rail.children) resize.observe(child);
    const dialogObserver = new MutationObserver(() => {
      if (root?.querySelector(".leaves-dialog[open]")) {
        velocity = 0;
        remainingMove = 0;
        finishDrag(false);
      }
      wake();
    });
    if (root)
      dialogObserver.observe(root, {
        subtree: true,
        attributes: true,
        attributeFilter: ["open"],
      });
    rail.addEventListener("pointerdown", pointerDown);
    rail.addEventListener("lostpointercapture", pointerCancel);
    rail.addEventListener("click", click, true);
    rail.addEventListener("dragstart", nativeDrag);
    rail.addEventListener("focusin", focusIn);
    rail.addEventListener("focusout", focusOut);
    window.addEventListener("pointermove", pointerMove, { passive: false });
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerCancel);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", visibility);
    measure();

    return () => {
      observed = false;
      finishDrag(false);
      stop();
      runtime.current = null;
      intersection.disconnect();
      resize.disconnect();
      dialogObserver.disconnect();
      rail.removeEventListener("pointerdown", pointerDown);
      rail.removeEventListener("lostpointercapture", pointerCancel);
      rail.removeEventListener("click", click, true);
      rail.removeEventListener("dragstart", nativeDrag);
      rail.removeEventListener("focusin", focusIn);
      rail.removeEventListener("focusout", focusOut);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerCancel);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [railRef, reduced]);

  return { moveRail };
}
