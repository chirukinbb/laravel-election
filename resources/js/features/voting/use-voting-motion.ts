"use client";

import {type RefObject, useEffect} from "react";

/** Native scrolling stays in charge; only visual properties are animated. */
export function useVotingMotion(
  heroRef: RefObject<HTMLElement | null>,
  workspaceRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const hero = heroRef.current;
    const workspace = workspaceRef.current;
    if (!hero || !workspace || !("IntersectionObserver" in window)) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let inView = true;

    const draw = () => {
      frame = 0;
      if (preference.matches) return;
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      hero.style.setProperty("--v-hero-opacity", String(1 - progress * 0.85));
      hero.style.setProperty("--v-hero-shift", `${progress * 42}px`);
    };
    const schedule = () => {
      if (!frame && inView && !preference.matches)
        frame = requestAnimationFrame(draw);
    };
    const updatePreference = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      hero.style.removeProperty("--v-hero-opacity");
      hero.style.removeProperty("--v-hero-shift");
      if (preference.matches) workspace.dataset["revealed"] = "true";
      else schedule();
    };
    const heroObserver = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      schedule();
    });
    const revealObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        workspace.dataset["revealed"] = "true";
        revealObserver.disconnect();
      },
      { rootMargin: "0px 0px -40px 0px" },
    );

    // Opt into a reveal only after the observer is ready; SSR stays readable.
    workspace.dataset["motion"] = "ready";
    workspace.dataset["revealed"] = String(
      preference.matches || workspace.getBoundingClientRect().top < innerHeight,
    );
    heroObserver.observe(hero);
    revealObserver.observe(workspace);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    preference.addEventListener("change", updatePreference);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      heroObserver.disconnect();
      revealObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", updatePreference);
      hero.style.removeProperty("--v-hero-opacity");
      hero.style.removeProperty("--v-hero-shift");
      delete workspace.dataset["motion"];
      delete workspace.dataset["revealed"];
    };
  }, [heroRef, workspaceRef]);
}
