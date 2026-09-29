import {act, cleanup, fireEvent, render, screen,} from "@testing-library/react";
import {createRef} from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {AudioStoryCursor, getAudioStoryProgress,} from "@/features/home/audio-story-cursor";

let frames: Map<number, FrameRequestCallback>;
let frameId: number;
let now: number;
let hidden: boolean;
let pointerPreference: EventTarget & { matches: boolean };

beforeEach(() => {
  frames = new Map();
  frameId = 0;
  now = 0;
  hidden = false;
  pointerPreference = Object.assign(new EventTarget(), { matches: true });
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => pointerPreference),
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      frames.set(++frameId, callback);
      return frameId;
    }),
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id: number) => frames.delete(id)),
  );
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function advanceFrame(milliseconds: number) {
  now += milliseconds;
  const scheduled = [...frames.values()];
  frames.clear();
  act(() => {
    for (const callback of scheduled) callback(now);
  });
}

function pointerMove(
  element: HTMLElement,
  x: number,
  y: number,
  pointerType = "mouse",
) {
  const event = new Event("pointermove", { bubbles: true });
  Object.defineProperties(event, {
    clientX: { value: x },
    clientY: { value: y },
    pointerType: { value: pointerType },
  });
  fireEvent(element, event);
}

function mountCursor(reducedMotion = false) {
  const audioRef = createRef<HTMLAudioElement>();
  const regionRef = createRef<HTMLElement>();
  const result = render(
    <section ref={regionRef}>
      <button className="audio-exit-surface">Leave audio</button>
      <button>Sound control</button>
      <AudioStoryCursor
        audioRef={audioRef}
        regionRef={regionRef}
        initialPoint={{ x: 100, y: 100 }}
        reducedMotion={reducedMotion}
      />
      <audio ref={audioRef} />
    </section>,
  );
  const audio = audioRef.current!;
  const region = regionRef.current!;
  const cursor = screen.getByTestId("audio-story-cursor");
  const media = { currentTime: 0, duration: NaN, paused: true, ended: false };
  for (const property of [
    "currentTime",
    "duration",
    "paused",
    "ended",
  ] as const) {
    Object.defineProperty(audio, property, {
      configurable: true,
      get: () => media[property],
    });
  }
  return { ...result, audio, region, cursor, media };
}

describe("audio story progress", () => {
  it.each([
    [25, 100, 0.25],
    [120, 100, 1],
    [-10, 100, 0],
    [10, 0, 0],
    [10, -1, 0],
    [10, NaN, 0],
    [10, Infinity, 0],
    [NaN, 100, 0],
    [Infinity, 100, 0],
  ])(
    "normalizes time %s with duration %s to %s",
    (time, duration, expected) => {
      expect(getAudioStoryProgress(time, duration)).toBe(expected);
    },
  );

  it("updates an actual paused seek and clears progress when duration is unknown", () => {
    const { audio, cursor, media } = mountCursor();
    media.duration = 100;
    media.currentTime = 25;
    fireEvent.durationChange(audio);
    expect(cursor).toHaveAttribute("data-progress", "0.25");
    expect(cursor.querySelector(".audio-story-cursor__progress")).toHaveStyle({
      strokeDashoffset: "0.75",
    });

    media.currentTime = 50;
    advanceFrame(1_000);
    expect(cursor).toHaveAttribute("data-progress", "0.25");
    fireEvent.seeking(audio);
    expect(cursor).toHaveAttribute("data-progress", "0.5");

    media.duration = Infinity;
    fireEvent.durationChange(audio);
    expect(cursor).toHaveAttribute("data-progress", "0");
    media.duration = NaN;
    fireEvent.emptied(audio);
    expect(cursor).toHaveAttribute("data-progress", "0");
  });

  it("samples actual playing time without extrapolating wall-clock progress", () => {
    const { audio, cursor, media } = mountCursor();
    media.duration = 100;
    media.currentTime = 10;
    media.paused = false;
    fireEvent.play(audio);
    expect(frames.size).toBe(1);
    advanceFrame(500);
    expect(cursor).toHaveAttribute("data-progress", "0.1");

    media.currentTime = 25;
    advanceFrame(16);
    expect(cursor).toHaveAttribute("data-progress", "0.25");
    media.paused = true;
    fireEvent.pause(audio);
    expect(frames.size).toBe(0);
    advanceFrame(5_000);
    expect(cursor).toHaveAttribute("data-progress", "0.25");
  });
});

