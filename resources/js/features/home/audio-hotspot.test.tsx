import {act, cleanup, fireEvent, render, screen,} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {AudioHotspot} from "./audio-hotspot";

let frames: Map<number, FrameRequestCallback>;
let frameId: number;
let now: number;
let hidden: boolean;
let preference: EventTarget & { matches: boolean };

beforeEach(() => {
  frames = new Map();
  frameId = 0;
  now = 0;
  hidden = false;
  preference = Object.assign(new EventTarget(), { matches: true });
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => preference),
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
  vi.stubGlobal("innerWidth", 1024);
  vi.stubGlobal("innerHeight", 768);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function advance(milliseconds: number) {
  now += milliseconds;
  const scheduled = [...frames.values()];
  frames.clear();
  act(() => scheduled.forEach((callback) => callback(now)));
}

function pointer(x: number, y = 300, pointerType = "mouse") {
  const event = new Event("pointermove", { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    clientX: { value: x },
    clientY: { value: y },
    pointerType: { value: pointerType },
  });
  fireEvent(document, event);
  return event;
}

function offset(button: HTMLElement, axis: "x" | "y" = "x") {
  return Number.parseFloat(button.style.getPropertyValue(`--hotspot-${axis}`));
}

function setup(reducedMotion = false, reference = false) {
  const onActivate = vi.fn();
  const rendered = render(
    <AudioHotspot
      label="Listen to the story"
      onActivate={onActivate}
      reducedMotion={reducedMotion}
      reference={reference}
    />,
  );
  const button = screen.getByRole("button", { name: "Listen to the story" });
  const center = { x: 400, y: 300 };
  const measure = vi
    .spyOn(button, "getBoundingClientRect")
    .mockImplementation(() => {
      const left = center.x + offset(button) - 24;
      const top = center.y + offset(button, "y") - 24;
      return {
        left,
        top,
        width: 48,
        height: 48,
        x: left,
        y: top,
        right: left + 48,
        bottom: top + 48,
        toJSON: () => ({}),
      };
    });
  return { ...rendered, button, onActivate, center, measure };
}

describe("audio hotspot", () => {
  it("keeps one decorative ring and core inside a semantic activation button", () => {
    const { button, onActivate } = setup(false, true);
    expect(button).toHaveClass("audio-hotspot", "audio-hotspot--reference");
    expect(button.querySelectorAll(".hotspot-ring")).toHaveLength(1);
    expect(button.querySelectorAll(".hotspot-core")).toHaveLength(1);
    expect(button).toHaveAccessibleName("Listen to the story");
    expect(button.textContent).toBe("");
    expect(button).not.toHaveAttribute("title");
    expect(button.querySelector(".hotspot-ring")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(button).toHaveAttribute("data-magnetic-active", "false");
    fireEvent.click(button, { clientX: 400, clientY: 300 });
    expect(onActivate).toHaveBeenCalledOnce();
    expect(onActivate.mock.calls[0]?.[0].clientX).toBe(400);
    expect(onActivate.mock.calls[0]?.[0].defaultPrevented).toBe(false);
  });

  it("eases toward the mouse without reading layout each frame or drifting its anchor", () => {
    const { button, measure } = setup();
    const event = pointer(450);
    expect(event.defaultPrevented).toBe(false);
    expect(button).toHaveAttribute("data-magnetic-active", "true");
    expect(offset(button)).toBe(0);
    advance(120);
    expect(offset(button)).toBeGreaterThan(8);
    expect(offset(button)).toBeLessThan(10);
    pointer(450);
    advance(1200);
    expect(offset(button)).toBeCloseTo(14, 4);
    pointer(450);
    advance(1200);
    expect(offset(button)).toBeCloseTo(14, 4);
    expect(measure).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });

  it("caps travel and smoothly returns to its original position outside the near zone", () => {
    const { button } = setup();
    pointer(480);
    advance(1200);
    expect(offset(button)).toBe(18);
    pointer(700);
    expect(button).toHaveAttribute("data-magnetic-active", "false");
    expect(offset(button)).toBe(18);
    advance(120);
    expect(offset(button)).toBeGreaterThan(0);
    expect(offset(button)).toBeLessThan(18);
    advance(1200);
    expect(offset(button)).toBe(0);
    expect(frames.size).toBe(0);
  });

  it("keeps the full hit area inside the viewport near its right edge", () => {
    const { button, center } = setup();
    center.x = 990;
    pointer(1020);
    advance(1200);
    expect(offset(button)).toBe(6);
    expect(button.getBoundingClientRect().right).toBe(1020);
  });

  it("invalidates cached geometry after resize and follows the new stable anchor", () => {
    const { button, center, measure } = setup();
    pointer(450);
    advance(1200);
    center.x = 600;
    fireEvent(window, new Event("resize"));
    expect(offset(button)).toBe(0);
    pointer(650);
    advance(1200);
    expect(offset(button)).toBeCloseTo(14, 4);
    expect(measure).toHaveBeenCalledTimes(2);
  });

  it("allows an instant proximity ring with reduced motion but never translates", () => {
    const { button } = setup(true);
    pointer(450);
    expect(button).toHaveAttribute("data-magnetic-active", "true");
    expect(offset(button)).toBe(0);
    expect(frames.size).toBe(0);
    pointer(700);
    expect(button).toHaveAttribute("data-magnetic-active", "false");
  });

  it("ignores touch, pen and coarse pointers and resets when pointer capability changes", () => {
    const { button } = setup();
    pointer(450, 300, "touch");
    pointer(450, 300, "pen");
    expect(button).toHaveAttribute("data-magnetic-active", "false");
    expect(frames.size).toBe(0);
    preference.matches = false;
    pointer(450);
    expect(offset(button)).toBe(0);
    preference.matches = true;
    pointer(450);
    advance(120);
    preference.matches = false;
    act(() => preference.dispatchEvent(new Event("change")));
    expect(offset(button)).toBe(0);
    expect(frames.size).toBe(0);
  });

  it("returns on pointer exit and stops immediately on blur or document hiding", () => {
    const { button } = setup();
    pointer(450);
    advance(120);
    fireEvent(document, new Event("pointerout"));
    advance(1200);
    expect(offset(button)).toBe(0);
    pointer(450);
    advance(120);
    fireEvent(window, new Event("blur"));
    expect(offset(button)).toBe(0);
    expect(frames.size).toBe(0);
    pointer(450);
    advance(120);
    hidden = true;
    fireEvent(document, new Event("visibilitychange"));
    expect(offset(button)).toBe(0);
    expect(button).toHaveAttribute("data-magnetic-active", "false");
    hidden = false;
    fireEvent(document, new Event("visibilitychange"));
    expect(frames.size).toBe(0);
  });

  it("removes listeners and cancels pending frames without allowing a stale callback to resume", () => {
    const { button, unmount } = setup();
    pointer(450);
    const stale = [...frames.values()][0]!;
    unmount();
    expect(frames.size).toBe(0);
    stale(1000);
    pointer(450);
    expect(offset(button)).toBe(0);
    expect(button).toHaveAttribute("data-magnetic-active", "false");
    expect(frames.size).toBe(0);
  });
});
