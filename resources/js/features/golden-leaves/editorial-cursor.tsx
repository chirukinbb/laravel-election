"use client";

import {type RefObject, useEffect, useRef} from "react";
import "./editorial-cursor.css";

interface EditorialCursorProps {
  readonly rootRef: RefObject<HTMLElement | null>;
  readonly reducedMotion: boolean;
}

type CursorMode = "leaf" | "rail" | "film" | "";

/** An ornamental pointer companion; the native cursor remains available. */
export function EditorialCursor({
  rootRef,
  reducedMotion,
}: EditorialCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    if (!root || !cursor) return;

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let lastFrame = 0;
    let visible = false;
    let seenPointer = false;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const cancelFrame = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
    };
    const hide = () => {
      visible = false;
      cursor.dataset.visible = "false";
      cursor.dataset.pressed = "false";
      cancelFrame();
    };
    const paint = () => {
      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    };
    const tick = (time: number) => {
      frame = 0;
      const elapsed = lastFrame ? Math.min(64, time - lastFrame) : 16;
      lastFrame = time;
      const amount = 1 - Math.exp(-elapsed / 90);
      current.x += (target.x - current.x) * amount;
      current.y += (target.y - current.y) * amount;
      if (Math.hypot(target.x - current.x, target.y - current.y) < 0.15) {
        current.x = target.x;
        current.y = target.y;
        lastFrame = 0;
      } else {
        frame = requestAnimationFrame(tick);
      }
      paint();
    };
    const modeAtPointer = (): CursorMode => {
      if (
        !finePointer.matches ||
        document.hidden ||
        root.querySelector(".leaves-dialog[open]")
      ) {
        return "";
      }
      const hit = document.elementFromPoint(target.x, target.y);
      if (!hit || !root.contains(hit)) return "";
      if (hit.closest(".leaves-film__button")) return "film";
      const control = hit.closest(
        "a, button, input, select, textarea, [role='button']",
      );
      if (hit.closest(".leaves-rail")) {
        return !control || control.matches(".leaves-rail__item") ? "rail" : "";
      }
      if (!control && hit.closest("[data-leaf-scene]")) return "leaf";
      return "";
    };
    const update = () => {
      if (!seenPointer) return;
      const mode = modeAtPointer();
      if (!mode) {
        hide();
        return;
      }
      cursor.dataset.mode = mode;
      if (!visible || reducedMotion) {
        current.x = target.x;
        current.y = target.y;
        paint();
      } else if (!frame) {
        frame = requestAnimationFrame(tick);
      }
      visible = true;
      cursor.dataset.visible = "true";
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        hide();
        return;
      }
      seenPointer = true;
      target.x = event.clientX;
      target.y = event.clientY;
      update();
    };
    const press = (event: PointerEvent) => {
      move(event);
      if (visible && event.button === 0) cursor.dataset.pressed = "true";
    };
    const release = () => {
      cursor.dataset.pressed = "false";
      update();
    };
    const leave = () => {
      seenPointer = false;
      hide();
    };
    const dialogObserver = new MutationObserver(update);
    dialogObserver.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerenter", move, { passive: true });
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointerdown", press, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", leave);
    window.addEventListener("blur", leave);
    window.addEventListener("scroll", update, { passive: true, capture: true });
    document.addEventListener("visibilitychange", leave);
    finePointer.addEventListener("change", update);
    return () => {
      hide();
      dialogObserver.disconnect();
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerenter", move);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", leave);
      window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", update, true);
      document.removeEventListener("visibilitychange", leave);
      finePointer.removeEventListener("change", update);
    };
  }, [rootRef, reducedMotion]);

  return (
    <div
      ref={cursorRef}
      className="leaves-editorial-cursor"
      data-visible="false"
      data-pressed="false"
      aria-hidden="true"
    >
      <span className="leaves-editorial-cursor__ring" />
      <span className="leaves-editorial-cursor__orbit">360°</span>
      <span className="leaves-editorial-cursor__left">‹</span>
      <span className="leaves-editorial-cursor__right">›</span>
      <span className="leaves-editorial-cursor__play">PLAY</span>
    </div>
  );
}
