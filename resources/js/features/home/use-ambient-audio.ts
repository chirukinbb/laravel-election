"use client";

import {type RefObject, useEffect, useRef} from "react";

export interface UseAmbientAudioOptions {
  readonly audioRef: RefObject<HTMLAudioElement | null>;
  readonly enabled: boolean;
  readonly hidden: boolean;
  readonly ducked: boolean;
  readonly onPlaybackError: () => void;
}

const FADE_DURATION = 600;
const NORMAL_VOLUME = 0.22;
const DUCKED_VOLUME = 0.045;

export function useAmbientAudio({
  audioRef,
  enabled,
  hidden,
  ducked,
  onPlaybackError,
}: UseAmbientAudioOptions) {
  const frameRef = useRef<number | null>(null);
  const generationRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;
    return () => {
      generationRef.current += 1;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      audio.volume = 0;
      audio.pause();
    };
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const generation = ++generationRef.current;
    const isCurrent = () => generationRef.current === generation;
    const cancelFrame = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
    const silence = () => {
      audio.volume = 0;
      audio.pause();
    };
    cancelFrame();

    const fadeTo = (target: number) => {
      if (!isCurrent()) return;
      const from = audio.volume;
      if (from === target) {
        if (target === 0) audio.pause();
        return;
      }
      const started = performance.now();
      const tick = (now: number) => {
        if (!isCurrent()) return;
        frameRef.current = null;
        const progress = Math.min(
          1,
          Math.max(0, (now - started) / FADE_DURATION),
        );
        const eased = (1 - Math.cos(Math.PI * progress)) / 2;
        audio.volume = from + (target - from) * eased;
        if (progress < 1) frameRef.current = requestAnimationFrame(tick);
        else {
          audio.volume = target;
          if (target === 0) audio.pause();
        }
      };
      frameRef.current = requestAnimationFrame(tick);
    };
    const failPlayback = () => {
      if (!isCurrent()) return;
      cancelFrame();
      silence();
      onPlaybackError();
    };

    if (hidden) silence();
    else if (!enabled) fadeTo(0);
    else {
      if (audio.paused) audio.volume = 0;
      try {
        // Calling play on an already-playing element never resets its timeline.
        // Wait for actual playback before fading up from a paused state.
        void Promise.resolve(audio.play()).then(
          () => fadeTo(ducked ? DUCKED_VOLUME : NORMAL_VOLUME),
          failPlayback,
        );
      } catch {
        failPlayback();
      }
    }

    return () => {
      if (!isCurrent()) return;
      generationRef.current += 1;
      cancelFrame();
      // Keep the current volume/playback so the next ramp can reverse smoothly.
    };
  }, [audioRef, enabled, hidden, ducked, onPlaybackError]);
}
