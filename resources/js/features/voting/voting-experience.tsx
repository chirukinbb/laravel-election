"use client";

import dynamic from "next/dynamic";
import {type CSSProperties, type FormEvent, useCallback, useEffect, useMemo, useRef, useState,} from "react";
import {GlobalHeader} from "@/components/navigation/global-header";
import {didot, montserrat} from "@/features/home/fonts";
import {useHomeLanguage} from "@/features/home/use-home-language";
import type {HomeLanguage} from "@/features/home/copy";
import {type Continent, countries, getCountryName} from "./countries";
import {type Nominee, nominees} from "./nominees";
import {votingCopy} from "./copy";
import {Countdown} from "./countdown";
import {Portrait} from "./portrait";
import {VotingStory} from "./voting-story";
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
import "./voting.css";

const VotingMap = dynamic(
  () => import("./voting-map").then((module) => module.VotingMap),
  {
    loading: () => (
      <div className="voting-map-loading" aria-busy="true">
        <span />
      </div>
    ),
    ssr: false,
  },
);
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
const emptyNomination = {
  firstName: "",
  lastName: "",
  country: "",
  activity: "",
  reason: "",
};
const counts = nominees.reduce<Record<string, number>>((result, person) => {
  result[person.country] = (result[person.country] ?? 0) + 1;
  return result;
}, {});

function Arrow({ down = false }: { readonly down?: boolean }) {
  return (
    <svg
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
        {total ? (page - 1) * size + 1 : 0}–{Math.min(page * size, total)}{" "}
        {copy.of} {total}
      </span>
      <div>
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          aria-label={copy.previous}
        >
          ‹
        </button>
        {visiblePages.map((value, index) => (
          <span key={value} className="voting-pagination__page">
            {index > 0 && value > (visiblePages[index - 1] ?? 0) + 1 ? (
              <span aria-hidden="true">…</span>
            ) : null}
            <button
              type="button"
              aria-label={copy.page + " " + value}
              aria-current={page === value ? "page" : undefined}
              onClick={() => onChange(value)}
            >
              {value}
            </button>
          </span>
        ))}
        <button
          type="button"
          disabled={page === pages}
          onClick={() => onChange(page + 1)}
          aria-label={copy.next}
        >
          ›
        </button>
      </div>
    </nav>
  );
}

