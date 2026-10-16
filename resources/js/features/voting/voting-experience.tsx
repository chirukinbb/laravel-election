"use client";
import React, {type CSSProperties, Suspense, useCallback, useEffect, useMemo, useRef, useState,} from "react";
import {localeDirection} from "@/i18n/locales";

import {GlobalHeader} from "@/components/navigation/global-header";
import {didot, montserrat} from "@/features/home/fonts";
import {useHomeLanguage} from "@/features/home/use-home-language";
import type {HomeLanguage} from "@/features/home/copy";
import {type Continent, countries, getCountryName} from "./countries";
import {type Nominee, nominees} from "./nominees";
import {votingCopy} from "./copy";
import {votingCount, votingNumber} from "./format";
import {Countdown} from "./countdown";
import {Portrait} from "./portrait";
import {useVotingMotion} from "./use-voting-motion";
import {
  type CandidateSort,
  DEMO_ROUND,
  filterNominees,
  fullName,
  getRanking,
  normalizeSearch,
  voteCount,
} from "./voting-model";
import {emptyNominationDraft} from "./nomination-validation";
import {getProfileCopy} from "./profile-copy";
import {getEnhancementCopy} from "./enhancement-copy";
import "./voting.css";

// Замена next/dynamic на React.lazy
const VotingMapComponent = React.lazy(() =>
    import("./voting-map").then((module) => ({ default: module.VotingMap }))
);

function VotingMapFallback() {
  return (
      <div className="voting-map-loading" aria-busy="true">
        <span />
      </div>
  );
}

type View = "list" | "map";
type Panel =
    | "profile"
    | "confirm"
    | "success"
    | "nominate"
    | "review"
    | "nomination-success"
    | null;

const PAGE_SIZE = 10;
const counts = nominees.reduce<Record<string, number>>((result, person) => {
  result[person.country] = (result[person.country] ?? 0) + 1;
  return result;
}, {});

function Arrow({ down = false }: { readonly down?: boolean }) {
  return (
      <svg
          className={down ? "voting-arrow voting-arrow--down" : "voting-arrow"}
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style={down ? { transform: "rotate(90deg)" } : undefined}
      >
        <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.1" />
      </svg>
  );
}

function Search({
                  label,
                  value,
                  onChange,
                }: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
      <label className="voting-search">
        <svg
            viewBox="0 0 24 24"
            width="23"
            height="23"
            fill="none"
            aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2" />
          <path d="m15 15 6 6" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <input
            type="search"
            dir="auto"
            aria-label={label}
            placeholder={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
      </label>
  );
}

function Pagination({
                      page,
                      total,
                      size,
                      onChange,
                      language,
                    }: {
  readonly page: number;
  readonly total: number;
  readonly size: number;
  readonly onChange: (page: number) => void;
  readonly language: HomeLanguage;
}) {
  const copy = votingCopy[language];
  const pages = Math.max(1, Math.ceil(total / size));
  const visiblePages = [...new Set([1, page - 1, page, page + 1, pages])]
      .filter((value) => value >= 1 && value <= pages)
      .sort((a, b) => a - b);
  return (
      <nav className="voting-pagination" aria-label={copy.page}>
      <span>
        {votingNumber(total ? (page - 1) * size + 1 : 0, language)}–
        {votingNumber(Math.min(page * size, total), language)} {copy.of}{" "}
        {votingNumber(total, language)}
      </span>
        <div>
          <button
              type="button"
              disabled={page === 1}
              onClick={() => onChange(page - 1)}
              aria-label={copy.previous}
          >
            {localeDirection(language) === "rtl" ? "›" : "‹"}
          </button>
          {visiblePages.map((value, index) => (
              <span key={value} className="voting-pagination__page">
            {index > 0 && value > (visiblePages[index - 1] ?? 0) + 1 ? (
                <span aria-hidden="true">…</span>
            ) : null}
                <button
                    type="button"
                    aria-label={copy.page + " " + votingNumber(value, language)}
                    aria-current={page === value ? "page" : undefined}
                    onClick={() => onChange(value)}
                >
              {votingNumber(value, language)}
            </button>
          </span>
          ))}
          <button
              type="button"
              disabled={page === pages}
              onClick={() => onChange(page + 1)}
              aria-label={copy.next}
          >
            {localeDirection(language) === "rtl" ? "‹" : "›"}
          </button>
        </div>
      </nav>
  );
}

