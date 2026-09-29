"use client";

import {useEffect, useRef} from "react";
import type {HomeLanguage} from "@/features/home/copy";
import {votingStoryCopy} from "./voting-story-copy";
import "./voting-story.css";

interface VotingStoryProps {
  language: HomeLanguage;
  onViewNominees: () => void;
}

/** Native document scrolling, enhanced without a scroll-driven React render. */
function useStoryMotion() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reveals = Array.from(
      section.querySelectorAll<HTMLElement>("[data-v-story-reveal]"),
    );
    const media = Array.from(
      section.querySelectorAll<HTMLElement>("[data-v-story-parallax]"),
    ).map((frame) => ({
      frame,
      content: frame.querySelector<HTMLElement>(".v-story__media-content"),
    }));
    let stopMotion = () => {};

    const configureMotion = () => {
      stopMotion();
      stopMotion = () => {};
      if (preference.matches) {
        for (const element of reveals) element.dataset.vStoryReveal = "visible";
        return;
      }

      let frameId = 0;
      const renderParallax = () => {
        frameId = 0;
        const height = window.innerHeight;
        const travel = window.innerWidth < 768 ? 15 : 28;
        // Measure every frame before writing any transforms.
        const offsets = media.map(({ frame }) => {
          const bounds = frame.getBoundingClientRect();
          if (bounds.bottom < 0 || bounds.top > height) return null;
          const position =
            (height / 2 - bounds.top - bounds.height / 2) / height;
          return Math.max(-1, Math.min(1, position)) * travel;
        });
        media.forEach(({ content }, index) => {
          const offset = offsets[index];
          if (offset !== null && offset !== undefined) {
            content?.style.setProperty(
              "--v-story-parallax",
              `${offset.toFixed(2)}px`,
            );
          }
        });
      };
      const scheduleParallax = () => {
        if (!frameId) frameId = window.requestAnimationFrame(renderParallax);
      };

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            (entry.target as HTMLElement).dataset.vStoryReveal = "visible";
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.04, rootMargin: "0px 0px -5% 0px" },
      );

      for (const element of reveals) {
        const bounds = element.getBoundingClientRect();
        if (
          element.dataset.vStoryReveal === "visible" ||
          bounds.top < window.innerHeight * 0.95
        ) {
          element.dataset.vStoryReveal = "visible";
        } else {
          element.dataset.vStoryReveal = "waiting";
          observer.observe(element);
        }
      }

      section.classList.add("v-story--motion");
      window.addEventListener("scroll", scheduleParallax, { passive: true });
      window.addEventListener("resize", scheduleParallax, { passive: true });
      scheduleParallax();

      stopMotion = () => {
        observer.disconnect();
        window.removeEventListener("scroll", scheduleParallax);
        window.removeEventListener("resize", scheduleParallax);
        window.cancelAnimationFrame(frameId);
        section.classList.remove("v-story--motion");
        for (const { content } of media) {
          content?.style.removeProperty("--v-story-parallax");
        }
      };
    };

    configureMotion();
    preference.addEventListener("change", configureMotion);
    return () => {
      stopMotion();
      preference.removeEventListener("change", configureMotion);
      for (const element of reveals) delete element.dataset.vStoryReveal;
    };
  }, []);

  return sectionRef;
}

function MediaPlaceholder({
  className,
  caption,
}: {
  className: string;
  caption: string;
}) {
  return (
    <figure className={`v-story__figure ${className}`} data-v-story-reveal>
      <div className="v-story__media" data-v-story-parallax aria-hidden="true">
        <div className="v-story__media-content" />
      </div>
      <figcaption className="v-story__caption">{caption}</figcaption>
    </figure>
  );
}

export function VotingStory({ language, onViewNominees }: VotingStoryProps) {
  const copy = votingStoryCopy[language];
  const sectionRef = useStoryMotion();

  return (
    <section
      id="voting-story"
      className="v-story"
      ref={sectionRef}
      aria-labelledby="voting-story-title"
      tabIndex={-1}
    >
      <header className="v-story__introduction" data-v-story-reveal>
        <p className="v-story__eyebrow">{copy.eyebrow}</p>
        <h2 id="voting-story-title" className="v-story__title">
          <span>{copy.title[0]}</span>
          <span>{copy.title[1]}</span>
        </h2>
        <p className="v-story__lead">{copy.introduction}</p>
      </header>

      <MediaPlaceholder
        className="v-story__landscape"
        caption={copy.landscapeCaption}
      />

      <div className="v-story__award">
        <div className="v-story__award-copy" data-v-story-reveal>
          <p className="v-story__eyebrow">{copy.awardEyebrow}</p>
          <h3 className="v-story__award-title">
            <span>{copy.awardTitle[0]}</span>
            <span>{copy.awardTitle[1]}</span>
          </h3>
          <p className="v-story__body">{copy.awardBody}</p>
          <p className="v-story__body v-story__body--muted">
            {copy.awardSecond}
          </p>
        </div>
        <MediaPlaceholder
          className="v-story__portrait"
          caption={copy.portraitCaption}
        />
        <MediaPlaceholder
          className="v-story__detail"
          caption={copy.detailCaption}
        />
        <div className="v-story__reflection" data-v-story-reveal>
          <h3 className="v-story__reflection-title">
            <span>{copy.statement[0]}</span>
            <span>{copy.statement[1]}</span>
          </h3>
          <p className="v-story__body">{copy.statementBody}</p>
        </div>
      </div>

      <div className="v-story__participation">
        <header className="v-story__process-heading" data-v-story-reveal>
          <p className="v-story__eyebrow">{copy.processEyebrow}</p>
          <h3>{copy.processTitle}</h3>
        </header>
        <ol className="v-story__steps">
          {copy.steps.map((step, index) => (
            <li className="v-story__step" key={index} data-v-story-reveal>
              <span className="v-story__step-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h4>{step.title}</h4>
              <p className="v-story__body">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="v-story__preview-note">{copy.previewNote}</p>

      <section
        id="voting-ending"
        className="v-story__ending"
        aria-labelledby="voting-ending-title"
      >
        <div data-v-story-reveal>
          <h2 id="voting-ending-title" className="v-story__ending-title">
            {copy.returnTitle}
          </h2>
          <button
            className="v-story__return-button"
            type="button"
            onClick={onViewNominees}
          >
            <span className="v-story__return-label">
              <span>{copy.returnAction}</span>
              <span aria-hidden="true">{copy.returnAction}</span>
            </span>
          </button>
        </div>
      </section>
    </section>
  );
}