export function VotingExperience() {
  const [language] = useHomeLanguage();
  const copy = votingCopy[language];
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
  const [supporterPage, setSupporterPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [profile, setProfile] = useState<Nominee | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [voteOrigin, setVoteOrigin] = useState<"profile" | null>(null);
  const [nomination, setNomination] = useState(emptyNomination);
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
  const previousScroll = useRef(0);
  const closeRound = useCallback(() => setClosed(true), []);
  const chosen = nominees.find((person) => person.id === selected) ?? null;
  const ranked = useMemo(() => getRanking(nominees, voted), [voted]);
  const filtered = useMemo(
    () => filterNominees(nominees, query, country, sort, language, voted),
    [query, country, sort, language, voted],
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
  );
  const orderedCountries = useMemo(
    () =>
      [...countries].sort((a, b) =>
        getCountryName(a.code, language).localeCompare(
          getCountryName(b.code, language),
          language,
        ),
      ),
    [language],
  );
  const filteredCountries = useMemo(
    () =>
      orderedCountries
        .filter(
          (item) =>
            (!continent || item.continent === continent) &&
            normalizeSearch(getCountryName(item.code, language)).includes(
              normalizeSearch(countryQuery),
            ),
        )
        .sort((a, b) =>
          countrySort === "count"
            ? (counts[b.code] ?? 0) - (counts[a.code] ?? 0) ||
              getCountryName(a.code, language).localeCompare(
                getCountryName(b.code, language),
                language,
              )
            : 0,
        ),
    [orderedCountries, continent, countryQuery, countrySort, language],
  );
  const currentCountryPage = Math.min(
    countryPage,
    Math.max(1, Math.ceil(filteredCountries.length / countryPageSize)),
  );
  const countryTotal = filteredCountries.reduce(
    (sum, item) => sum + (counts[item.code] ?? 0),
    0,
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
          Math.floor(((previousPage - 1) * previousSize) / nextSize) + 1,
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
      previousScroll.current = window.scrollY;
    }
    setPanel(next);
  };
  const closePanel = useCallback(() => {
    setPanel(null);
    requestAnimationFrame(() => {
      origin.current?.focus({ preventScroll: true });
      window.scrollTo({ top: previousScroll.current, behavior: "instant" });
    });
  }, []);
  useEffect(() => {
    if (!panel) return;
    panelHeading.current?.focus({ preventScroll: true });
    workspace.current?.scrollIntoView({
      block: "start",
      behavior: reduced ? "instant" : "smooth",
    });
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [panel, closePanel, reduced]);
  const openProfile = (person: Nominee) => {
    setProfile(person);
    setSupporterPage(1);
    openPanel("profile");
  };
  const selectCountry = (code: string | null) => {
    const focusedSidebar = document.activeElement?.closest(
      ".voting-map-sidebar",
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
          code ? ".voting-country-heading h3" : 'input[type="search"]',
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
  const toStory = () => {
    const story = document.getElementById("voting-story");
    story?.focus({ preventScroll: true });
    story?.scrollIntoView({
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
      setPanel("success");
    }
  };
  const submitNomination = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = {
      firstName: nomination.firstName.trim(),
      lastName: nomination.lastName.trim(),
      country: nomination.country,
      activity: nomination.activity.trim(),
      reason: nomination.reason.trim(),
    };
    for (const [key, value] of Object.entries(trimmed)) {
      const field = event.currentTarget.elements.namedItem(key);
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
      ) {
        field.setCustomValidity(
          !value
            ? copy.emptyField
            : key === "reason" && value.length < 40
              ? copy.minimumReason
              : "",
        );
      }
    }
    if (!event.currentTarget.reportValidity()) return;
    setNomination(trimmed);
    setPanel("review");
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
                    {String(
                      ranked.findIndex((item) => item.id === person.id) + 1,
                    ).padStart(2, "0")}
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
                    {voteCount(person, voted)}
                  </td>
                  <td>
                    <input
                      type="radio"
                      name="voting-nominee"
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
    >
      <GlobalHeader />
      <section
        ref={hero}
        className="voting-hero"
        aria-labelledby="voting-title"
      >
        {/* Reserved for the owner's future background video. */}
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
        <div className="voting-tabs" hidden={panel !== null}>
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
                if (event.key === "ArrowRight") {
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
                if (event.key === "ArrowLeft") {
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
            <span aria-hidden="true">↗</span>
          </button>
        </div>
        <div className="voting-stage" data-panel={panel ?? view}>
          <div hidden={panel !== null}>
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
                    <VotingMap
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
                  </div>
                  <aside
                    className="voting-map-sidebar"
                    aria-label={country ? copy.nominees : copy.countries}
                  >
                    {country ? (
                      <div className="voting-country-nominees" key={country}>
                        <header className="voting-country-heading">
                          <button
                            className="voting-text-link"
                            type="button"
                            onClick={() => selectCountry(null)}
                          >
                            ← {copy.allCountries}
                          </button>
                          <h3 tabIndex={-1}>
                            {getCountryName(country, language)}
                          </h3>
                          <p className="voting-kicker">
                            {counts[country] ?? 0} {copy.nominees}
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
                            {filteredCountries.length} {copy.countries} ·{" "}
                            {countryTotal} {copy.nominees}
                          </span>
                          <select
                            value={countrySort}
                            aria-label={copy.sort}
                            onChange={(event) => {
                              setCountrySort(
                                event.target.value as "name" | "count",
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
                                currentCountryPage * countryPageSize,
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
                                    <span>{counts[item.code] ?? 0}</span>
                                    <span aria-hidden="true">›</span>
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

          {panel && (
            <section
              className={"voting-panel voting-panel--" + panel}
              aria-labelledby="voting-panel-title"
            >
              <button
                type="button"
                className="voting-close"
                aria-label={copy.close}
                onClick={closePanel}
              >
                <span aria-hidden="true">×</span>
              </button>
              <div className="voting-panel__intro">
                <p className="voting-kicker">
                  {panel === "profile" ? copy.profile : copy.round}
                </p>
                <h3 id="voting-panel-title" ref={panelHeading} tabIndex={-1}>
                  {title}
                </h3>
              </div>
              {panel === "profile" && profile ? (
                <div className="voting-profile">
                  <div className="voting-profile__identity">
                    <Portrait person={profile} large />
                    <p className="voting-kicker">
                      {getCountryName(profile.country, language)}
                    </p>
                    <p className="voting-profile__activity">
                      {profile.activity[language]}
                    </p>
                    <button
                      className="voting-solid"
                      type="button"
                      disabled={closed || voted !== null}
                      onClick={() => beginVote(profile)}
                    >
                      {voted === profile.id
                        ? copy.voted
                        : copy.voteFor + " " + profile.firstName}
                      <Arrow />
                    </button>
                  </div>
                  <div className="voting-profile__story">
                    {(
                      [
                        ["reason", copy.reason],
                        ["qualities", copy.qualities],
                        ["contribution", copy.contribution],
                      ] as const
                    ).map(([key, label]) => (
                      <section key={key}>
                        <h4>{label}</h4>
                        <p>{profile[key][language]}</p>
                      </section>
                    ))}
                    <section className="voting-supporters">
                      <div className="voting-supporters__title">
                        <h4>{copy.supporters}</h4>
                        <span>{voteCount(profile, voted)}</span>
                      </div>
                      <table>
                        <thead>
                          <tr>
                            <th>{copy.supporter}</th>
                            <th>{copy.country}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ...profile.supporters,
                            ...(voted === profile.id
                              ? [
                                  {
                                    id: "demo-self",
                                    name: copy.demoVoter,
                                    country: "",
                                  },
                                ]
                              : []),
                          ]
                            .slice((supporterPage - 1) * 10, supporterPage * 10)
                            .map((person) => (
                              <tr key={person.id}>
                                <td>{person.name}</td>
                                <td>
                                  {person.country
                                    ? getCountryName(person.country, language)
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      <Pagination
                        page={supporterPage}
                        total={voteCount(profile, voted)}
                        size={10}
                        onChange={setSupporterPage}
                        language={language}
                      />
                    </section>
                  </div>
                </div>
              ) : null}
              {(panel === "confirm" || panel === "success") && panelPerson ? (
                <div className="voting-decision">
                  <Portrait person={panelPerson} large />
                  <h4>{fullName(panelPerson)}</h4>
                  <p className="voting-kicker">
                    {getCountryName(panelPerson.country, language)}
                  </p>
                  <p>
                    {panel === "confirm" ? copy.confirmText : copy.successText}
                  </p>
                  {panel === "confirm" ? (
                    <div className="voting-actions">
                      <button
                        className="voting-outline"
                        type="button"
                        onClick={() =>
                          voteOrigin ? setPanel(voteOrigin) : closePanel()
                        }
                      >
                        {copy.cancel}
                      </button>
                      <button
                        className="voting-solid"
                        type="button"
                        onClick={confirmVote}
                        disabled={closed || voted !== null}
                      >
                        {copy.confirm}
                        <Arrow />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="voting-outline"
                      type="button"
                      onClick={closePanel}
                    >
                      {copy.backToNominees}
                      <Arrow />
                    </button>
                  )}
                </div>
              ) : null}
              {panel === "nominate" ? (
                <form
                  className="voting-nomination"
                  onSubmit={submitNomination}
                  onInput={(event) => {
                    const field = event.target;
                    if (
                      field instanceof HTMLInputElement ||
                      field instanceof HTMLTextAreaElement ||
                      field instanceof HTMLSelectElement
                    )
                      field.setCustomValidity("");
                  }}
                >
                  <p>{copy.nominateIntro}</p>
                  <div className="voting-form-grid">
                    <label>
                      {copy.firstName}
                      <input
                        name="firstName"
                        required
                        maxLength={60}
                        autoComplete="off"
                        value={nomination.firstName}
                        onChange={(event) =>
                          setNomination({
                            ...nomination,
                            firstName: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      {copy.lastName}
                      <input
                        name="lastName"
                        required
                        maxLength={60}
                        autoComplete="off"
                        value={nomination.lastName}
                        onChange={(event) =>
                          setNomination({
                            ...nomination,
                            lastName: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      {copy.country}
                      <select
                        name="country"
                        required
                        value={nomination.country}
                        onChange={(event) =>
                          setNomination({
                            ...nomination,
                            country: event.target.value,
                          })
                        }
                      >
                        <option value="">{copy.requiredCountry}</option>
                        {orderedCountries.map((item) => (
                          <option key={item.code} value={item.code}>
                            {getCountryName(item.code, language)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {copy.occupation}
                      <input
                        name="activity"
                        required
                        maxLength={100}
                        value={nomination.activity}
                        onChange={(event) =>
                          setNomination({
                            ...nomination,
                            activity: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="voting-form-wide">
                      {copy.nominationReason}
                      <textarea
                        name="reason"
                        required
                        minLength={40}
                        maxLength={1200}
                        rows={5}
                        value={nomination.reason}
                        onChange={(event) =>
                          setNomination({
                            ...nomination,
                            reason: event.target.value,
                          })
                        }
                      />
                      <small>
                        {copy.minimumReason} · {nomination.reason.length}/1200
                      </small>
                    </label>
                  </div>
                  <button className="voting-solid" type="submit">
                    {copy.review}
                    <Arrow />
                  </button>
                </form>
              ) : null}
              {panel === "review" ? (
                <div className="voting-nomination voting-nomination--review">
                  <h4>{nomination.firstName + " " + nomination.lastName}</h4>
                  <p className="voting-kicker">
                    {getCountryName(nomination.country, language)} ·{" "}
                    {nomination.activity}
                  </p>
                  <p className="voting-review-reason">{nomination.reason}</p>
                  <div className="voting-actions">
                    <button
                      className="voting-outline"
                      type="button"
                      onClick={() => setPanel("nominate")}
                    >
                      {copy.edit}
                    </button>
                    <button
                      className="voting-solid"
                      type="button"
                      onClick={() => setPanel("nomination-success")}
                    >
                      {copy.submit}
                      <Arrow />
                    </button>
                  </div>
                </div>
              ) : null}
              {panel === "nomination-success" ? (
                <div className="voting-decision">
                  <div className="voting-success-symbol" aria-hidden="true">
                    ✓
                  </div>
                  <p>{copy.nominationSuccessText}</p>
                  <button
                    className="voting-outline"
                    type="button"
                    onClick={() => {
                      setNomination(emptyNomination);
                      closePanel();
                    }}
                  >
                    {copy.backToNominees}
                    <Arrow />
                  </button>
                </div>
              ) : null}
              <p className="voting-panel__demo">{copy.demoDetail}</p>
            </section>
          )}
        </div>
        <div className="voting-dock" hidden={panel !== null}>
          <div className="voting-dock__links">
            <button
              type="button"
              data-active={view === "list"}
              onClick={() => setView("list")}
            >
              {copy.list}
            </button>
            <button
              type="button"
              data-active={view === "map"}
              onClick={() => setView("map")}
            >
              {copy.map}
            </button>
            <button type="button" onClick={toStory}>
              {copy.about}
            </button>
          </div>
          <div className="voting-dock__selection">
            {chosen ? (
              <>
                <Portrait person={chosen} />
                <span>
                  <small>{copy.selected}</small>
                  <strong>{fullName(chosen)}</strong>
                </span>
              </>
            ) : (
              <span className="voting-dock__prompt">{copy.choose}</span>
            )}
          </div>
          <button
            className="voting-dock__vote"
            type="button"
            disabled={!chosen || closed || voted !== null}
            onClick={() => chosen && beginVote(chosen)}
          >
            {voted ? copy.voted : copy.vote}
            <Arrow />
          </button>
        </div>
        {voted && !panel && (
          <p className="voting-session-note" role="status">
            {copy.alreadyVoted}
          </p>
        )}
        <p className="voting-demo-label">{copy.demo}</p>
      </section>
      <VotingStory language={language} onViewNominees={toNominees} />
      <footer className="voting-footer">
        <span>TREE OF UNITY</span>
        <span>{copy.eyebrow}</span>
        <button
          type="button"
          className="voting-text-link"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: reduced ? "instant" : "smooth",
            })
          }
        >
          ↑ <span className="voting-sr-only">{copy.back}</span>
        </button>
      </footer>
    </div>
  );
}
