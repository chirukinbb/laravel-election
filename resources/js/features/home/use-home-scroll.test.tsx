import {cleanup, fireEvent, renderHook} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {
    type HomeExperienceAction,
    homeExperienceReducer,
    type HomeExperienceState,
    INITIAL_HOME_EXPERIENCE_STATE,
} from "./home-stage";
import {useHomeScroll} from "./use-home-scroll";

let now: number;

beforeEach(() => {
  now = 0;
  vi.stubGlobal("innerHeight", 1_000);
  vi.spyOn(performance, "now").mockImplementation(() => now);
});

afterEach(() => {
  cleanup();
  document
    .querySelectorAll("[data-scroll-test]")
    .forEach((element) => element.remove());
  vi.unstubAllGlobals();
});

const reveal = homeExperienceReducer(INITIAL_HOME_EXPERIENCE_STATE, {
  type: "SHOW_REVEAL",
});

function setup(
  initialState = INITIAL_HOME_EXPERIENCE_STATE,
  reducedMotion = false,
  commitImmediately = true,
) {
  const region = document.createElement("section");
  region.dataset.scrollTest = "";
  const button = document.createElement("button");
  region.append(button);
  document.body.append(region);
  const stateRef = { current: initialState };
  const regionRef = { current: region };
  const onTurnStart = vi.fn();
  const dispatch = vi.fn((action: HomeExperienceAction) => {
    if (commitImmediately) {
      stateRef.current = homeExperienceReducer(stateRef.current, action);
    }
  });
  const hook = renderHook(() =>
    useHomeScroll({
      stateRef,
      dispatch,
      regionRef,
      reducedMotion,
      onTurnStart,
    }),
  );
  const wheel = (
    deltaY: number,
    options: WheelEventInit = {},
    target = region,
  ) => {
    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY,
      ...options,
    });
    fireEvent(target, event);
    return event;
  };
  const touch = (
    type: "touchstart" | "touchmove" | "touchend" | "touchcancel",
    points: Array<{ identifier: number; clientX: number; clientY: number }>,
    target = region,
  ) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "touches", { value: points });
    fireEvent(target, event);
    return event;
  };
  return {
    ...hook,
    region,
    button,
    stateRef,
    dispatch,
    onTurnStart,
    wheel,
    touch,
  };
}

const finger = (clientY: number, clientX = 200, identifier = 1) => ({
  clientX,
  clientY,
  identifier,
});

