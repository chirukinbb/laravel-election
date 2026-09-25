import {act, cleanup, fireEvent, render} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {AudioStoryBackdrop, type AudioStoryBackdropProps,} from "./audio-story-backdrop";

const defaults: AudioStoryBackdropProps = {
  active: false,
  hidden: false,
  reducedMotion: false,
  preload: false,
  dayPoster: "/day.webp",
  nightPoster: "/night.webp",
  sources: {
    video: "/transition.mp4",
    videoSmall: "/transition-small.mp4",
    webm: "/transition.webm",
    webmSmall: "/transition-small.webm",
  },
};

let frameCallbacks: Map<number, VideoFrameRequestCallback>;
let frameId: number;
const originalRequest = Object.getOwnPropertyDescriptor(
  HTMLVideoElement.prototype,
  "requestVideoFrameCallback",
);
const originalCancel = Object.getOwnPropertyDescriptor(
  HTMLVideoElement.prototype,
  "cancelVideoFrameCallback",
);

beforeEach(() => {
  vi.useFakeTimers();
  frameCallbacks = new Map();
  frameId = 0;
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
  vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(
    1920,
  );
  Object.defineProperties(HTMLVideoElement.prototype, {
    requestVideoFrameCallback: {
      configurable: true,
      value: (callback: VideoFrameRequestCallback) => {
        frameCallbacks.set(++frameId, callback);
        return frameId;
      },
    },
    cancelVideoFrameCallback: {
      configurable: true,
      value: (id: number) => frameCallbacks.delete(id),
    },
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  for (const [name, descriptor] of [
    ["requestVideoFrameCallback", originalRequest],
    ["cancelVideoFrameCallback", originalCancel],
  ] as const) {
    if (descriptor)
      Object.defineProperty(HTMLVideoElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLVideoElement.prototype, name);
  }
});

function setup(changes: Partial<AudioStoryBackdropProps> = {}) {
  let props = { ...defaults, ...changes };
  const view = render(<AudioStoryBackdrop {...props} />);
  const plate = view.getByTestId("audio-story-backdrop");
  const video = view.getByTestId("audio-story-transition") as HTMLVideoElement;
  const update = (next: Partial<AudioStoryBackdropProps>) => {
    props = { ...props, ...next };
    view.rerender(<AudioStoryBackdrop {...props} />);
  };
  return { ...view, plate, video, update };
}

function decodeFrame() {
  const callbacks = [...frameCallbacks.values()];
  frameCallbacks.clear();
  act(() => {
    callbacks.forEach((callback) =>
      callback(performance.now(), {} as VideoFrameCallbackMetadata),
    );
  });
}

describe("Audio Story cinematic backdrop", () => {
  it("defers sources until Explore and lets the browser select one rendition", () => {
    const { video, update } = setup();
    expect(video.querySelectorAll("source")).toHaveLength(0);
    expect(video.preload).toBe("none");
    expect(video.play).not.toHaveBeenCalled();
    update({ preload: true });
    expect(video.querySelectorAll("source")).toHaveLength(4);
    expect(video.firstElementChild).toHaveAttribute(
      "media",
      "(max-width: 760px)",
    );
    expect(video.firstElementChild).toHaveAttribute(
      "src",
      "/transition-small.webm",
    );
    expect(video.preload).toBe("auto");
    expect(video.play).not.toHaveBeenCalled();
  });

  it("shows only decoded frames and holds the last frame after the clip ends", () => {
    const { plate, video } = setup({ active: true });
    expect(plate).toHaveAttribute("data-state", "loading");
    expect(video).toHaveAttribute("data-visible", "false");
    fireEvent.playing(video);
    expect(video).toHaveAttribute("data-visible", "false");
    decodeFrame();
    expect(plate).toHaveAttribute("data-state", "playing");
    expect(video).toHaveAttribute("data-visible", "true");
    video.currentTime = 4.0417;
    fireEvent.ended(video);
    expect(plate).toHaveAttribute("data-state", "settled");
    expect(plate).toHaveAttribute("data-active", "true");
    expect(video).toHaveAttribute("data-visible", "true");
    expect(video.currentTime).toBe(4.0417);
    act(() => vi.advanceTimersByTime(20_000));
    expect(plate).toHaveAttribute("data-state", "settled");
  });

  it("retains the exit frame throughout the fade and restarts on reentry", () => {
    const { video, plate, update } = setup({ active: true, preload: true });
    decodeFrame();
    video.currentTime = 2;
    update({ active: false });
    expect(video).toHaveAttribute("data-visible", "true");
    expect(video.currentTime).toBe(2);
    act(() => vi.advanceTimersByTime(500));
    update({ active: true });
    expect(video.currentTime).toBe(0);
    expect(video).toHaveAttribute("data-visible", "false");
    decodeFrame();
    act(() => vi.advanceTimersByTime(600));
    expect(plate).toHaveAttribute("data-state", "playing");
    update({ active: false });
    act(() => vi.advanceTimersByTime(1_100));
    expect(plate).toHaveAttribute("data-state", "idle");
    expect(video).toHaveAttribute("data-visible", "false");
  });

  it("skips all video sources for reduced motion and reveals the night still", () => {
    const { video, plate } = setup({ active: true, reducedMotion: true });
    expect(video.querySelectorAll("source")).toHaveLength(0);
    expect(video.play).not.toHaveBeenCalled();
    expect(plate).toHaveAttribute("data-state", "settled");
    expect(plate.querySelector(".audio-story-backdrop__night")).toHaveAttribute(
      "data-visible",
      "true",
    );
  });

  it("pauses playback and the watchdog while hidden, then resumes in place", () => {
    const { video, plate, update } = setup({ active: true });
    decodeFrame();
    video.currentTime = 1.25;
    update({ hidden: true });
    act(() => vi.advanceTimersByTime(60_000));
    expect(plate).toHaveAttribute("data-state", "playing");
    expect(video.currentTime).toBe(1.25);
    expect(frameCallbacks.size).toBe(0);
    update({ hidden: false });
    expect(video.play).toHaveBeenCalledTimes(2);
    expect(video.currentTime).toBe(1.25);
    act(() => vi.advanceTimersByTime(7_500));
    expect(plate).toHaveAttribute("data-state", "playing");
    act(() => vi.advanceTimersByTime(500));
    expect(plate).toHaveAttribute("data-state", "fallback");
  });

  it("restarts the stall deadline only when the playhead advances", () => {
    const { video, plate } = setup({ active: true });
    decodeFrame();
    act(() => vi.advanceTimersByTime(7_000));
    video.currentTime = 0.5;
    fireEvent.timeUpdate(video);
    act(() => vi.advanceTimersByTime(7_000));
    expect(plate).toHaveAttribute("data-state", "playing");
    fireEvent.timeUpdate(video);
    act(() => vi.advanceTimersByTime(1_000));
    expect(plate).toHaveAttribute("data-state", "fallback");
  });

  it("ignores a stale playback rejection and frame callback after exit", async () => {
    let reject!: (error: Error) => void;
    vi.mocked(HTMLMediaElement.prototype.play).mockReturnValueOnce(
      new Promise((_, rejectPromise) => {
        reject = rejectPromise;
      }),
    );
    const { plate, video, update } = setup({ active: true, preload: true });
    const staleFrame = [...frameCallbacks.values()][0]!;
    update({ active: false });
    await act(async () => reject(new Error("old play request")));
    act(() => staleFrame(0, {} as VideoFrameCallbackMetadata));
    expect(plate).not.toHaveAttribute("data-state", "fallback");
    expect(video).toHaveAttribute("data-visible", "false");
    act(() => vi.advanceTimersByTime(1_100));
    expect(plate).toHaveAttribute("data-state", "idle");
  });

  it("falls back safely after a current playback rejection", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
      new Error("unsupported media"),
    );
    const { plate, video } = setup({ active: true });
    await act(async () => {
      await Promise.resolve();
    });
    expect(plate).toHaveAttribute("data-state", "fallback");
    expect(video.pause).toHaveBeenCalled();
    expect(frameCallbacks.size).toBe(0);
  });
});
