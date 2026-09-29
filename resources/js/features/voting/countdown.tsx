"use client";
import {useEffect, useState} from "react";
import type {HomeLanguage} from "@/features/home/copy";
import {votingCopy} from "./copy";
import {DEMO_ROUND, remainingTime} from "./voting-model";

export function Countdown({
  language,
  onClose,
}: {
  readonly language: HomeLanguage;
  readonly onClose?: () => void;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (time >= Date.parse(DEMO_ROUND.endsAt)) onClose?.();
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [onClose]);
  const copy = votingCopy[language];
  const labels = [copy.days, copy.hours, copy.minutes, copy.seconds];
  const values = now === null ? [90, 0, 0, 0] : remainingTime(now);
  return (
    <div className="voting-countdown" aria-label={copy.closes}>
      <p className="voting-kicker">{copy.closes}</p>
      <div className="voting-countdown__digits" role="timer" aria-live="off">
        {values.map((value, index) => (
          <div key={labels[index]}>
            <span>{String(value).padStart(2, "0")}</span>
            <small>{labels[index]}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