describe("reversible home scrolling", () => {
  it("returns from a complete reveal and ignores continued downward inertia", () => {
    const { stateRef, wheel, dispatch, onTurnStart } = setup();
    wheel(800);
    expect(stateRef.current).toEqual(reveal);
    const callsAtReveal = dispatch.mock.calls.length;
    wheel(300);
    wheel(20);
    expect(dispatch).toHaveBeenCalledTimes(callsAtReveal);
    expect(stateRef.current).toEqual(reveal);

    wheel(-200);
    expect(stateRef.current).toMatchObject({
      phase: "turning",
      turnDriver: "return",
      turnProgress: 1,
    });
    const returnCalls = dispatch.mock.calls.length;
    wheel(-600);
    expect(dispatch).toHaveBeenCalledTimes(returnCalls);
    expect(stateRef.current.turnProgress).toBe(1);
    expect(onTurnStart).toHaveBeenCalledTimes(2);
  });

  it("reverses partial movement without restarting or duplicating start callbacks", () => {
    const { stateRef, wheel, onTurnStart } = setup();
    wheel(200);
    wheel(-100);
    expect(stateRef.current.turnProgress).toBe(0.125);
    wheel(200);
    expect(stateRef.current.turnProgress).toBe(0.375);
    wheel(-300);
    expect(stateRef.current).toBe(INITIAL_HOME_EXPERIENCE_STATE);
    expect(onTurnStart).toHaveBeenCalledTimes(1);
  });

  it("accumulates deliberate small wheel input but drops isolated endpoint noise", () => {
    const { stateRef, wheel, dispatch } = setup(reveal);
    wheel(-5);
    now += 200;
    wheel(-5);
    expect(dispatch).not.toHaveBeenCalled();
    wheel(10);
    wheel(-4);
    wheel(-4);
    expect(dispatch).not.toHaveBeenCalled();
    wheel(-4);
    expect(stateRef.current).toMatchObject({
      phase: "turning",
      turnDriver: "return",
      turnProgress: 1,
    });
  });

  it("keeps repeated native events coherent before React commits their actions", () => {
    const { wheel, dispatch, stateRef } = setup(undefined, false, false);
    wheel(200);
    wheel(200);
    expect(dispatch.mock.calls.at(-1)?.[0]).toEqual({
      type: "TURN_PROGRESS",
      driver: "scroll",
      progress: 0.5,
    });
    wheel(400);
    const completedCalls = dispatch.mock.calls.length;
    wheel(200);
    expect(dispatch).toHaveBeenCalledTimes(completedCalls);

    stateRef.current = homeExperienceReducer(INITIAL_HOME_EXPERIENCE_STATE, {
      type: "START_TURN",
      driver: "auto",
    });
    wheel(-200);
    expect(dispatch).toHaveBeenCalledTimes(completedCalls + 2);
    expect(dispatch.mock.calls.at(-1)?.[0]).toMatchObject({
      type: "TURN_PROGRESS",
      driver: "scroll",
    });
  });

  it.each(["auto", "return"] as const)(
    "lets deliberate wheel and touch take over a %s turn",
    (driver) => {
      const automatic =
        driver === "auto"
          ? homeExperienceReducer(INITIAL_HOME_EXPERIENCE_STATE, {
              type: "START_TURN",
              driver,
            })
          : homeExperienceReducer(reveal, { type: "START_RETURN" });
      const partial = homeExperienceReducer(automatic, {
        type: "TURN_PROGRESS",
        driver,
        progress: 0.4,
      });
      const { wheel, touch, stateRef } = setup(partial);
      wheel(200);
      touch("touchstart", [finger(500)]);
      touch("touchmove", [finger(450)]);
      expect(stateRef.current).toMatchObject({
        phase: "turning",
        turnDriver: "scroll",
      });
      expect(stateRef.current.turnProgress).toBeCloseTo(0.775);
    },
  );

  it("starts Home movement on the first small downward wheel input", () => {
    const { wheel, stateRef } = setup();
    wheel(1);
    expect(stateRef.current).toMatchObject({
      phase: "turning",
      turnDriver: "scroll",
    });
    expect(stateRef.current.turnProgress).toBeGreaterThan(0);
  });

  it("does not scroll the scene through blank navigation panels", () => {
    const { region, wheel, dispatch } = setup();
    const panel = document.createElement("div");
    panel.dataset.navigationSurface = "true";
    region.append(panel);
    expect(wheel(200, {}, panel).defaultPrevented).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("uses gesture direction to choose the reduced-motion endpoint", () => {
    const { stateRef, wheel, onTurnStart } = setup(undefined, true);
    wheel(30);
    expect(stateRef.current).toEqual(reveal);
    wheel(30);
    expect(stateRef.current).toEqual(reveal);
    wheel(-30);
    expect(stateRef.current).toBe(INITIAL_HOME_EXPERIENCE_STATE);
    expect(onTurnStart).not.toHaveBeenCalled();
  });

  it("preserves zoom, horizontal intent and controls while normalizing wheel units", () => {
    const { wheel, button, dispatch, stateRef } = setup();
    expect(wheel(120, { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(wheel(120, { deltaX: 150 }).defaultPrevented).toBe(false);
    expect(wheel(120, { shiftKey: true }).defaultPrevented).toBe(false);
    expect(wheel(120, {}, button).defaultPrevented).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
    wheel(2, { deltaMode: 1 });
    expect(stateRef.current.turnProgress).toBe(0.04);
    wheel(-1, { deltaMode: 2 });
    expect(stateRef.current).toBe(INITIAL_HOME_EXPERIENCE_STATE);
    wheel(1, { deltaMode: 2 });
    expect(stateRef.current).toEqual(reveal);
  });

  it("allows reverse wheel navigation over the clickable tree surface", () => {
    const { wheel, button, stateRef } = setup(reveal);
    button.dataset.sceneSurface = "true";
    expect(wheel(-800, {}, button).defaultPrevented).toBe(true);
    expect(stateRef.current).toMatchObject({
      phase: "turning",
      turnDriver: "return",
      turnProgress: 1,
    });
  });

  it("allows a downward swipe starting on the clickable tree surface", () => {
    const { touch, button, stateRef } = setup(reveal);
    button.dataset.sceneSurface = "true";
    touch("touchstart", [finger(200)], button);
    expect(touch("touchmove", [finger(650)], button).defaultPrevented).toBe(
      true,
    );
    expect(stateRef.current).toMatchObject({
      phase: "turning",
      turnDriver: "return",
      turnProgress: 1,
    });
  });

  it.each(["audio", "gold", "interactive", "fallback"] as const)(
    "does not capture gestures from the %s scene",
    (phase) => {
      const initialState: HomeExperienceState = { ...reveal, phase };
      const { wheel, touch, dispatch, stateRef } = setup(initialState);
      expect(wheel(-200).defaultPrevented).toBe(false);
      touch("touchstart", [finger(300)]);
      expect(touch("touchmove", [finger(500)]).defaultPrevented).toBe(false);
      expect(dispatch).not.toHaveBeenCalled();
      expect(stateRef.current).toBe(initialState);
    },
  );

  it("locks vertical touch intent, reverses a partial turn, and ends cancelled gestures", () => {
    const { touch, stateRef, dispatch } = setup();
    touch("touchstart", [finger(400)]);
    touch("touchmove", [finger(395, 230)]);
    touch("touchmove", [finger(100, 230)]);
    expect(dispatch).not.toHaveBeenCalled();
    touch("touchend", []);

    touch("touchstart", [finger(400)]);
    touch("touchmove", [finger(300)]);
    expect(stateRef.current.turnProgress).toBe(0.25);
    touch("touchmove", [finger(350)]);
    expect(stateRef.current.turnProgress).toBe(0.125);
    touch("touchcancel", []);
    const cancelledCalls = dispatch.mock.calls.length;
    touch("touchmove", [finger(100)]);
    expect(dispatch).toHaveBeenCalledTimes(cancelledCalls);

    stateRef.current = reveal;
    touch("touchstart", [finger(300)]);
    touch("touchmove", [finger(600)]);
    expect(stateRef.current).toMatchObject({
      phase: "turning",
      turnDriver: "return",
      turnProgress: 1,
    });
    const returnCalls = dispatch.mock.calls.length;
    touch("touchmove", [finger(700)]);
    expect(dispatch).toHaveBeenCalledTimes(returnCalls);
  });

  it("starts return once even when wheel events arrive before React commits", () => {
    const { wheel, dispatch, onTurnStart } = setup(reveal, false, false);
    wheel(-20);
    wheel(-100);
    wheel(-400);
    expect(dispatch.mock.calls).toEqual([[{ type: "START_RETURN" }]]);
    expect(onTurnStart).toHaveBeenCalledTimes(1);
  });

  it("lets reverse playback advance independently of continued wheel and touch input", () => {
    const partialReturn = {
      ...reveal,
      phase: "turning" as const,
      turnDriver: "return" as const,
      turnProgress: 0.6,
    };
    const { wheel, touch, dispatch, stateRef } = setup(partialReturn);
    wheel(-500);
    touch("touchstart", [finger(300)]);
    touch("touchmove", [finger(500)]);
    expect(dispatch).not.toHaveBeenCalled();
    expect(stateRef.current).toBe(partialReturn);
    wheel(80);
    expect(stateRef.current).toMatchObject({
      turnDriver: "scroll",
      turnProgress: 0.7,
    });
  });

  it("does not hijack control touches or a multi-touch gesture", () => {
    const { touch, button, dispatch } = setup();
    touch("touchstart", [finger(400)], button);
    touch("touchmove", [finger(100)], button);
    touch("touchstart", [finger(400), finger(300, 250, 2)]);
    touch("touchmove", [finger(100)]);
    touch("touchstart", [finger(400)]);
    touch("touchmove", [finger(300), finger(200, 250, 2)]);
    touch("touchmove", [finger(100)]);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("removes native listeners and pending touch state on unmount", () => {
    const { touch, wheel, dispatch, unmount } = setup();
    touch("touchstart", [finger(400)]);
    unmount();
    touch("touchmove", [finger(100)]);
    wheel(200);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
