"use client";

import {type RefObject, useEffect, useRef, useState} from "react";
import {interpolate} from "@/i18n/catalog";
import type {Locale} from "@/i18n/locales";
import {getCountryName} from "./countries";
import {votingCopy} from "./copy";
import {votingNumber} from "./format";
import type {Nominee} from "./nominees";
import {safePublicUrl} from "./nomination-validation";
import {getProfileCopy} from "./profile-copy";
import {getVisibleNominator} from "./profile-data";
import {Portrait} from "./portrait";
import {fullName} from "./voting-model";
import {ContributionGallery} from "./contribution-gallery";
import {ContributionDetail} from "./contribution-detail";
import "./nominee-profile.css";

export function NomineeProfile({
  person,
  language,
  rank,
  votes,
  voted,
  disabled,
  closing,
  confirming,
  reduced,
  headingRef,
  onClose,
  onVote,
  onConfirm,
  onCancel,
}: {
  person: Nominee;
  language: Locale;
  rank: number;
  votes: number;
  voted: boolean;
  disabled: boolean;
  closing: boolean;
  confirming: boolean;
  reduced: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onClose: () => void;
  onVote: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const copy = votingCopy[language];
  const words = getProfileCopy(language);
  const viewport = useRef<HTMLDivElement>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const voteButton = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);
  const [contribution, setContribution] = useState(() =>
    Math.floor(Math.min(person.contributions?.length ?? 0, 6) / 2),
  );
  const [openedContribution, setOpenedContribution] = useState<{
    index: number;
    source: HTMLButtonElement;
  } | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [shareUrl, setShareUrl] = useState("");
  const facts = person.contributions?.slice(0, 6) ?? [];
  const links = (person.links ?? []).flatMap((link) => {
    const url = safePublicUrl(link.url);
    return url ? [{ ...link, url }] : [];
  });
  const nominator = getVisibleNominator(person);
  const sections = [
    { id: "overview", label: words.profileOverview },
    ...(facts.length
      ? [{ id: "contributions", label: words.contributions }]
      : []),
    ...(links.length ? [{ id: "links", label: words.links }] : []),
  ];
  useEffect(() => {
    if (confirming) confirmation.current?.focus({ preventScroll: true });
    else if (wasConfirming.current)
      voteButton.current?.focus({ preventScroll: true });
    wasConfirming.current = confirming;
  }, [confirming]);
  useEffect(() => {
    const root = viewport.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setActiveSection(entry.target.id.replace("nominee-", ""));
      },
      { root, threshold: 0, rootMargin: "-15% 0px -65% 0px" },
    );
    root
      .querySelectorAll("[data-profile-slide]")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  const goTo = (id: string) => {
    const section = viewport.current?.querySelector<HTMLElement>(
      `#nominee-${id}`,
    );
    const root = viewport.current;
    if (root && section)
      root.scrollTo({
        top:
          root.scrollTop +
          section.getBoundingClientRect().top -
          root.getBoundingClientRect().top,
        behavior: reduced ? "instant" : "smooth",
      });
    section?.focus({ preventScroll: true });
  };
  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("nominee", person.id);
    url.hash = "nominees";
    setShareUrl(url.href);
    try {
      if (navigator.share) {
        await navigator.share({
          title: fullName(person) + " · Tree of Unity",
          url: url.href,
        });
        return;
      }
      await navigator.clipboard.writeText(url.href);
      setShareState("copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareState("error");
    }
  };
  const fact = facts[Math.min(contribution, facts.length - 1)];
  return (
    <section
      className="nominee-profile voting-panel--profile"
      aria-labelledby="voting-panel-title"
      data-closing={closing}
      inert={closing}
    >
      <div className="nominee-profile__toolbar">
        <button
          className="nominee-profile__back"
          type="button"
          onClick={onClose}
        >
          <span className="nominee-direction" aria-hidden="true">
            ←
          </span>
          {copy.backToNominees}
        </button>
        <span className="nominee-profile__edition">{copy.profile}</span>
        <button
          className="nominee-profile__close"
          type="button"
          aria-label={copy.close}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="nominee-profile__reading">
        <div
          className="nominee-profile__viewport"
          ref={viewport}
          inert={confirming || openedContribution !== null}
          aria-hidden={confirming || openedContribution !== null || undefined}
        >
          <section
            className="nominee-slide nominee-overview"
            id="nominee-overview"
            data-profile-slide
            tabIndex={-1}
            aria-label={words.profileOverview}
          >
            <div className="nominee-overview__portrait">
              <Portrait person={person} large />
              <span className="voting-kicker">{copy.demo}</span>
            </div>
            <div className="nominee-overview__story">
              <p className="voting-kicker nominee-rank" aria-live="polite">
                {interpolate(words.currentRank, {
                  rank: votingNumber(rank, language),
                })}
              </p>
              <h3
                id="voting-panel-title"
                ref={headingRef}
                tabIndex={-1}
                dir="auto"
              >
                {fullName(person)}
              </h3>
              <p className="nominee-location">
                {getCountryName(person.country, language)}
                <span aria-hidden="true"> · </span>
                <bdi>{person.city}</bdi>
              </p>
              <p className="nominee-occupation">{person.activity[language]}</p>
              {nominator && (
                <p className="nominee-nominator" dir="auto">
                  {interpolate(words.nominatedBy, { name: nominator })}
                </p>
              )}
              <div className="nominee-reason">
                <h4 className="voting-kicker">{words.whyNominated}</h4>
                <p>{person.reason[language]}</p>
              </div>
              {sections[1] && (
                <button
                  className="voting-text-link nominee-next"
                  type="button"
                  onClick={() => {
                    const next = sections[1];
                    if (next) goTo(next.id);
                  }}
                >
                  {words.nextSection}
                  <span aria-hidden="true">↓</span>
                </button>
              )}
            </div>
          </section>
          {fact && (
            <section
              className="nominee-slide nominee-contributions"
              id="nominee-contributions"
              data-profile-slide
              tabIndex={-1}
              aria-labelledby="nominee-contributions-title"
            >
              <div className="nominee-slide__heading">
                <h4 id="nominee-contributions-title">{words.contributions}</h4>
              </div>
              <ContributionGallery
                facts={facts}
                language={language}
                active={contribution}
                reduced={reduced}
                onChange={setContribution}
                onOpen={(index, source) =>
                  setOpenedContribution({ index, source })
                }
              />
            </section>
          )}
          {links.length > 0 && (
            <section
              className="nominee-slide nominee-links"
              id="nominee-links"
              data-profile-slide
              tabIndex={-1}
              aria-labelledby="nominee-links-title"
            >
              <div className="nominee-slide__heading">
                <p className="voting-kicker">{fullName(person)}</p>
                <h4 id="nominee-links-title">{words.links}</h4>
              </div>
              <ul>
                {links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>
                        <strong>{link.label[language]}</strong>
                        <bdi>
                          {new URL(link.url).hostname +
                            (new URL(link.url).pathname === "/"
                              ? ""
                              : new URL(link.url).pathname)}
                        </bdi>
                      </span>
                      <span className="nominee-direction" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        {openedContribution && facts[openedContribution.index] && (
          <ContributionDetail
            fact={facts[openedContribution.index]!}
            index={openedContribution.index}
            language={language}
            source={openedContribution.source}
            reduced={reduced}
            onClose={() => setOpenedContribution(null)}
          />
        )}
      </div>
      <div
        className="nominee-profile__bottom"
        inert={confirming}
        aria-hidden={confirming || undefined}
      >
        {sections.length > 1 && (
          <nav
            className="nominee-section-nav"
            aria-label={copy.profile}
            inert={openedContribution !== null}
            aria-hidden={openedContribution !== null || undefined}
          >
            {sections.map((section, index) => (
              <button
                type="button"
                key={section.id}
                aria-label={section.label}
                aria-current={activeSection === section.id ? "step" : undefined}
                onClick={() => goTo(section.id)}
              >
                <span>{votingNumber(index + 1, language, 2)}</span>
                <i />
              </button>
            ))}
          </nav>
        )}
        <div className="nominee-vote-dock">
          <div className="nominee-vote-dock__count" aria-live="polite">
            <strong>{votingNumber(votes, language)}</strong>
            <span>{copy.votes}</span>
          </div>
          <button
            ref={voteButton}
            className="nominee-vote-dock__vote"
            type="button"
            disabled={disabled}
            onClick={onVote}
          >
            {voted
              ? copy.voted
              : interpolate(copy.voteFor, { name: person.firstName })}
            <span className="nominee-direction" aria-hidden="true">
              {voted ? "✓" : "→"}
            </span>
          </button>
          <button
            type="button"
            className="nominee-vote-dock__share"
            onClick={share}
          >
            {words.share}
            <span className="nominee-direction" aria-hidden="true">
              ↗
            </span>
          </button>
        </div>
        <div className="nominee-share-status" role="status">
          {shareState === "copied" ? (
            words.copied
          ) : shareState === "error" ? (
            <>
              <span>{words.shareError}</span>
              <input
                aria-label={words.share}
                dir="ltr"
                readOnly
                value={shareUrl}
                onFocus={(event) => event.target.select()}
              />
            </>
          ) : null}
        </div>
      </div>
      {confirming && (
        <div
          className="nominee-confirm"
          role="group"
          aria-labelledby="nominee-confirm-title"
        >
          <div>
            <p className="voting-kicker">{copy.round}</p>
            <h4 id="nominee-confirm-title" tabIndex={-1} ref={confirmation}>
              {copy.confirmTitle}
            </h4>
            <p>{copy.confirmText}</p>
            <p className="nominee-confirm__name">{fullName(person)}</p>
            <div className="voting-actions">
              <button
                className="voting-outline"
                type="button"
                onClick={onCancel}
              >
                {copy.cancel}
              </button>
              <button
                className="voting-solid"
                type="button"
                disabled={disabled}
                onClick={onConfirm}
              >
                {copy.confirm}
              </button>
            </div>
            <small>{copy.demo}</small>
          </div>
        </div>
      )}
    </section>
  );
}
