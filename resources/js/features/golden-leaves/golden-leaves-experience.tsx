"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {type CSSProperties, useCallback, useEffect, useRef, useState,} from "react";
import {didot, montserrat} from "@/features/home/fonts";
import {cinematicMedia} from "@/features/home/media";
import {CinematicHeader} from "@/features/home/cinematic-header";
import {useHomeLanguage} from "@/features/home/use-home-language";
import {useAmbientAudio} from "@/features/home/use-ambient-audio";
import {leafEditorialFilm, leafEditorialMedia, type LeafEditorialMedia,} from "./media";
import {useEditorialMotion} from "./use-editorial-motion";
import {useEditorialRail} from "./use-editorial-rail";
import {EditorialCursor} from "./editorial-cursor";
import "./golden-leaves.css";

const LeafScene = dynamic(
  () => import("./leaf-scene").then((module) => module.LeafScene),
  { ssr: false },
);
const gallery = leafEditorialMedia.slice(0, 5);
type Overlay = "gallery" | "film" | null;

function RollingLabel({ children }: { readonly children: string }) {
  return (
    <span className="leaves-label">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

function MediaSlot({
  media,
  className = "",
}: {
  readonly media: LeafEditorialMedia;
  readonly className?: string;
}) {
  return (
    <div
      className={`leaves-media ${className}`}
      data-media-slot={media.id}
      data-placeholder={!media.src}
      role={media.src ? undefined : "img"}
      aria-label={media.src ? undefined : `${media.alt} — image coming soon`}
    >
      {media.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt={media.alt} loading="lazy" />
      ) : null}
    </div>
  );
}

export function GoldenLeavesExperience() {
  const router = useRouter();
  const [language, setLanguage] = useHomeLanguage();
  const back = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLElement>(null);
  const ambient = useRef<HTMLAudioElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogVideo = useRef<HTMLVideoElement>(null);
  const galleryRegion = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [sound, setSound] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [slide, setSlide] = useState(0);
  const [notice, setNotice] = useState("");
  useEditorialMotion(root, reduced);
  const { moveRail } = useEditorialRail(rail, reduced);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduced(preference.matches);
    const syncVisibility = () => setHidden(document.hidden);
    syncMotion();
    syncVisibility();
    preference.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    const observer = new IntersectionObserver((entries) =>
      setShowGallery(Boolean(entries[0]?.isIntersecting)),
    );
    if (galleryRegion.current) observer.observe(galleryRegion.current);
    return () => {
      preference.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
      observer.disconnect();
    };
  }, []);

  const soundError = useCallback(() => {
    setSound(false);
    setNotice("Sound is unavailable. Please try again.");
  }, []);
  useAmbientAudio({
    audioRef: ambient,
    enabled: sound,
    hidden,
    ducked: overlay === "film",
    onPlaybackError: soundError,
  });

  const closeOverlay = useCallback(() => {
    dialogVideo.current?.pause();
    dialog.current?.close();
    setOverlay(null);
    trigger.current?.focus({ preventScroll: true });
  }, []);
  const openOverlay = (kind: Exclude<Overlay, null>, index = 0) => {
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setSlide(index % gallery.length);
    setOverlay(kind);
  };
  useEffect(() => {
    const element = dialog.current;
    if (!overlay || !element) return;
    element.showModal();
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      element.close();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [overlay]);

  const advance = (direction: number) =>
    setSlide((value) => (value + direction + gallery.length) % gallery.length);

  return (
    <article
      ref={root}
      className={`golden-leaves ${didot.variable} ${montserrat.variable}`}
      data-testid="golden-leaves"
      data-reduced-motion={reduced}
    >
      <EditorialCursor rootRef={root} reducedMotion={reduced} />
      <CinematicHeader
        inspect
        language={language}
        onLanguageChange={setLanguage}
        sound={sound}
        onToggleSound={() => {
          setNotice("");
          setSound((value) => !value);
        }}
        onTree={() => router.push("/#tree")}
        onHome={() => router.push("/")}
        onClose={() => router.push("/#tree")}
        backRef={back}
        logo={cinematicMedia.logo}
        logoBlack={cinematicMedia.logoBlack}
      />
      <div className="leaves-progress" aria-hidden="true">
        <span className="leaves-progress__fill" />
      </div>

      <section
        className="leaves-hero"
        aria-label="Golden leaf in three dimensions"
      >
        <div className="leaves-hero__scene">
          <LeafScene reducedMotion={reduced} variant="hero" />
        </div>
        <a
          className="leaves-explore"
          href="#leaves-introduction"
          aria-label="Explore Golden Leaves"
        >
          <span aria-hidden="true">↓</span>
        </a>
      </section>
      <section
        className="leaves-intro"
        id="leaves-introduction"
        aria-labelledby="leaves-title"
      >
        <p className="leaves-eyebrow" data-reveal>
          Golden Leaves
        </p>
        <h1 id="leaves-title" data-reveal>
          <span className="leaves-title-line">
            <span>A thousand leaves.</span>
          </span>
          <span className="leaves-title-line">
            <span>Individual dedications.</span>
          </span>
        </h1>
        <p className="leaves-intro__copy" data-reveal>
          A Golden Leaf is both part of the tree’s form and a personal
          dedication within the composition.
        </p>
      </section>

      <div ref={galleryRegion} className="leaves-gallery-region">
        <section className="leaves-wide" aria-label="Golden leaf photography">
          <button
            className="leaves-wide__frame"
            type="button"
            aria-label="Open Golden Leaves gallery"
            onClick={() => openOverlay("gallery")}
          >
            <MediaSlot media={gallery[0]!} />
          </button>
        </section>
        <section
          className="leaves-mosaic"
          aria-label="Form, detail and dedication"
        >
          {gallery.slice(1).map((media, index) => (
            <figure
              className={`leaves-mosaic__item leaves-mosaic__item--${index + 1}`}
              key={media.id}
              data-parallax={index % 2 === 0 ? 100 : -65}
            >
              <div data-reveal>
                <button
                  className="leaves-image-button"
                  type="button"
                  aria-label={`View ${media.alt}`}
                  onClick={() => openOverlay("gallery", index + 1)}
                >
                  <MediaSlot media={media} />
                </button>
                <figcaption>{media.caption}</figcaption>
              </div>
            </figure>
          ))}
        </section>
      </div>

      <section
        className="leaves-narrative"
        aria-label="The form of a golden leaf"
      >
        <p className="leaves-narrative__first" data-reveal>
          Conceived as a dedication, each leaf brings a personal story into a
          shared work. A single form becomes part of a greater whole.
        </p>
        <div className="leaves-narrative__scene" data-parallax="70">
          <LeafScene reducedMotion={reduced} variant="detail" />
        </div>
        <p className="leaves-narrative__last" data-reveal>
          The proposal centres on a five-metre bronze tree and 1,000 handcrafted
          gold leaves. Individual jewellery elements come together in one
          sculptural composition.
        </p>
      </section>

      <section
        className="leaves-film"
        aria-label="Golden Leaves film"
        data-reveal
      >
        <button
          className="leaves-film__button"
          type="button"
          aria-label="Open Golden Leaves film"
          onClick={() => openOverlay("film")}
        >
          <span
            className="leaves-film__surface"
            data-media-slot="film"
            data-placeholder={!leafEditorialFilm.src}
          >
            {leafEditorialFilm.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={leafEditorialFilm.poster} alt="Golden Leaves film" />
            ) : null}
          </span>
          <span className="leaves-play" aria-hidden="true">
            PLAY
          </span>
        </button>
      </section>

      <section
        className="leaves-story"
        aria-label="A dedication within the whole"
      >
        <p className="leaves-story__copy" data-reveal>
          A leaf holds its place in the crown, while its dedication holds a
          meaning of its own. The design brings these individual expressions
          together in a symbol of humanity.
        </p>
        <figure
          className="leaves-story__image leaves-story__image--first"
          data-parallax="80"
        >
          <div data-reveal>
            <MediaSlot media={leafEditorialMedia[5]!} />
            <figcaption>{leafEditorialMedia[5]!.caption}</figcaption>
          </div>
        </figure>
        <figure
          className="leaves-story__image leaves-story__image--last"
          data-parallax="-55"
        >
          <div data-reveal>
            <MediaSlot media={leafEditorialMedia[6]!} />
            <figcaption>{leafEditorialMedia[6]!.caption}</figcaption>
          </div>
        </figure>
      </section>

      <section
        className="leaves-community"
        aria-labelledby="leaves-community-title"
      >
        <div className="leaves-community__heading" data-reveal>
          <h2 id="leaves-community-title">
            Follow the story
            <br />
            of Tree of Unity
          </h2>
          <Link className="leaves-text-link" href="/story">
            <RollingLabel>EXPLORE THE PROJECT</RollingLabel>
          </Link>
        </div>
        <div
          className="leaves-rail"
          ref={rail}
          data-testid="leaves-rail"
          aria-label="Golden Leaves images"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              moveRail(event.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          {Array.from({ length: 3 }, (_, repeat) =>
            gallery.map((media, index) => (
              <button
                type="button"
                key={`${repeat}-${media.id}`}
                className={`leaves-rail__item leaves-rail__item--${index}`}
                aria-label={`View ${media.alt}`}
                style={
                  {
                    "--rail-offset": `${[28, 64, 0, -24, 28][index]}px`,
                  } as CSSProperties
                }
                onClick={() => openOverlay("gallery", index)}
              >
                <MediaSlot media={media} />
              </button>
            )),
          )}
        </div>
        <div className="leaves-rail-controls">
          <button
            type="button"
            onClick={() => moveRail(-1)}
            aria-label="Previous images"
          >
            PREVIOUS
          </button>
          <span aria-hidden="true" />
          <button
            type="button"
            onClick={() => moveRail(1)}
            aria-label="Next images"
          >
            NEXT
          </button>
        </div>
      </section>

      <section
        className="leaves-contact"
        aria-labelledby="leaves-contact-title"
      >
        <div className="leaves-contact__background" data-parallax="80">
          <MediaSlot media={leafEditorialMedia[7]!} />
        </div>
        <div className="leaves-contact__card" data-reveal>
          <h2 id="leaves-contact-title">
            More information
            <br />
            about Golden Leaves
          </h2>
          <Link href="/contact" className="leaves-contact__link">
            <RollingLabel>CONTACT TREE OF UNITY</RollingLabel>
          </Link>
        </div>
      </section>
      <section className="leaves-ending" aria-labelledby="leaves-ending-title">
        <div data-reveal>
          <h2 id="leaves-ending-title">Continue the discovery</h2>
          <Link className="leaves-text-link" href="/#tree">
            <RollingLabel>RETURN TO THE TREE</RollingLabel>
          </Link>
        </div>
      </section>

      <button
        className="leaves-all-pictures"
        type="button"
        data-visible={showGallery && !overlay}
        tabIndex={showGallery && !overlay ? 0 : -1}
        aria-hidden={!showGallery || Boolean(overlay)}
        onClick={() => openOverlay("gallery")}
      >
        <span className="leaves-gallery-mark" aria-hidden="true" />
        <RollingLabel>ALL PICTURES</RollingLabel>
      </button>
      <p className="leaves-notice" role="status">
        {notice}
      </p>
      <audio
        ref={ambient}
        src={cinematicMedia.ambient.audio}
        preload="none"
        loop
        onError={soundError}
      />

      <dialog
        ref={dialog}
        className={`leaves-dialog ${didot.variable} ${montserrat.variable}`}
        aria-labelledby="leaves-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          closeOverlay();
        }}
        onKeyDown={(event) => {
          if (
            overlay === "gallery" &&
            ["ArrowRight", "ArrowLeft"].includes(event.key)
          ) {
            event.preventDefault();
            advance(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        <h2 id="leaves-dialog-title" className="leaves-dialog__title">
          {overlay === "film"
            ? "Golden Leaves — the film"
            : "Golden Leaves — gallery"}
        </h2>
        <button
          className="leaves-close leaves-dialog__close"
          aria-label="Close gallery or film"
          type="button"
          onClick={closeOverlay}
        >
          <span className="leaves-cross" aria-hidden="true" />
        </button>
        {overlay === "gallery" ? (
          <>
            <figure className="leaves-dialog__slide" key={slide}>
              <MediaSlot media={gallery[slide]!} />
              <figcaption>{gallery[slide]!.caption}</figcaption>
            </figure>
            <div className="leaves-dialog__controls">
              <button
                type="button"
                onClick={() => advance(-1)}
                aria-label="Previous picture"
              >
                PREVIOUS
              </button>
              <span aria-live="polite">
                {slide + 1} / {gallery.length}
              </span>
              <button
                type="button"
                onClick={() => advance(1)}
                aria-label="Next picture"
              >
                NEXT
              </button>
            </div>
          </>
        ) : overlay === "film" ? (
          <div className="leaves-dialog__film">
            {leafEditorialFilm.src ? (
              <video
                ref={dialogVideo}
                src={leafEditorialFilm.src}
                poster={leafEditorialFilm.poster ?? undefined}
                controls
                autoPlay
                playsInline
              />
            ) : (
              <div className="leaves-film-placeholder">
                <p>The Golden Leaves film is being prepared.</p>
              </div>
            )}
          </div>
        ) : null}
      </dialog>
    </article>
  );
}
