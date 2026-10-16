export type HomePhase =
  "home" | "turning" | "reveal" | "audio" | "gold" | "interactive" | "fallback";

export type TurnDriver = "auto" | "scroll" | "return";

export interface HomeExperienceState {
  readonly phase: HomePhase;
  readonly turnProgress: number;
  readonly turnDriver: TurnDriver | null;
  readonly sceneReady: boolean;
  readonly error: string | null;
}

export type HomeExperienceAction =
  | { readonly type: "START_TURN"; readonly driver: "auto" | "scroll" }
  | { readonly type: "START_RETURN" }
  | {
      readonly type: "TURN_PROGRESS";
      readonly progress: number;
      readonly driver: TurnDriver;
    }
  | { readonly type: "SHOW_REVEAL" }
  | { readonly type: "SHOW_HOME" }
  | { readonly type: "OPEN_AUDIO" }
  | { readonly type: "EXIT_AUDIO" }
  | { readonly type: "OPEN_INTERACTIVE" }
  | { readonly type: "SCENE_READY" }
  | { readonly type: "REVEAL_INTERACTIVE" }
  | { readonly type: "FAIL_SCENE"; readonly message: string }
  | { readonly type: "BACK_TO_TREE" };

export const INITIAL_HOME_EXPERIENCE_STATE: HomeExperienceState = Object.freeze(
  {
    phase: "home",
    turnProgress: 0,
    turnDriver: null,
    sceneReady: false,
    error: null,
  },
);

function revealState(): HomeExperienceState {
  return {
    ...INITIAL_HOME_EXPERIENCE_STATE,
    phase: "reveal",
    turnProgress: 1,
  };
}

export function homeExperienceReducer(
  state: HomeExperienceState,
  action: HomeExperienceAction,
): HomeExperienceState {
  switch (action.type) {
    case "START_TURN":
      if (
        state.phase !== "home" &&
        state.phase !== "turning" &&
        !(state.phase === "reveal" && action.driver === "scroll")
      )
        return state;
      if (
        state.phase === "turning" &&
        (state.turnDriver === "auto" || state.turnDriver === "return") &&
        action.driver !== "scroll"
      )
        return state;
      return {
        ...state,
        phase: "turning",
        turnDriver: action.driver,
        turnProgress: state.phase === "reveal" ? 1 : state.turnProgress,
      };
    case "START_RETURN":
      if (
        (state.phase !== "reveal" && state.phase !== "turning") ||
        state.turnDriver === "return"
      )
        return state;
      if (state.turnProgress === 0) return INITIAL_HOME_EXPERIENCE_STATE;
      return { ...state, phase: "turning", turnDriver: "return" };
    case "TURN_PROGRESS": {
      if (
        state.phase !== "turning" ||
        state.turnDriver !== action.driver ||
        !Number.isFinite(action.progress)
      ) {
        return state;
      }
      const turnProgress = Math.min(1, Math.max(0, action.progress));
      if (action.driver === "return") {
        if (turnProgress > state.turnProgress) return state;
        return turnProgress === 0
          ? INITIAL_HOME_EXPERIENCE_STATE
          : { ...state, turnProgress };
      }
      if (turnProgress === 1) return revealState();
      if (turnProgress === 0 && action.driver === "scroll") {
        return INITIAL_HOME_EXPERIENCE_STATE;
      }
      return { ...state, turnProgress };
    }
    case "SHOW_REVEAL":
      return state.phase === "home" || state.phase === "turning"
        ? revealState()
        : state;
    case "SHOW_HOME":
      return INITIAL_HOME_EXPERIENCE_STATE;
    case "OPEN_AUDIO":
      return state.phase === "reveal" ? { ...state, phase: "audio" } : state;
    case "EXIT_AUDIO":
      return state.phase === "audio" ? revealState() : state;
    case "OPEN_INTERACTIVE":
      return state.phase === "reveal"
        ? { ...state, phase: "gold", sceneReady: false, error: null }
        : state;
    case "SCENE_READY":
      return state.phase === "gold" ? { ...state, sceneReady: true } : state;
    case "REVEAL_INTERACTIVE":
      return state.phase === "gold" && state.sceneReady
        ? { ...state, phase: "interactive" }
        : state;
    case "FAIL_SCENE":
      return state.phase === "gold" || state.phase === "interactive"
        ? {
            ...state,
            phase: "fallback",
            sceneReady: false,
            error: action.message,
          }
        : state;
    case "BACK_TO_TREE":
      return state.phase === "gold" ||
        state.phase === "fallback" ||
        state.phase === "interactive"
        ? revealState()
        : state;
  }
}