export function VotingExperience() {
  const [language] = useHomeLanguage();
  const copy = votingCopy[language];
  const profileCopy = getProfileCopy(language);
  const enhancementCopy = getEnhancementCopy(language);
  const [view, setView] = useState<View>("list");
  const [query, setQuery] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [continent, setContinent] = useState<Continent | null>(null);
  const [sort, setSort] = useState<CandidateSort>("votes");
  const [countrySort, setCountrySort] = useState<"name" | "count">("name");
  const [page, setPage] = useState(1);
  const [countryPage, setCountryPage] = useState(1);
  const [countryPageSize, setCountryPageSize] = useState(10);
  const [selected, setSelected] = useState<string | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [profile, setProfile] = useState<Nominee | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [voteOrigin, setVoteOrigin] = useState<"profile" | null>(null);
  const [nomination, setNomination] = useState(emptyNominationDraft);
  const [panelClosing, setPanelClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileMode =
      panel === "profile" || (panel === "confirm" && voteOrigin === "profile");
  const directoryDissolved = panel !== null && !panelClosing;
  const [closed, setClosed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const hero = useRef<HTMLElement>(null);
  const workspace = useRef<HTMLElement>(null);
  const countryList = useRef<HTMLOListElement>(null);
  const countryCapacity = useRef(10);
  useVotingMotion(hero, workspace);
  const panelHeading = useRef<HTMLHeadingElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const previousPanel = useRef<Panel>(null);
  const closeRound = useCallback(() => setClosed(true), []);
  const chosen = nominees.find((person) => person.id === selected) ?? null;
  const ranked = useMemo(
      () => getRanking(nominees, voted, language),
      [voted, language]
  );
  const filtered = useMemo(
      () => filterNominees(nominees, query, country, sort, language, voted),
      [query, country, sort, language, voted]
  );
  const currentPage = Math.min(
      page,
      Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  );
  const orderedCountries = useMemo(
      () =>
          [...countries].sort((a, b) =>
              getCountryName(a.code, language).localeCompare(
                  getCountryName(b.code, language),
                  language
              )
          ),
      [language]
  );
  const filteredCountries = useMemo(
      () =>
          orderedCountries
              .filter(
                  (item) =>
                      (!continent || item.continent === continent) &&
                      normalizeSearch(
                          getCountryName(item.code, language),
                          language
                      ).includes(normalizeSearch(countryQuery, language))
              )
              .sort((a, b) =>
                  countrySort === "count"
                      ? (counts[b.code] ?? 0) - (counts[a.code] ?? 0) ||
                      getCountryName(a.code, language).localeCompare(
                          getCountryName(b.code, language),
                          language
                      )
                      : 0
              ),
      [orderedCountries, continent, countryQuery, countrySort, language]
  );
  const currentCountryPage = Math.min(
      countryPage,
      Math.max(1, Math.ceil(filteredCountries.length / countryPageSize))
  );
  const countryTotal = filteredCountries.reduce(
      (sum, item) => sum + (counts[item.code] ?? 0),
      0
  );
  const hasCountries = filteredCountries.length > 0;

  useEffect(() => {
    const list = countryList.current;
    if (!list || view !== "map" || country || panel || !hasCountries) return;
    const fitRows = () => {
      const height = list.clientHeight;
      if (height <= 0) return;
      const nextSize = Math.max(1, Math.floor(height / 46));
      const previousSize = countryCapacity.current;
      if (nextSize === previousSize) return;
      countryCapacity.current = nextSize;
      setCountryPage(
          (previousPage) =>
              Math.floor(((previousPage - 1) * previousSize) / nextSize) + 1
      );
      setCountryPageSize(nextSize);
    };
    const observer = new ResizeObserver(fitRows);
    observer.observe(list);
    fitRows();
    return () => observer.disconnect();
  }, [view, country, panel, hasCountries]);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const openPanel = (next: Panel) => {
    if (!panel) {
      origin.current =
          document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setPanelClosing(false);
    setPanel(next);
  };

  const closePanel = useCallback(() => {
    if (closeTimer.current) return;
    const finish = () => {
      closeTimer.current = null;
      setPanel(null);
      setPanelClosing(false);
      const url = new URL(window.location.href);
      if (url.searchParams.has("nominee")) {
        url.searchParams.delete("nominee");
        window.history.replaceState(window.history.state, "", url);
      }
      requestAnimationFrame(() => {
        origin.current?.focus({ preventScroll: true });
      });
    };
    if (panel !== null && !reduced) {
      setPanelClosing(true);
      closeTimer.current = setTimeout(finish, 450);
    } else finish();
  }, [panel, reduced]);

  useEffect(
      () => () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
      },
      []
  );

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("nominee");
    const person = nominees.find((item) => item.id === id);
    if (!person) return;
    const frame = requestAnimationFrame(() => {
      origin.current = workspace.current;
      setProfile(person);
      setPanel("profile");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const opening = panel !== null && previousPanel.current === null;
    previousPanel.current = panel;
    if (!panel) return;
    panelHeading.current?.focus({ preventScroll: true });
    const frame = opening
        ? requestAnimationFrame(() => {
          const block = workspace.current;
          if (block)
            window.scrollTo({
              top: window.scrollY + block.getBoundingClientRect().top,
              behavior: reduced ? "instant" : "smooth",
            });
        })
        : 0;
    const escape = (event: KeyboardEvent) => {
      if (
          event.defaultPrevented ||
          (event.target instanceof HTMLElement &&
              event.target.closest("[data-navigation-surface]"))
      )
        return;
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
    };
    document.addEventListener("keydown", escape);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", escape);
    };
  }, [panel, closePanel, reduced]);

  const openProfile = (person: Nominee) => {
    setProfile(person);
    setVoteOrigin(null);
    openPanel("profile");
  };

  const selectCountry = (code: string | null) => {
    const focusedSidebar = document.activeElement?.closest(
        ".voting-map-sidebar"
    );
    if (
        code &&
        continent &&
        countries.find((item) => item.code === code)?.continent !== continent
    ) {
      setContinent(null);
      setCountryPage(1);
    }
    setCountry(code);
    setPage(1);
    setQuery("");
    if (focusedSidebar) {
      requestAnimationFrame(() => {
        const destination = focusedSidebar.querySelector<HTMLElement>(
            code ? ".voting-country-heading h3" : 'input[type="search"]'
        );
        destination?.focus({ preventScroll: true });
      });
    }
  };

  const resetFilters = () => {
    setCountry(null);
    setQuery("");
    setPage(1);
    setContinent(null);
    setCountryQuery("");
    setCountryPage(1);
  };

  const toNominees = () => {
    workspace.current?.focus({ preventScroll: true });
    workspace.current?.scrollIntoView({
      behavior: reduced ? "instant" : "smooth",
      block: "start",
    });
  };

  const beginVote = (person: Nominee) => {
    setVoteOrigin(panel === "profile" ? "profile" : null);
    setSelected(person.id);
    openPanel(voted ? "success" : "confirm");
  };

  const confirmVote = () => {
    if (Date.now() >= Date.parse(DEMO_ROUND.endsAt)) {
      setClosed(true);
      return;
    }
    if (!voted && selected) {
      setVoted(selected);
      setPanel(voteOrigin === "profile" ? "profile" : "success");
    }
  };

  const panelPerson = panel === "profile" ? profile : chosen;
  const title =
      panel === "profile" && profile
          ? fullName(profile)
          : panel === "confirm"
              ? copy.confirmTitle
              : panel === "success"
                  ? copy.successTitle
                  : panel === "nominate"
                      ? copy.nominateTitle
                      : panel === "review"
                          ? copy.reviewTitle
                          : panel === "nomination-success"
                              ? copy.nominationSuccess
                              : "";

  const renderTable = (compact = false) => (
      <div
          className={"voting-results" + (compact ? " voting-results--compact" : "")}
      >
        {filtered.length ? (
            <table className="voting-table">
              <thead>
              <tr>
                <th scope="col">{copy.rank}</th>
                <th scope="col">{copy.nominee}</th>
                {!compact && <th scope="col">{copy.country}</th>}
                <th scope="col">{copy.votes}</th>
                <th scope="col">
                  <span className="voting-sr-only">{copy.select}</span>
                </th>
              </tr>
              </thead>
              <tbody>
              {filtered
                  .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                  .map((person) => (
                      <tr
                          key={person.id}
                          data-selected={selected === person.id}
                          data-nominee-id={person.id}
                      >
                        <td className="voting-rank">
                          {votingNumber(
                              ranked.findIndex((item) => item.id === person.id) + 1,
                              language,
                              2
                          )}
                        </td>
                        <td>
                          <button
                              type="button"
                              className="voting-person"
                              onClick={() => openProfile(person)}
                              aria-label={copy.profile + ": " + fullName(person)}
                          >
                            <Portrait person={person} />
                            <span>
                        <strong>{fullName(person)}</strong>
                        <small className="voting-person__activity">
                          {compact
                              ? getCountryName(person.country, language)
                              : person.activity[language]}
                        </small>
                              {!compact && (
                                  <small className="voting-person__country">
                                    {getCountryName(person.country, language)}
                                  </small>
                              )}
                      </span>
                          </button>
                        </td>
                        {!compact && (
                            <td className="voting-country-cell">
                              {getCountryName(person.country, language)}
                            </td>
                        )}
                        <td className="voting-vote-count">
                          {votingNumber(voteCount(person, voted), language)}
                        </td>
                        <td>
                          <input
                              type="radio"
                              name={
                                compact ? "voting-country-nominee" : "voting-nominee"
                              }
                              className="voting-radio"
                              checked={selected === person.id}
                              onChange={() => setSelected(person.id)}
                              aria-label={copy.select + " " + fullName(person)}
                          />
                        </td>
                      </tr>
                  ))}
              </tbody>
            </table>
        ) : (
            <div className="voting-empty" role="status">
              <h3>{copy.noResults}</h3>
              <p>{copy.noResultsDetail}</p>
              <button
                  type="button"
                  className="voting-text-link"
                  onClick={resetFilters}
              >
                {copy.clear}
              </button>
            </div>
        )}
        <Pagination
            page={currentPage}
            total={filtered.length}
            size={PAGE_SIZE}
            onChange={setPage}
            language={language}
        />
      </div>
  );

  return (
      <div
          className={
              "voting-experience " + didot.variable + " " + montserrat.variable
          }
          lang={language}
          dir={localeDirection(language)}
      >
        <GlobalHeader />
        <section
            ref={hero}
            className="voting-hero"
            aria-labelledby="voting-title"
        >
          <div className="voting-hero__backdrop" aria-hidden="true" />
          <div className="voting-hero__content">
            <p className="voting-kicker voting-hero__eyebrow">{copy.round}</p>
            <h1 id="voting-title">{copy.humanity}</h1>
            <p className="voting-hero__intro">{copy.intro}</p>
            <Countdown language={language} onClose={closeRound} />
          </div>
          <button type="button" className="voting-explore" onClick={toNominees}>
            <span>{copy.view}</span>
            <Arrow down />
          </button>
        </section>

        <section
            ref={workspace}
            className="voting-workspace"
            data-profile-open={profileMode}
            data-panel-open={panel !== null}
            data-profile-closing={panelClosing}
            id="nominees"
            tabIndex={-1}
            aria-labelledby="voting-workspace-title"
        >
          <h2 className="voting-sr-only" id="voting-workspace-title">
            {copy.view}
          </h2>
          {closed && (
              <p className="voting-closed" role="status">
                {copy.closed}
              </p>
          )}
          <div
              className="voting-tabs voting-directory-ui"
              data-dissolved={directoryDissolved}
              inert={panel !== null ? true : undefined}
              aria-hidden={panel !== null || undefined}
          >
            <div role="tablist" aria-label={copy.view}>
              <button
                  id="voting-list-tab"
                  role="tab"
                  type="button"
                  aria-selected={view === "list"}
                  aria-controls="voting-list-panel"
                  tabIndex={view === "list" ? 0 : -1}
                  onClick={() => setView("list")}
                  onKeyDown={(event) => {
                    if (
                        event.key ===
                        (localeDirection(language) === "rtl"
                            ? "ArrowLeft"
                            : "ArrowRight")
                    ) {
                      setView("map");
                      document.getElementById("voting-map-tab")?.focus();
                    }
                  }}
              >
                {copy.list}
              </button>
              <button
                  id="voting-map-tab"
                  role="tab"
                  type="button"
                  aria-selected={view === "map"}
                  aria-controls="voting-map-panel"
                  tabIndex={view === "map" ? 0 : -1}
                  onClick={() => setView("map")}
                  onKeyDown={(event) => {
                    if (
                        event.key ===
                        (localeDirection(language) === "rtl"
                            ? "ArrowRight"
                            : "ArrowLeft")
                    ) {
                      setView("list");
                      document.getElementById("voting-list-tab")?.focus();
                    }
                  }}
              >
                {copy.map}
              </button>
            </div>
            <button
                type="button"
                className="voting-text-link"
                onClick={() => openPanel("nominate")}
            >
              {copy.nominate}
              <span aria-hidden="true">
              {localeDirection(language) === "rtl" ? "↖" : "↗"}
            </span>
            </button>
          </div>
          <div className="voting-stage" data-panel={panel ?? view}>
            <div
                className="voting-directory voting-directory-ui"
                data-dissolved={directoryDissolved}
                inert={panel !== null ? true : undefined}
                aria-hidden={panel !== null || undefined}
            >
              <div
                  id="voting-list-panel"
                  role="tabpanel"
                  aria-labelledby="voting-list-tab"
                  hidden={view !== "list"}
              >
                <button
                    className="voting-filter-toggle voting-text-link"
                    type="button"
                    aria-expanded={filtersOpen}
                    aria-controls="voting-filters"
                    onClick={() => setFiltersOpen((value) => !value)}
                >
                  {filtersOpen ? copy.hideFilters : copy.showFilters}
                  <span aria-hidden="true">+</span>
                </button>
                <div
                    className="voting-filters"
                    id="voting-filters"
                    data-open={filtersOpen}
                >
                  <Search
                      label={copy.search}
                      value={query}
                      onChange={(value) => {
                        setQuery(value);
                        setPage(1);
                      }}
                  />
                  <label className="voting-select">
                    <span className="voting-sr-only">{copy.country}</span>
                    <select
                        aria-label={copy.country}
                        value={country ?? ""}
                        onChange={(event) =>
                            selectCountry(event.target.value || null)
                        }
                    >
                      <option value="">{copy.allCountries}</option>
                      {orderedCountries.map((item) => (
                          <option key={item.code} value={item.code}>
                            {getCountryName(item.code, language)}
                          </option>
                      ))}
                    </select>
                  </label>
                  <label className="voting-select">
                    <span className="voting-sr-only">{copy.sort}</span>
                    <select
                        aria-label={copy.sort}
                        value={sort}
                        onChange={(event) => {
                          setSort(event.target.value as CandidateSort);
                          setPage(1);
                        }}
                    >
                      <option value="votes">{copy.mostVotes}</option>
                      <option value="name">{copy.alphabetical}</option>
                    </select>
                  </label>
                </div>
                {renderTable()}
              </div>
              <div
                  id="voting-map-panel"
                  role="tabpanel"
                  aria-labelledby="voting-map-tab"
                  hidden={view !== "map"}
                  className="voting-map-panel"
              >
                {view === "map" && (
                    <div className="voting-map-layout">
                      <div className="voting-map-area">
                        <Suspense fallback={<VotingMapFallback />}>
                          <VotingMapComponent
                              language={language}
                              continent={continent}
                              selectedCountry={country}
                              counts={counts}
                              onContinentChange={(value) => {
                                setContinent(value);
                                setCountryPage(1);
                                if (
                                    country &&
                                    countries.find((item) => item.code === country)
                                        ?.continent !== value
                                )
                                  selectCountry(null);
                              }}
                              onCountrySelect={selectCountry}
                          />
                        </Suspense>
                      </div>
                      <aside
                          className="voting-map-sidebar"
                          aria-label={country ? copy.nominees : copy.countries}
                      >
                        {country ? (
                            <div className="voting-country-nominees" key={country}>
                              <header className="voting-country-heading">
                                <button
                                    className="voting-text-link voting-country-back"
                                    type="button"
                                    onClick={() => selectCountry(null)}
                                >
                                  <Arrow />
                                  <span>{copy.allCountries}</span>
                                </button>
                                <h3 tabIndex={-1}>
                                  {getCountryName(country, language)}
                                </h3>
                                <p className="voting-kicker">
                                  {votingCount(
                                      counts[country] ?? 0,
                                      "nominees",
                                      language
                                  )}
                                </p>
                              </header>
                              <Search
                                  label={copy.search}
                                  value={query}
                                  onChange={(value) => {
                                    setQuery(value);
                                    setPage(1);
                                  }}
                              />
                              <label className="voting-select voting-map-sort">
                                <span>{copy.sort}</span>
                                <select
                                    aria-label={copy.sort}
                                    value={sort}
                                    onChange={(event) => {
                                      setSort(event.target.value as CandidateSort);
                                      setPage(1);
                                    }}
                                >
                                  <option value="votes">{copy.mostVotes}</option>
                                  <option value="name">{copy.alphabetical}</option>
                                </select>
                              </label>
                              <div className="voting-country-nominees__results">
                                {renderTable(true)}
                              </div>
                            </div>
                        ) : (
                            <div className="voting-country-browser" key="countries">
                              <Search
                                  label={copy.searchCountries}
                                  value={countryQuery}
                                  onChange={(value) => {
                                    setCountryQuery(value);
                                    setCountryPage(1);
                                  }}
                              />
                              <div className="voting-country-toolbar">
                          <span className="voting-kicker">
                            {votingCount(
                                filteredCountries.length,
                                "countries",
                                language
                            )}{" "}
                            · {votingCount(countryTotal, "nominees", language)}
                          </span>
                                <select
                                    value={countrySort}
                                    aria-label={copy.sort}
                                    onChange={(event) => {
                                      setCountrySort(
                                          event.target.value as "name" | "count"
                                      );
                                      setCountryPage(1);
                                    }}
                                >
                                  <option value="name">{copy.alphabetical}</option>
                                  <option value="count">{copy.mostNominees}</option>
                                </select>
                              </div>
                              {filteredCountries.length ? (
                                  <ol
                                      className="voting-country-list"
                                      ref={countryList}
                                      style={
                                        {
                                          "--country-rows": countryPageSize,
                                        } as CSSProperties
                                      }
                                      start={
                                          (currentCountryPage - 1) * countryPageSize + 1
                                      }
                                  >
                                    {filteredCountries
                                        .slice(
                                            (currentCountryPage - 1) * countryPageSize,
                                            currentCountryPage * countryPageSize
                                        )
                                        .map((item) => (
                                            <li key={item.code}>
                                              <button
                                                  type="button"
                                                  title={getCountryName(item.code, language)}
                                                  onClick={() => selectCountry(item.code)}
                                              >
                                    <span>
                                      {getCountryName(item.code, language)}
                                    </span>
                                                <span>
                                      {votingNumber(
                                          counts[item.code] ?? 0,
                                          language
                                      )}
                                    </span>
                                                <span aria-hidden="true">
                                      {localeDirection(language) === "rtl"
                                          ? "‹"
                                          : "›"}
                                    </span>
                                              </button>
                                            </li>
                                        ))}
                                  </ol>
                              ) : (
                                  <p className="voting-empty">{copy.noCountries}</p>
                              )}
                              <Pagination
                                  page={currentCountryPage}
                                  total={filteredCountries.length}
                                  size={countryPageSize}
                                  onChange={setCountryPage}
                                  language={language}
                              />
                            </div>
                        )}
                      </aside>
                    </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}