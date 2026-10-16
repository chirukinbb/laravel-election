"use client";

import {type KeyboardEvent, useEffect, useRef, useState} from "react";
import {type Locale, localeDirection} from "@/i18n/locales";
import type {NomineeContribution} from "./profile-data";
import {getProfileCopy} from "./profile-copy";
import {getEnhancementCopy} from "./enhancement-copy";
import {votingNumber} from "./format";

export function ContributionGallery({
  facts,
  language,
  active,
  reduced,
  onChange,
  onOpen,
}: {
  facts: readonly NomineeContribution[];
  language: Locale;
  active: number;
  reduced: boolean;
  onChange: (index: number) => void;
  onOpen: (index: number, source: HTMLButtonElement) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const pointer = useRef("");
  const [preview, setPreview] = useState<number | null>(null);
  const initialIndex = useRef(active);
  const target = useRef<number | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    },
    [],
  );
  const settle = () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      if (target.current !== null) onChange(target.current);
      target.current = null;
      settleTimer.current = null;
    }, 120);
  };
  const words = getProfileCopy(language);
  const labels = getEnhancementCopy(language);
  const date = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  useEffect(() => {
    const root = track.current;
    const card = root?.querySelector<HTMLElement>(
      `[data-contribution-index="${initialIndex.current}"]`,
    );
    if (!root || !card) return;
    const frame = requestAnimationFrame(() => {
      const box = card.getBoundingClientRect(),
        bounds = root.getBoundingClientRect();
      root.scrollLeft +=
        box.left + box.width / 2 - bounds.left - bounds.width / 2;
    });
    return () => cancelAnimationFrame(frame);
  }, [language]);
  const goTo = (index: number) => {
    const root = track.current;
    const card = root?.querySelector<HTMLElement>(
      `[data-contribution-index="${index}"]`,
    );
    if (!root || !card) return;
    setPreview(null);
    const box = card.getBoundingClientRect();
    const frame = root.getBoundingClientRect();
    target.current = reduced ? null : index;
    root.scrollTo({
      left:
        root.scrollLeft +
        box.left +
        box.width / 2 -
        frame.left -
        frame.width / 2,
      behavior: reduced ? "instant" : "smooth",
    });
    if (reduced) onChange(index);
    else settle();
  };
  const keyboard = (event: KeyboardEvent) => {
    const nextKey =
      localeDirection(language) === "rtl" ? "ArrowLeft" : "ArrowRight";
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = Math.min(
      facts.length - 1,
      Math.max(0, active + (event.key === nextKey ? 1 : -1)),
    );
    goTo(next);
    track.current
      ?.querySelector<HTMLButtonElement>(
        `[data-contribution-index="${next}"] button`,
      )
      ?.focus({ preventScroll: true });
  };
  return (
    <div className="contribution-gallery" onKeyDown={keyboard}>
      <div
        className="contribution-gallery__track"
        ref={track}
        onScroll={() => {
          const root = track.current;
          if (!root) return;
          if (target.current !== null) {
            settle();
            return;
          }
          const frame = root.getBoundingClientRect();
          const center = frame.left + frame.width / 2;
          let nearest = active,
            distance = Infinity;
          root
            .querySelectorAll<HTMLElement>("[data-contribution-index]")
            .forEach((card, index) => {
              const box = card.getBoundingClientRect();
              const delta = Math.abs(box.left + box.width / 2 - center);
              if (delta < distance) {
                nearest = index;
                distance = delta;
              }
            });
          if (nearest !== active) onChange(nearest);
        }}
        aria-label={words.contributions}
      >
        {facts.map((fact, index) => (
          <div
            className="contribution-gallery__cell"
            data-contribution-index={index}
            data-active={active === index}
            key={fact.id}
          >
            <button
              className="contribution-card"
              type="button"
              data-revealed={preview === index}
              aria-label={`${labels.openContribution}: ${fact.description[language]}`}
              onPointerDown={(event) => {
                pointer.current = event.pointerType;
              }}
              onClick={(event) => {
                if (
                  event.detail > 0 &&
                  pointer.current === "touch" &&
                  preview !== index
                ) {
                  goTo(index);
                  setPreview(index);
                  return;
                }
                onChange(index);
                onOpen(index, event.currentTarget);
              }}
            >
              <time dateTime={fact.date}>
                {date.format(new Date(`${fact.date}T00:00:00Z`))}
              </time>
              <span className="contribution-card__caption">
                <span>{fact.description[language]}</span>
                <span className="contribution-card__open">
                  {labels.openContribution}
                  <span className="nominee-direction" aria-hidden="true">
                    ↗
                  </span>
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>
      <div className="contribution-gallery__controls">
        <button
          type="button"
          aria-label={words.previousContribution}
          disabled={active === 0}
          onClick={() => goTo(active - 1)}
        >
          <svg
            className="nominee-direction"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="m15 4-8 8 8 8" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={words.nextContribution}
          disabled={active === facts.length - 1}
          onClick={() => goTo(active + 1)}
        >
          <svg
            className="nominee-direction"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="m9 4 8 8-8 8" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
      <span className="voting-sr-only" aria-live="polite">
        {votingNumber(active + 1, language)} /{" "}
        {votingNumber(facts.length, language)}
      </span>
    </div>
  );
}
