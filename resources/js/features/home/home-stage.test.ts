import {describe, expect, it} from "vitest";

import {
    type HomeExperienceAction,
    homeExperienceReducer,
    type HomeExperienceState,
    INITIAL_HOME_EXPERIENCE_STATE,
} from "@/features/home/home-stage";

function apply(...actions: HomeExperienceAction[]): HomeExperienceState {
  return actions.reduce(homeExperienceReducer, INITIAL_HOME_EXPERIENCE_STATE);
}

const reveal = apply({ type: "SHOW_REVEAL" });
const gold = homeExperienceReducer(reveal, { type: "OPEN_INTERACTIVE" });

describe("cinematic home transitions", () => {
  it("finishes an automatic turn and ignores late camera progress", () => {
    const state = apply(
      { type: "START_TURN", driver: "auto" },
      { type: "TURN_PROGRESS", driver: "auto", progress: 0.5 },
      { type: "TURN_PROGRESS", driver: "auto", progress: 1.2 },
    );

    expect(state).toEqual(reveal);
    expect(
      homeExperienceReducer(state, {
        type: "TURN_PROGRESS",
        driver: "auto",
        progress: 0.6,
      }),
    ).toBe(state);
  });

  it("lets Explore take over a scroll turn without jumping backward", () => {
    const state = apply(
      { type: "START_TURN", driver: "scroll" },
      { type: "TURN_PROGRESS", driver: "scroll", progress: 0.4 },
      { type: "START_TURN", driver: "auto" },
    );

    expect(state).toMatchObject({
      phase: "turning",
      turnDriver: "auto",
      turnProgress: 0.4,
    });
    const manual = homeExperienceReducer(state, {
      type: "START_TURN",
      driver: "scroll",
    });
    expect(manual).toMatchObject({ turnDriver: "scroll", turnProgress: 0.4 });
    expect(
      homeExperienceReducer(manual, {
        type: "TURN_PROGRESS",
        driver: "auto",
        progress: 0.9,
      }),
    ).toBe(manual);
  });

  it("returns home when a scroll turn is reversed completely", () => {
    const state = apply(
      { type: "START_TURN", driver: "scroll" },
      { type: "TURN_PROGRESS", driver: "scroll", progress: 0.7 },
      { type: "TURN_PROGRESS", driver: "scroll", progress: -0.1 },
    );

    expect(state).toBe(INITIAL_HOME_EXPERIENCE_STATE);
  });

  it("returns smoothly from the reveal without letting repeat clicks or stale frames take over", () => {
    const started = homeExperienceReducer(reveal, { type: "START_RETURN" });
    expect(started).toMatchObject({
      phase: "turning",
      turnDriver: "return",
      turnProgress: 1,
    });
    const middle = homeExperienceReducer(started, {
      type: "TURN_PROGRESS",
      driver: "return",
      progress: 0.5,
    });
    expect(middle.turnProgress).toBe(0.5);
    for (const action of [
      { type: "START_RETURN" },
      { type: "START_TURN", driver: "auto" },
      { type: "TURN_PROGRESS", driver: "auto", progress: 1 },
      { type: "TURN_PROGRESS", driver: "scroll", progress: 0 },
      { type: "TURN_PROGRESS", driver: "return", progress: 0.9 },
    ] satisfies HomeExperienceAction[]) {
      expect(homeExperienceReducer(middle, action)).toBe(middle);
    }
    expect(
      homeExperienceReducer(middle, {
        type: "TURN_PROGRESS",
        driver: "return",
        progress: 0,
      }),
    ).toBe(INITIAL_HOME_EXPERIENCE_STATE);
  });

  it.each(["auto", "scroll"] as const)(
    "takes over a partial %s turn at its existing progress",
    (driver) => {
      const partial = apply(
        { type: "START_TURN", driver },
        { type: "TURN_PROGRESS", driver, progress: 0.4 },
      );
      expect(
        homeExperienceReducer(partial, { type: "START_RETURN" }),
      ).toMatchObject({
        phase: "turning",
        turnDriver: "return",
        turnProgress: 0.4,
      });
      expect(
        homeExperienceReducer(INITIAL_HOME_EXPERIENCE_STATE, {
          type: "START_RETURN",
        }),
      ).toBe(INITIAL_HOME_EXPERIENCE_STATE);
    },
  );

  it("starts a reverse scroll at the completed reveal and returns home", () => {
    const started = homeExperienceReducer(reveal, {
      type: "START_TURN",
      driver: "scroll",
    });
    expect(started).toMatchObject({
      phase: "turning",
      turnDriver: "scroll",
      turnProgress: 1,
    });
    const reversed = homeExperienceReducer(started, {
      type: "TURN_PROGRESS",
      driver: "scroll",
      progress: 0.6,
    });
    expect(reversed.turnProgress).toBe(0.6);
    expect(
      homeExperienceReducer(reversed, {
        type: "TURN_PROGRESS",
        driver: "scroll",
        progress: 0,
      }),
    ).toBe(INITIAL_HOME_EXPERIENCE_STATE);
    expect(
      homeExperienceReducer(reveal, {
        type: "START_TURN",
        driver: "auto",
      }),
    ).toBe(reveal);
  });

  it.each([NaN, Infinity, -Infinity])(
    "ignores invalid camera progress %s without corrupting the current turn",
    (progress) => {
      const state = apply(
        { type: "START_TURN", driver: "auto" },
        { type: "TURN_PROGRESS", driver: "auto", progress: 0.3 },
      );

      expect(
        homeExperienceReducer(state, {
          type: "TURN_PROGRESS",
          driver: "auto",
          progress,
        }),
      ).toBe(state);
    },
  );

  it("clamps negative automatic progress without releasing the turn driver", () => {
    expect(
      apply(
        { type: "START_TURN", driver: "auto" },
        { type: "TURN_PROGRESS", driver: "auto", progress: -3 },
      ),
    ).toMatchObject({ phase: "turning", turnDriver: "auto", turnProgress: 0 });
  });

  it("supports skipping motion while protecting an active audio scene", () => {
    expect(
      apply({ type: "START_TURN", driver: "auto" }, { type: "SHOW_REVEAL" }),
    ).toEqual(reveal);
    const audio = homeExperienceReducer(reveal, { type: "OPEN_AUDIO" });
    expect(homeExperienceReducer(audio, { type: "SHOW_REVEAL" })).toBe(audio);
  });

  it("opens audio only from the tree and returns to the same daytime view", () => {
    expect(
      homeExperienceReducer(INITIAL_HOME_EXPERIENCE_STATE, {
        type: "OPEN_AUDIO",
      }),
    ).toBe(INITIAL_HOME_EXPERIENCE_STATE);
    const audio = homeExperienceReducer(reveal, { type: "OPEN_AUDIO" });

    expect(audio.phase).toBe("audio");
    expect(homeExperienceReducer(audio, { type: "OPEN_AUDIO" })).toBe(audio);
    expect(homeExperienceReducer(audio, { type: "OPEN_INTERACTIVE" })).toBe(
      audio,
    );
    expect(homeExperienceReducer(audio, { type: "EXIT_AUDIO" })).toEqual(
      reveal,
    );
  });

  it("keeps the gold cover closed until the scene reports its first frame", () => {
    expect(gold).toMatchObject({ phase: "gold", sceneReady: false });
    expect(homeExperienceReducer(gold, { type: "REVEAL_INTERACTIVE" })).toBe(
      gold,
    );
    expect(homeExperienceReducer(gold, { type: "OPEN_INTERACTIVE" })).toBe(
      gold,
    );

    const ready = homeExperienceReducer(gold, { type: "SCENE_READY" });
    expect(ready).toMatchObject({ phase: "gold", sceneReady: true });
    expect(
      homeExperienceReducer(ready, { type: "REVEAL_INTERACTIVE" }),
    ).toMatchObject({ phase: "interactive", sceneReady: true });
  });

  it("recovers from a scene failure without late readiness reopening 3D", () => {
    const failed = homeExperienceReducer(gold, {
      type: "FAIL_SCENE",
      message: "WebGL is unavailable",
    });

    expect(failed).toMatchObject({
      phase: "fallback",
      sceneReady: false,
      error: "WebGL is unavailable",
    });
    expect(homeExperienceReducer(failed, { type: "SCENE_READY" })).toBe(failed);
    expect(homeExperienceReducer(failed, { type: "REVEAL_INTERACTIVE" })).toBe(
      failed,
    );
    const recovered = homeExperienceReducer(failed, { type: "BACK_TO_TREE" });
    expect(recovered).toEqual(reveal);
    expect(
      homeExperienceReducer(recovered, { type: "OPEN_INTERACTIVE" }),
    ).toEqual(gold);
  });

  it("handles context loss after entering 3D and clears readiness on return", () => {
    const interactive = apply(
      { type: "SHOW_REVEAL" },
      { type: "OPEN_INTERACTIVE" },
      { type: "SCENE_READY" },
      { type: "REVEAL_INTERACTIVE" },
    );
    const failed = homeExperienceReducer(interactive, {
      type: "FAIL_SCENE",
      message: "Rendering context lost",
    });

    expect(failed.phase).toBe("fallback");
    expect(
      homeExperienceReducer(interactive, { type: "BACK_TO_TREE" }),
    ).toEqual(reveal);
    expect(homeExperienceReducer(gold, { type: "BACK_TO_TREE" })).toEqual(
      reveal,
    );
  });

  it("ignores stale scene events after the visitor returns home", () => {
    const home = homeExperienceReducer(gold, { type: "SHOW_HOME" });

    expect(home).toBe(INITIAL_HOME_EXPERIENCE_STATE);
    for (const action of [
      { type: "SCENE_READY" },
      { type: "REVEAL_INTERACTIVE" },
      { type: "FAIL_SCENE", message: "Stale failure" },
      { type: "EXIT_AUDIO" },
      { type: "BACK_TO_TREE" },
    ] satisfies HomeExperienceAction[]) {
      expect(homeExperienceReducer(home, action)).toBe(home);
    }
  });
});