describe("audio cursor pointer lifecycle", () => {
  it("starts at the activating point and eases toward the real mouse position", () => {
    const { cursor } = mountCursor();
    expect(cursor).toHaveAttribute("aria-hidden", "true");
    expect(cursor.style.transform).toBe("translate3d(60px, 60px, 0)");
    pointerMove(screen.getByRole("button", { name: "Leave audio" }), 200, 100);
    expect(cursor.style.transform).toBe("translate3d(60px, 60px, 0)");
    advanceFrame(100);
    const translatedX = parseFloat(
      cursor.style.transform.slice("translate3d(".length),
    );
    expect(translatedX).toBeCloseTo(60 + 100 * (1 - Math.exp(-1)), 5);
  });

  it("snaps directly with reduced motion", () => {
    const { cursor } = mountCursor(true);
    pointerMove(screen.getByRole("button", { name: "Leave audio" }), 200, 180);
    expect(cursor.style.transform).toBe("translate3d(160px, 140px, 0)");
    expect(frames.size).toBe(0);
  });

  it("hides over controls, on touch and on pointer leave, preserving the exit surface exception", () => {
    const { cursor, region } = mountCursor();
    const exit = screen.getByRole("button", { name: "Leave audio" });
    pointerMove(
      screen.getByRole("button", { name: "Sound control" }),
      180,
      150,
    );
    expect(cursor).toHaveAttribute("data-visible", "false");
    expect(region.dataset.audioCursorVisible).toBeUndefined();
    pointerMove(exit, 210, 170);
    expect(cursor).toHaveAttribute("data-visible", "true");
    expect(region.dataset.audioCursorVisible).toBe("true");
    pointerMove(exit, 220, 180, "touch");
    expect(cursor).toHaveAttribute("data-visible", "false");
    pointerMove(exit, 230, 190);
    fireEvent.pointerLeave(region);
    expect(cursor).toHaveAttribute("data-visible", "false");
  });

  it("does not create a visible cursor for coarse pointers", () => {
    pointerPreference.matches = false;
    const { cursor, region } = mountCursor();
    pointerMove(screen.getByRole("button", { name: "Leave audio" }), 200, 100);
    expect(cursor).toHaveAttribute("data-visible", "false");
    expect(region.dataset.audioCursorVisible).toBeUndefined();
    expect(frames.size).toBe(0);
  });

  it("cleans scheduled work and cannot reappear after document hide or unmount", () => {
    const { cursor, region, audio, media, unmount } = mountCursor();
    media.paused = false;
    fireEvent.play(audio);
    hidden = true;
    fireEvent(document, new Event("visibilitychange"));
    expect(cursor).toHaveAttribute("data-visible", "false");
    expect(frames.size).toBe(0);
    hidden = false;
    fireEvent(document, new Event("visibilitychange"));
    expect(cursor).toHaveAttribute("data-visible", "false");

    pointerMove(screen.getByRole("button", { name: "Leave audio" }), 220, 150);
    const staleFrame = [...frames.values()][0]!;
    expect(region.dataset.audioCursorVisible).toBe("true");
    unmount();
    expect(frames.size).toBe(0);
    act(() => staleFrame(now + 100));
    fireEvent(document, new Event("visibilitychange"));
    pointerMove(region, 250, 160);
    expect(region.dataset.audioCursorVisible).toBeUndefined();
    expect(frames.size).toBe(0);
  });
});
