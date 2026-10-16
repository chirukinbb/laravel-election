"use client";

import {useEffect, useRef, useState} from "react";
import type {Locale} from "@/i18n/locales";
import type {NomineeContribution} from "./profile-data";
import {getProfileCopy} from "./profile-copy";
import {getEnhancementCopy} from "./enhancement-copy";
import {votingNumber} from "./format";

export function ContributionDetail({
  fact,
  index,
  language,
  source,
  reduced,
  onClose,
}: {
  fact: NomineeContribution;
  index: number;
  language: Locale;
  source: HTMLButtonElement;
  reduced: boolean;
  onClose: () => void;
}) {
  const panel = useRef<HTMLElement>(null);
  const animation = useRef<Animation | null>(null);
  const [closing, setClosing] = useState(false);
  const words = getProfileCopy(language);
  const labels = getEnhancementCopy(language);
  const originClip = () => {
    const frame = panel.current?.getBoundingClientRect();
    const card = source.getBoundingClientRect();
    if (!frame) return "inset(45% 40% 45% 40%)";
    return `inset(${Math.max(0, card.top - frame.top)}px ${Math.max(0, frame.right - card.right)}px ${Math.max(0, frame.bottom - card.bottom)}px ${Math.max(0, card.left - frame.left)}px round 3px)`;
  };
  useEffect(() => {
    const element = panel.current;
    let disposed = false;
    const focus = () => {
      if (!disposed) panel.current?.focus({ preventScroll: true });
    };
    if (element && !reduced) {
      const frame = element.getBoundingClientRect();
      const card = source.getBoundingClientRect();
      const clip = `inset(${Math.max(0, card.top - frame.top)}px ${Math.max(0, frame.right - card.right)}px ${Math.max(0, frame.bottom - card.bottom)}px ${Math.max(0, card.left - frame.left)}px round 3px)`;
      animation.current = element.animate(
        [
          { clipPath: clip, opacity: 0.2 },
          { clipPath: "inset(0px 0px 0px 0px round 0px)", opacity: 1 },
        ],
        { duration: 720, easing: "cubic-bezier(.19,1,.22,1)", fill: "both" },
      );
      // Move focus after the card and its text have fully unfolded.
      void Promise.all(
        element.getAnimations({ subtree: true }).map((item) => item.finished),
      ).then(focus, () => {});
    } else {
      focus();
    }
    return () => {
      disposed = true;
      animation.current?.cancel();
    };
  }, [reduced, source]);
  const close = () => {
    if (closing) return;
    const finish = () => {
      onClose();
      requestAnimationFrame(() => source.focus({ preventScroll: true }));
    };
    if (reduced || !panel.current) {
      finish();
      return;
    }
    setClosing(true);
    animation.current?.cancel();
    animation.current = panel.current.animate(
      [
        { clipPath: "inset(0px 0px 0px 0px round 0px)", opacity: 1 },
        { clipPath: originClip(), opacity: 0 },
      ],
      { duration: 480, easing: "cubic-bezier(.6,0,.3,1)", fill: "both" },
    );
    void animation.current.finished.then(finish, () => {});
  };
  return (
    <section
      ref={panel}
      className="contribution-detail"
      aria-labelledby="contribution-detail-title"
      tabIndex={-1}
      data-closing={closing}
      inert={closing}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      <button
        className="contribution-detail__close"
        type="button"
        aria-label={labels.closeContribution}
        onClick={close}
      >
        ×
      </button>
      <span className="contribution-detail__number" aria-hidden="true">
        {votingNumber(index + 1, language, 2)}
      </span>
      <div className="contribution-detail__copy">
        <p className="voting-kicker">
          <time dateTime={fact.date}>
            {new Intl.DateTimeFormat(language, {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            }).format(new Date(`${fact.date}T00:00:00Z`))}
          </time>
        </p>
        <h5 id="contribution-detail-title">{fact.description[language]}</h5>
        <div className="contribution-detail__beneficiaries">
          <p className="voting-kicker">{words.factsBeneficiaries}</p>
          <p>{fact.beneficiaries[language]}</p>
        </div>
      </div>
    </section>
  );
}
