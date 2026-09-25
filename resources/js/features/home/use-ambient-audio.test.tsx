import {act, cleanup, renderHook} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {useAmbientAudio} from "./use-ambient-audio";

let frames: Map<number, FrameRequestCallback>;
let now: number;
let frameId: number;

beforeEach(() => {
  frames = new Map();
  now = 0;
  frameId = 0;
  vi.spyOn(performance, "now").mockImplementation(() => now);
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

async function settlePlayback() {
  await act(async () => {
    await Promise.resolve();
  });
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

interface Settings {
  enabled: boolean;
  hidden: boolean;
  ducked: boolean;
}

function setup(
  enabled = false,
  playResult: () => Promise<void> = () => Promise.resolve(),
) {
  const audio = document.createElement("audio");
  audio.currentTime = 42;
  audio.loop = true;
  let paused = true;
  vi.spyOn(audio, "paused", "get").mockImplementation(() => paused);
  const play = vi.spyOn(audio, "play").mockImplementation(() => {
    paused = false;
    return playResult();
  });
  const pause = vi.spyOn(audio, "pause").mockImplementation(() => {
    paused = true;
  });
  const audioRef = { current: audio };
  const onPlaybackError = vi.fn();
  let settings: Settings = { enabled, hidden: false, ducked: false };
  const hook = renderHook(
    (props: Settings) =>
      useAmbientAudio({
        audioRef,
        ...props,
        onPlaybackError,
      }),
    { initialProps: settings },
  );
  const update = (change: Partial<Settings>) => {
    settings = { ...settings, ...change };
    hook.rerender(settings);
  };
  return { ...hook, audio, play, pause, onPlaybackError, update };
}

describe("ambient volume controller", () => {
  it("starts silent without autoplay and preserves the loop timeline", () => {
    const { audio, play } = setup();
    expect(audio.volume).toBe(0);
    expect(audio.paused).toBe(true);
    expect(play).not.toHaveBeenCalled();
    expect(audio.currentTime).toBe(42);
    expect(audio.loop).toBe(true);
    expect(frames.size).toBe(0);
  });

  it("fades in after opt-in and pauses only after a complete fade-out", async () => {
    const { audio, pause, update } = setup();
    update({ enabled: true });
    expect(audio.volume).toBe(0);
    await settlePlayback();
    advanceFrame(300);
    expect(audio.volume).toBeCloseTo(0.11);
    expect(audio.paused).toBe(false);
    advanceFrame(300);
    expect(audio.volume).toBe(0.22);

    pause.mockClear();
    update({ enabled: false });
    expect(audio.volume).toBe(0.22);
    expect(pause).not.toHaveBeenCalled();
    advanceFrame(300);
    expect(audio.volume).toBeCloseTo(0.11);
    expect(pause).not.toHaveBeenCalled();
    advanceFrame(300);
    expect(audio.volume).toBe(0);
    expect(audio.paused).toBe(true);
    expect(pause).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(42);
    expect(audio.loop).toBe(true);
  });

  it("reverses fast toggles from the current volume without an intermediate pause", async () => {
    const { audio, pause, update } = setup(true);
    await settlePlayback();
    advanceFrame(300);
    expect(audio.volume).toBeCloseTo(0.11);

    update({ enabled: false });
    expect(audio.volume).toBeCloseTo(0.11);
    advanceFrame(300);
    expect(audio.volume).toBeCloseTo(0.055);
    update({ enabled: true });
    expect(audio.volume).toBeCloseTo(0.055);
    await settlePlayback();
    advanceFrame(300);
    expect(audio.volume).toBeCloseTo(0.1375);
    expect(pause).not.toHaveBeenCalled();

    update({ enabled: false });
    expect(audio.volume).toBeCloseTo(0.1375);
    advanceFrame(600);
    expect(audio.volume).toBe(0);
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it("ducks smoothly for narration and restores the normal volume without resetting time", async () => {
    const { audio, pause, update } = setup(true);
    await settlePlayback();
    advanceFrame(600);
    update({ ducked: true });
    expect(audio.volume).toBe(0.22);
    await settlePlayback();
    advanceFrame(300);
    expect(audio.volume).toBeCloseTo(0.1325);
    advanceFrame(300);
    expect(audio.volume).toBe(0.045);
    update({ ducked: false });
    expect(audio.volume).toBe(0.045);
    await settlePlayback();
    advanceFrame(600);
    expect(audio.volume).toBe(0.22);
    expect(pause).not.toHaveBeenCalled();
    expect(audio.currentTime).toBe(42);
  });

  it("silences immediately when hidden and resumes from zero when visible", async () => {
    const { audio, update } = setup(true);
    await settlePlayback();
    advanceFrame(300);
    const staleFrame = [...frames.values()][0]!;
    update({ hidden: true });
    expect(audio.volume).toBe(0);
    expect(audio.paused).toBe(true);
    expect(frames.size).toBe(0);
    act(() => staleFrame(now + 300));
    expect(audio.volume).toBe(0);

    update({ hidden: false });
    expect(audio.volume).toBe(0);
    await settlePlayback();
    advanceFrame(600);
    expect(audio.volume).toBe(0.22);
    expect(audio.paused).toBe(false);
  });

  it("waits for playback to start rather than finishing the fade during buffering", async () => {
    const pending = deferred();
    const { audio } = setup(true, () => pending.promise);
    advanceFrame(2_000);
    expect(audio.volume).toBe(0);
    expect(frames.size).toBe(0);
    pending.resolve();
    await settlePlayback();
    advanceFrame(300);
    expect(audio.volume).toBeCloseTo(0.11);
  });

  it("silences a current playback rejection and reports the failure once", async () => {
    const pending = deferred();
    const { audio, onPlaybackError } = setup(true, () => pending.promise);
    pending.reject(
      new DOMException("Playback is not allowed", "NotAllowedError"),
    );
    await settlePlayback();
    expect(onPlaybackError).toHaveBeenCalledTimes(1);
    expect(audio.volume).toBe(0);
    expect(audio.paused).toBe(true);
    expect(frames.size).toBe(0);
  });

  it("handles a synchronous media API failure", () => {
    const { audio, onPlaybackError } = setup(true, () => {
      throw new Error("Media API failed");
    });
    expect(onPlaybackError).toHaveBeenCalledTimes(1);
    expect(audio.volume).toBe(0);
    expect(audio.paused).toBe(true);
  });

  it("ignores an obsolete play rejection after a newer opt-in succeeds", async () => {
    const first = deferred();
    const second = deferred();
    let calls = 0;
    const { audio, update, onPlaybackError } = setup(true, () =>
      ++calls === 1 ? first.promise : second.promise,
    );
    update({ enabled: false });
    update({ enabled: true });
    second.resolve();
    await settlePlayback();
    advanceFrame(300);
    expect(audio.volume).toBeCloseTo(0.11);
    first.reject(new DOMException("Old request was interrupted", "AbortError"));
    await settlePlayback();
    expect(onPlaybackError).not.toHaveBeenCalled();
    expect(audio.paused).toBe(false);
    advanceFrame(300);
    expect(audio.volume).toBe(0.22);
  });

  it("cancels an in-flight ramp immediately on unmount", async () => {
    const { audio, unmount } = setup(true);
    await settlePlayback();
    advanceFrame(300);
    const staleFrame = [...frames.values()][0]!;
    unmount();
    expect(audio.volume).toBe(0);
    expect(audio.paused).toBe(true);
    expect(frames.size).toBe(0);
    act(() => staleFrame(now + 300));
    expect(audio.volume).toBe(0);
    expect(frames.size).toBe(0);
  });

  it("cannot resume from a stale play promise after unmount", async () => {
    const pending = deferred();
    const { audio, unmount, onPlaybackError } = setup(
      true,
      () => pending.promise,
    );
    unmount();
    pending.resolve();
    await settlePlayback();
    expect(audio.volume).toBe(0);
    expect(audio.paused).toBe(true);
    expect(frames.size).toBe(0);
    expect(onPlaybackError).not.toHaveBeenCalled();
  });
});
