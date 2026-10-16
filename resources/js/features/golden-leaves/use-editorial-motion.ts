"use client";

import {type RefObject, useEffect} from "react";

/** Native scrolling remains the source of truth; decorative motion never traps it. */
export function useEditorialMotion(
  rootRef: RefObject<HTMLElement | null>,
  reduced: boolean,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const drifting = [...root.querySelectorAll<HTMLElement>("[data-parallax]")];
    const reveals = [...root.querySelectorAll<HTMLElement>("[data-reveal]")];
    const wide = root.querySelector<HTMLElement>(".leaves-wide");
    const meter = root.querySelector<HTMLElement>(".leaves-progress__fill");
    let frame = 0;
    let disposed = false;
    const update = () => {
      frame = 0;
      if (disposed) return;
      const height = window.innerHeight;
      const travel = Math.max(1, root.scrollHeight - height);
      meter?.style.setProperty(
        "transform",
        `scaleY(${Math.max(0, Math.min(1, window.scrollY / travel))})`,
      );
      for (const node of drifting) {
        const bounds = node.getBoundingClientRect();
        const previousOffset =
          parseFloat(node.style.getPropertyValue("--editorial-drift")) || 0;
        const position =
          (height / 2 - (bounds.top - previousOffset) - bounds.height / 2) /
          height;
        const offset = reduced
          ? 0
          : Math.max(-1.25, Math.min(1.25, position)) *
            Number(node.dataset.parallax);
        node.style.setProperty("--editorial-drift", `${offset.toFixed(2)}px`);
      }
      if (wide) {
        const box = wide.getBoundingClientRect();
        const progress = Math.max(
          0,
          Math.min(1, -box.top / Math.max(1, box.height - height * 0.8)),
        );
        wide.style.setProperty(
          "--media-scale",
          String(reduced ? 1 : 1 - progress * 0.3),
        );
        wide.style.setProperty(
          "--media-travel",
          `${reduced ? 0 : (progress - 0.5) * 5}%`,
        );
      }
    };
    const schedule = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.12 },
    );
    for (const node of reveals) {
      if (reduced) node.dataset.visible = "true";
      else observer.observe(node);
    }
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [rootRef, reduced]);
}
