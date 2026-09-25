"use client";
// ✅ Стандартный React / Vite
import {type CSSProperties, lazy, useCallback, useEffect, useReducer, useRef, useState} from "react";
import {homeExperienceReducer, INITIAL_HOME_EXPERIENCE_STATE,} from "./home-stage";
import {cinematicMedia as media, type SceneMedia} from "./media";
import {AudioStoryCursor} from "./audio-story-cursor";
import {AudioStoryBackdrop} from "./audio-story-backdrop";
import {HomeTransitionVideo} from "./home-transition-video";
import {AudioHotspot} from "./audio-hotspot";
import {TreeHitArea} from "./tree-hit-area";
import {InspectCursor} from "./inspect-cursor";
import {didot, montserrat} from "./fonts";
import {useHomeScroll} from "./use-home-scroll";
import {useAmbientAudio} from "./use-ambient-audio";
import {CinematicHeader} from "./cinematic-header";
import {homeCopy, type HomeLanguage} from "./copy";
import {useHomeLanguage} from "./use-home-language";
import "./home.css";

const TreeScene = lazy(() =>
    import("./tree-scene").then((module) => ({ default: module.TreeScene }))
);

function isPlaybackAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function ScenePlate({
  scene,
  name,
  visible,
  motion,
  opacity = 1,
  onFallback,
}: {
  readonly scene: SceneMedia;
  readonly name: string;
  readonly visible: boolean;
  readonly motion: boolean;
  readonly opacity?: number;
  readonly onFallback?: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let cancelled = false;
    if (visible && motion)
      void element.play().catch((error: unknown) => {
        if (cancelled || isPlaybackAbort(error)) return;
        setFailed(true);
        onFallback?.();
      });
    else element.pause();
    return () => {
      cancelled = true;
      element.pause();
    };
  }, [visible, motion, onFallback]);
  return (
    <div
      aria-hidden="true"
      className={
        "scene-plate scene-plate--" +
        name +
        (name === "home" || name === "day" ? " scene-parallax-plane" : "") +
        (scene.containsUi && (!scene.video || failed)
          ? " scene-plate--reference"
          : "")
      }
      style={{ opacity, visibility: visible ? "visible" : "hidden" }}
    >
      {/* Text and controls stay separate from the owner-supplied poster assets. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="scene-plate__poster"
        src={scene.poster}
        srcSet={scene.posterSrcSet}
        sizes={scene.posterSrcSet ? "100vw" : undefined}
        alt=""
        fetchPriority={name === "home" ? "high" : "auto"}
      />
      {scene.video && !failed ? (
        <video
          ref={video}
          className="scene-plate__video"
          src={scene.video}
          poster={scene.poster}
          muted
          loop
          playsInline
          preload={name === "home" ? "metadata" : "none"}
          onError={() => {
            setFailed(true);
            onFallback?.();
          }}
        />
      ) : null}
    </div>
  );
}

export function HomeExperience() {
  const [state, dispatch] = useReducer(
    homeExperienceReducer,
    INITIAL_HOME_EXPERIENCE_STATE,
  );
  const stateRef = useRef(state);
  const root = useRef<HTMLElement>(null);
  const ambient = useRef<HTMLAudioElement>(null);
  const story = useRef<HTMLAudioElement>(null);
  const goldVideo = useRef<HTMLVideoElement>(null);
  const explore = useRef<HTMLButtonElement>(null);
  const interact = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const [sound, setSound] = useState(false);
  const [language, setLanguage] = useHomeLanguage();
  const copy = homeCopy[language];
  const [storyPaused, setStoryPaused] = useState(false);
  const [audioPointer, setAudioPointer] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [notice, setNotice] = useState("");
  const [turnFailed, setTurnFailed] = useState(false);
  const [turnDecoded, setTurnDecoded] = useState(false);
  const [homeFailed, setHomeFailed] = useState(false);
  const [revealFailed, setRevealFailed] = useState(false);
  const homeFallback = useCallback(() => setHomeFailed(true), []);
  const revealFallback = useCallback(() => setRevealFailed(true), []);
  const [goldFailed, setGoldFailed] = useState(false);
  const [goldCovered, setGoldCovered] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const previousPhase = useRef(state.phase);
  const scrollTransition = useRef(false);
  const night = state.phase === "audio";
  const moving = !reduced && !hidden;
  const hasTurn = Boolean(media.turn.video) && !turnFailed;
  const hasGold = Boolean(media.goldTransition.video) && !goldFailed;
  const phase = state.phase;
  const returning = phase === "turning" && state.turnDriver === "return";
  const referenceHome =
    media.home.containsUi && (!media.home.video || homeFailed);
  const referenceReveal =
    media.reveal.containsUi && (!media.reveal.video || revealFailed);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduced(preference.matches);
    const syncVisibility = () => setHidden(document.hidden);
    syncMotion();
    preference.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    if (window.location.hash === "#tree") dispatch({ type: "SHOW_REVEAL" });
    return () => {
      preference.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  const changeLanguage = (next: HomeLanguage) => {
    setLanguage(next);
    setNotice("");
  };

  // Focus follows meaningful user navigation, never individual scroll frames.
  useEffect(() => {
    const previous = previousPhase.current;
    previousPhase.current = phase;
    if (phase === "reveal" && previous !== "home" && !scrollTransition.current)
      interact.current?.focus({ preventScroll: true });
    if (
      phase === "audio" ||
      phase === "gold" ||
      phase === "fallback" ||
      phase === "interactive"
    )
      back.current?.focus({ preventScroll: true });
    if (phase === "home" && previous !== "home" && !scrollTransition.current)
      explore.current?.focus({ preventScroll: true });
    if (phase === "home" || phase === "reveal") {
      // Scrolling changes the scene without creating a keyboard focus ring.
      if (phase === "reveal" && document.activeElement === explore.current)
        explore.current?.blur();
      scrollTransition.current = false;
    }
    if (
      phase === "home" &&
      previous !== "home" &&
      window.location.hash === "#tree"
    )
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
      );
  }, [phase]);

  const startExplore = () => {
    if (stateRef.current.phase !== "home") return;
    scrollTransition.current = false;
    if (reduced) dispatch({ type: "SHOW_REVEAL" });
    else dispatch({ type: "START_TURN", driver: "auto" });
  };
  const returnToTree = useCallback(() => {
    story.current?.pause();
    dispatch({ type: "EXIT_AUDIO" });
    dispatch({ type: "BACK_TO_TREE" });
    setNotice("");
  }, []);
  const returnHome = () => {
    story.current?.pause();
    scrollTransition.current = false;
    const current = stateRef.current;
    if (
      !reduced &&
      (current.phase === "reveal" || current.phase === "turning")
    ) {
      dispatch({ type: "START_RETURN" });
    } else dispatch({ type: "SHOW_HOME" });
    setNotice("");
  };
  const startScroll = useCallback(() => {
    scrollTransition.current = true;
    setNotice("");
  }, []);
  const turnProgress = useCallback(
    (progress: number, driver: "auto" | "scroll" | "return") => {
      dispatch({ type: "TURN_PROGRESS", progress, driver });
    },
    [],
  );
  const turnReady = useCallback(() => setTurnDecoded(true), []);
  const turnError = useCallback(() => setTurnFailed(true), []);
  useHomeScroll({
    stateRef,
    dispatch,
    regionRef: root,
    reducedMotion: reduced,
    onTurnStart: startScroll,
  });

  // The real clip owns its playback. This timeline is only the media-error fallback.
  useEffect(() => {
    if (
      hasTurn ||
      phase !== "turning" ||
      state.turnDriver === "scroll" ||
      hidden
    )
      return;
    const reverse = state.turnDriver === "return";
    if (reduced) {
      dispatch({ type: reverse ? "SHOW_HOME" : "SHOW_REVEAL" });
      return;
    }
    if (reverse) {
      const from = stateRef.current.turnProgress;
      const duration = Math.max(300, 1000 * from);
      const started = performance.now();
      let frame = 0;
      const tick = (now: number) => {
        const elapsed = Math.min(1, (now - started) / duration);
        const eased = elapsed * elapsed * (3 - 2 * elapsed);
        dispatch({
          type: "TURN_PROGRESS",
          progress: from * (1 - eased),
          driver: "return",
        });
        if (elapsed < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }
    let raf = 0;
    const from = stateRef.current.turnProgress;
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, from + (now - started) / 1200);
      dispatch({ type: "TURN_PROGRESS", progress, driver: "auto" });
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, state.turnDriver, hidden, reduced, hasTurn]);

  const ambientPlaybackError = useCallback(() => {
    setSound(false);
    setNotice(copy.notice.soundCannotStart);
  }, [copy.notice.soundCannotStart]);
  useAmbientAudio({
    audioRef: ambient,
    enabled: sound,
    hidden,
    ducked: night && Boolean(media.audioStory.audio),
    onPlaybackError: ambientPlaybackError,
  });

  useEffect(() => {
    if (!night) {
      story.current?.pause();
      return;
    }
    const audio = story.current;
    if (!audio || !media.audioStory.audio) return;
    let cancelled = false;
    if (storyPaused || hidden) audio.pause();
    else
      void audio.play().catch((error: unknown) => {
        if (cancelled || isPlaybackAbort(error)) return;
        setStoryPaused(true);
        setNotice(copy.notice.playbackPaused);
      });
    return () => {
      cancelled = true;
      audio.pause();
    };
  }, [night, storyPaused, hidden, copy.notice.playbackPaused]);

  useEffect(() => {
    const audio = story.current;
    const track = audio?.textTracks[0];
    if (!track) return;
    // TextTrack is imperative browser state, not React-owned data.
    // eslint-disable-next-line react-hooks/immutability
    track.mode = "hidden";
    const sync = () =>
      setCaptionText(
        Array.from(track.activeCues ?? [])
          .map((cue) => (cue as VTTCue).text)
          .join("\n"),
      );
    track.addEventListener("cuechange", sync);
    return () => track.removeEventListener("cuechange", sync);
  }, []);

  const openAudio = (event: React.MouseEvent<HTMLButtonElement>) => {
    const pointerType =
      "pointerType" in event.nativeEvent
        ? event.nativeEvent.pointerType
        : "mouse";
    setAudioPointer(
      event.detail > 0 && pointerType === "mouse"
        ? { x: event.clientX, y: event.clientY }
        : null,
    );
    setStoryPaused(false);
    setNotice("");
    if (media.audioStory.audio && story.current) {
      story.current.currentTime = 0;
      setSound(true);
      story.current.muted = false;
      void story.current.play().catch((error: unknown) => {
        if (!isPlaybackAbort(error) && stateRef.current.phase === "audio")
          setStoryPaused(true);
      });
    }
    dispatch({ type: "OPEN_AUDIO" });
  };

  const openInteractive = () => {
    setGoldCovered(false);
    setNotice("");
    dispatch({ type: "OPEN_INTERACTIVE" });
  };
  const sceneReady = useCallback(() => dispatch({ type: "SCENE_READY" }), []);
  const sceneError = useCallback(
    (message: string) => dispatch({ type: "FAIL_SCENE", message }),
    [],
  );

  useEffect(() => {
    if (phase !== "gold") return;
    const coverage = window.setTimeout(
      () => {
        if (hasGold) setGoldFailed(true);
        setGoldCovered(true);
      },
      reduced ? 0 : hasGold ? 10000 : 900,
    );
    const loading = window.setTimeout(
      () => sceneError(copy.notice.treeSlow),
      20000,
    );
    let cancelled = false;
    if (hasGold && goldVideo.current)
      void goldVideo.current.play().catch((error: unknown) => {
        if (!cancelled && !isPlaybackAbort(error)) setGoldFailed(true);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(coverage);
      window.clearTimeout(loading);
    };
  }, [phase, reduced, hasGold, sceneError, copy.notice.treeSlow]);

  useEffect(() => {
    if (phase !== "gold" || !goldCovered || !state.sceneReady) return;
    const timer = window.setTimeout(
      () => dispatch({ type: "REVEAL_INTERACTIVE" }),
      reduced ? 0 : 120,
    );
    return () => window.clearTimeout(timer);
  }, [phase, goldCovered, state.sceneReady, reduced]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      if (
        phase === "audio" ||
        phase === "gold" ||
        phase === "interactive" ||
        phase === "fallback"
      )
        returnToTree();
      else if (returning) dispatch({ type: "SHOW_HOME" });
      else if (phase === "turning" || phase === "reveal") returnHome();
    }
  };
  const titleVisible = phase === "home";
  const treeVisible = phase !== "home";
  const technical = phase === "gold" || phase === "interactive";
  const rootStyle = { "--turn-progress": state.turnProgress } as CSSProperties;

  return (
    <section
      ref={root}
      className={`${didot.variable} ${montserrat.variable} home-experience${night ? " home-experience--night" : ""}`}
      lang={language}
      data-testid="home-experience"
      data-phase={phase}
      data-turn-driver={state.turnDriver ?? undefined}
      data-transition-ready={turnDecoded}
      data-motion={moving ? "playing" : "paused"}
      aria-label={copy.experienceLabel}
      onKeyDown={onKeyDown}
      style={rootStyle}
    >
      <div className="cinematic-backdrop" aria-hidden="true">
        <ScenePlate
          scene={media.home}
          onFallback={homeFallback}
          name="home"
          visible={phase === "home" || phase === "turning"}
          motion={moving}
        />
        <ScenePlate
          scene={media.reveal}
          onFallback={revealFallback}
          name="day"
          visible={treeVisible}
          motion={moving && !night && !technical}
          opacity={phase === "turning" ? state.turnProgress : 1}
        />
        {hasTurn && !reduced ? (
          <HomeTransitionVideo
            src={media.turn.video!}
            smallSrc={media.turn.videoSmall ?? null}
            reverseSrc={media.turn.reverseVideo ?? null}
            reverseSmallSrc={media.turn.reverseVideoSmall ?? null}
            durationHint={media.turn.duration ?? 4}
            frameRateHint={media.turn.frameRate ?? 24}
            phase={phase}
            driver={state.turnDriver}
            progress={state.turnProgress}
            hidden={hidden}
            onProgress={turnProgress}
            onReady={turnReady}
            onError={turnError}
          />
        ) : null}
        <AudioStoryBackdrop
          active={night}
          hidden={hidden}
          reducedMotion={reduced}
          preload={phase === "reveal"}
          dayPoster={media.reveal.poster}
          dayPosterSrcSet={media.reveal.posterSrcSet}
          nightPoster={media.night.poster}
          nightPosterSrcSet={media.night.posterSrcSet}
          sources={media.audioTransition}
        />
        <div className="scene-vignette" />
      </div>

      {technical ? (
        <div
          className={
            "tree-stage" +
            (phase === "interactive" ? " tree-stage--visible" : "")
          }
        >
          <TreeScene
            modelUrl={media.tree.model}
            active={phase === "interactive" && !hidden}
            onReady={sceneReady}
            onError={sceneError}
          />
        </div>
      ) : null}
      {phase === "interactive" ? (
        <div className="gold-reveal" aria-hidden="true" />
      ) : null}
      {phase === "interactive" ? (
        <InspectCursor regionRef={root} reducedMotion={reduced} />
      ) : null}

      <CinematicHeader
        key={phase === "interactive" ? "inspect" : "cinematic"}
        inspect={phase === "interactive"}
        language={language}
        onLanguageChange={changeLanguage}
        sound={sound}
        onToggleSound={() => {
          setSound((value) => !value);
          setNotice("");
        }}
        onTree={() => {
          if (phase === "home" || phase === "turning")
            dispatch({ type: "SHOW_REVEAL" });
          else returnToTree();
        }}
        onHome={returnHome}
        onClose={returnToTree}
        backRef={back}
        logo={media.logo}
        logoBlack={media.logoBlack}
      />

      <div
        className={
          "home-title" + (referenceHome ? " home-title--reference" : "")
        }
        data-visible={titleVisible}
      >
        <p>{copy.symbolOfHumanity}</p>
        <h1 lang="en">
          Tree <span>of</span> Unity
        </h1>
        <p>{copy.lastingLegacy}</p>
      </div>

      <div
        className="explore-position"
        data-visible={titleVisible}
        aria-hidden={!titleVisible}
      >
        <button
          ref={explore}
          type="button"
          className={
            "explore-button" +
            (referenceHome && phase === "home"
              ? " explore-button--reference"
              : "")
          }
          aria-label={copy.exploreLabel}
          data-scene-surface="true"
          tabIndex={titleVisible ? 0 : -1}
          onClick={startExplore}
        >
          <span className="explore-button__label">{copy.explore}</span>
          <span className="explore-button__indicator" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-4-4 4 4 4-4" />
            </svg>
          </span>
        </button>
      </div>

      <TreeHitArea
        active={phase === "reveal"}
        label={copy.treeSurfaceLabel}
        onActivate={openInteractive}
      />
      {phase === "reveal" ? (
        <>
          <AudioHotspot
            label={copy.listen}
            onActivate={openAudio}
            reducedMotion={reduced}
            reference={referenceReveal}
          />
          <button
            ref={interact}
            type="button"
            className="interact-button"
            data-scene-surface="true"
            aria-label={copy.interactLabel}
            onClick={openInteractive}
          >
            <span className="interact-button__label">{copy.interact}</span>
            <span className="interact-button__line" aria-hidden="true" />
          </button>
        </>
      ) : null}

      {night ? (
        <>
          <button
            ref={back}
            type="button"
            className="audio-exit-surface"
            aria-label={copy.closeAudio}
            tabIndex={-1}
            onClick={returnToTree}
          />
          <AudioStoryCursor
            audioRef={story}
            regionRef={root}
            reducedMotion={reduced}
            initialPoint={audioPointer}
          />
        </>
      ) : null}

      {night ? (
        <div className="audio-story-panel">
          <p className="audio-story-invitation">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            >
              <path d="M4 14v-3a8 8 0 0 1 16 0v3M4 13H2v7h5v-7H4Zm16 0h2v7h-5v-7h3Z" />
            </svg>
            {sound ? copy.listen : copy.listenPrompt}
          </p>
          {media.audioStory.audio ? (
            <div className="audio-story-controls">
              <button
                type="button"
                className="quiet-button"
                onClick={() => setStoryPaused((value) => !value)}
              >
                {storyPaused ? copy.playStory : copy.pauseStory}
              </button>
              {media.audioStory.captions ? (
                <button
                  type="button"
                  className="quiet-button"
                  aria-pressed={captions}
                  onClick={() => setCaptions((value) => !value)}
                >
                  {copy.subtitles}
                </button>
              ) : null}
            </div>
          ) : (
            <p className="story-unavailable">{copy.storyUnavailable}</p>
          )}
          {captions && captionText ? (
            <p className="story-caption">{captionText}</p>
          ) : null}
        </div>
      ) : null}

      {phase === "gold" || phase === "fallback" ? (
        <div
          className={
            "gold-cover" +
            (goldCovered || phase === "fallback" ? " gold-cover--complete" : "")
          }
          data-testid="gold-cover"
          role="status"
          aria-live="polite"
        >
          {hasGold && phase === "gold" ? (
            <video
              ref={goldVideo}
              className="gold-cover__video"
              src={media.goldTransition.video ?? undefined}
              muted
              playsInline
              preload="auto"
              onEnded={() => setGoldCovered(true)}
              onError={() => setGoldFailed(true)}
            />
          ) : null}
          <div className="gold-cover__message">
            <span className="gold-cover__mark" aria-hidden="true">
              T
            </span>
            <p>
              {phase === "fallback" ? copy.treeUnavailable : copy.enteringTree}
            </p>
            {phase === "fallback" ? (
              <p className="gold-cover__detail">{state.error}</p>
            ) : (
              <span className="loading-thread" />
            )}
            <button
              ref={back}
              type="button"
              className="quiet-button"
              aria-label={copy.backToTree}
              onClick={returnToTree}
            >
              {copy.backToTree}
            </button>
          </div>
        </div>
      ) : null}

      <p className="cinematic-notice" role="status" aria-live="polite">
        {notice}
      </p>
      <audio
        ref={ambient}
        src={media.ambient.audio}
        loop
        preload="none"
        onError={() => {
          setSound(false);
          setNotice(copy.notice.soundUnavailable);
        }}
      />
      <audio
        ref={story}
        data-audio-story
        src={media.audioStory.audio ?? undefined}
        muted={!sound}
        preload="none"
        onEnded={returnToTree}
        onError={() => {
          returnToTree();
          setNotice(copy.notice.storyCannotPlay);
        }}
      >
        {media.audioStory.captions ? (
          <track
            kind="captions"
            src={media.audioStory.captions}
            srcLang={media.audioStory.language}
            label={copy.subtitles}
          />
        ) : null}
      </audio>
    </section>
  );
}
