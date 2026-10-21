import {localeDirection} from "@/i18n/locales";
import {interpolate} from "@/i18n/catalog";

import {type CSSProperties, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState,} from "react";
import {router} from "@inertiajs/react";
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
import {VotingStory} from "./voting-story";
import {useVotingMotion} from "./use-voting-motion";
import {
  type CandidateSort,
  DEMO_ROUND,
  fullName,
  normalizeSearch,
  normalizeServerCandidates,
  voteCount,
} from "./voting-model";
import {NomineeProfile} from "./nominee-profile";
import {NominationForm} from "./nomination-form";
import {emptyNominationDraft} from "./nomination-validation";
import {getProfileCopy} from "./profile-copy";
import {getEnhancementCopy} from "./enhancement-copy";
import "./voting.css";

const VotingMap = lazy(() =>
    import("./voting-map").then((module) => ({default: module.VotingMap})),
);

function MapFallback() {
  return (
      <div className="voting-map-loading" aria-busy="true">
        <span/>
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
type PaginatorLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};
type PaginatorMeta = {
  data?: unknown[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    links?: PaginatorLink[];
  };
};
const PAGE_SIZE = 10;
const TAB_QUERY = "tab";
const NOMINEE_QUERY = "nominee";

function updateVotingUrl({
                           tab,
                           nominee,
                           country,
                           sort,
                         }: {
  readonly tab?: View | null;
  readonly nominee?: string | null;
  readonly country?: string | null;
  readonly sort?: CandidateSort | null;
}) {
  const url = new URL(window.location.href);
  if (tab) url.searchParams.set(TAB_QUERY, tab);
  else url.searchParams.delete(TAB_QUERY);
  if (nominee) url.searchParams.set(NOMINEE_QUERY, nominee);
  else url.searchParams.delete(NOMINEE_QUERY);
  if (country) url.searchParams.set("country", country);
  else url.searchParams.delete("country");
  if (sort) url.searchParams.set("sort", sort);
  else url.searchParams.delete("sort");
  const next = `${url.pathname}${url.search ? `?${url.searchParams.toString()}` : ""}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);
}

function Arrow({down = false}: { readonly down?: boolean }) {
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
                      pageUrlMap,
                    }: {
  readonly page: number;
  readonly total: number;
  readonly size: number;
  readonly onChange: (page: number) => void;
  readonly language: HomeLanguage;
  readonly pageUrlMap?: ReadonlyMap<number, string>;
}) {
  const copy = votingCopy[language];
  const pages = Math.max(1, Math.ceil(total / size));
  const visiblePages = [...new Set([1, page - 1, page, page + 1, pages])]
      .filter((value) => value >= 1 && value <= pages)
      .sort((a, b) => a - b);
  const goTo = (target: number) => {
    const href = pageUrlMap?.get(target);
    if (href) {
      router.visit(href, {
        preserveScroll: true,
        preserveState: true,
      });
      return;
    }
    onChange(target);
  };
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
              onClick={() => goTo(page - 1)}
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
                    onClick={() => goTo(value)}
                >
              {votingNumber(value, language)}
            </button>
          </span>
          ))}
          <button
              type="button"
              disabled={page === pages}
              onClick={() => goTo(page + 1)}
              aria-label={copy.next}
          >
            {localeDirection(language) === "rtl" ? "‹" : "›"}
          </button>
        </div>
      </nav>
  );
}

export function VotingExperience({
                                   candidates,
                                 }: {
  readonly candidates?: PaginatorMeta;
}) {
  console.log(candidates)
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
  const normalizedServerCandidates = useMemo(() => {
    if (!Array.isArray(candidates?.data)) return [];
    return normalizeServerCandidates(candidates.data as Parameters<typeof normalizeServerCandidates>[0]);
  }, [candidates]);
  const sourceNominees = normalizedServerCandidates.length ? normalizedServerCandidates : nominees;
  const counts = useMemo(
      () =>
          sourceNominees.reduce<Record<string, number>>((result, person) => {
            result[person.country] = (result[person.country] ?? 0) + 1;
            return result;
          }, {}),
      [sourceNominees],
  );
  const chosen = sourceNominees.find((person) => person.id === selected) ?? null;
  const ranked = useMemo(
      () => [...sourceNominees],
      [sourceNominees],
  );
  const filtered = useMemo(() => sourceNominees, [sourceNominees]);
  const serverPagination = useMemo(() => {
    if (!candidates || !Array.isArray(candidates.data)) {
      return null;
    }
    const meta = candidates.meta ?? candidates;
    const total = typeof meta.total === "number" ? meta.total : filtered.length;
    const size = typeof meta.per_page === "number" ? meta.per_page : PAGE_SIZE;
    const pages = Math.max(
        1,
        typeof meta.last_page === "number" ? meta.last_page : Math.ceil(total / size),
    );
    const current = Math.min(
        Math.max(1, typeof meta.current_page === "number" ? meta.current_page : page),
        pages,
    );
    return {current, total, size, pages};
  }, [candidates, filtered.length, page]);
  const currentPage = Math.min(
      page,
      Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
  );
  const pagination = serverPagination ?? {
    current: currentPage,
    total: filtered.length,
    size: PAGE_SIZE,
    pages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
  };
  const pageUrlMap = useMemo(() => {
    const map = new Map<number, string>();
    const meta = candidates?.meta ?? candidates;
    const metaLinks = Array.isArray(meta?.links) ? meta.links : [];
    for (const link of metaLinks) {
      if (typeof link.url === "string" && typeof link.page === "number") {
        map.set(link.page, link.url);
      }
    }
    if (candidates?.links && typeof candidates.links === "object") {
      const directLinks = candidates.links as Record<string, string | null>;
      const firstPage = 1;
      if (typeof directLinks.first === "string") map.set(firstPage, directLinks.first);
      if (typeof meta.last_page === "number" && typeof directLinks.last === "string") {
        map.set(meta.last_page, directLinks.last);
      }
      if (typeof meta.current_page === "number" && typeof directLinks.prev === "string") {
        map.set(meta.current_page - 1, directLinks.prev);
      }
      if (typeof meta.current_page === "number" && typeof directLinks.next === "string") {
        map.set(meta.current_page + 1, directLinks.next);
      }
    }
    return map;
  }, [candidates]);

  useEffect(() => {
    const nextPage =
        (typeof candidates?.meta?.current_page === "number"
            ? candidates.meta.current_page
            : typeof candidates?.current_page === "number"
                ? candidates.current_page
                : null);
    if (nextPage !== null) {
      setPage(nextPage);
    }
  }, [candidates?.current_page, candidates?.meta?.current_page]);
  const visiblePeople = useMemo(() => {
    if (serverPagination) return filtered;
    return filtered.slice(
        (pagination.current - 1) * pagination.size,
        pagination.current * pagination.size,
    );
  }, [filtered, pagination, serverPagination]);
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
                      normalizeSearch(
                          getCountryName(item.code, language),
                          language,
                      ).includes(normalizeSearch(countryQuery, language)),
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
      updateVotingUrl({tab: view, nominee: null});
      requestAnimationFrame(() => {
        origin.current?.focus({preventScroll: true});
      });
    };
    if (panel !== null && !reduced) {
      setPanelClosing(true);
      closeTimer.current = setTimeout(finish, 450);
    } else finish();
  }, [panel, reduced, view]);
  useEffect(
      () => () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
      },
      [],
  );
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get(TAB_QUERY) as View | null;
    const validTab = tab === "list" || tab === "map" ? tab : null;
    if (validTab) setView(validTab);

    const countryParam = params.get("country");
    if (countryParam) setCountry(countryParam);

    const sortParam = params.get("sort");
    if (sortParam === "votes" || sortParam === "name") setSort(sortParam);

    const id = params.get(NOMINEE_QUERY);
    const person = sourceNominees.find((item) => item.id === id);
    if (!person) return;
    const frame = requestAnimationFrame(() => {
      origin.current = workspace.current;
      setProfile(person);
      setPanel("profile");
      updateVotingUrl({
        tab: validTab ?? view,
        nominee: person.id,
        country: countryParam,
        sort: sortParam as CandidateSort | null
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [view, sourceNominees]);
  useEffect(() => {
    const opening = panel !== null && previousPanel.current === null;
    previousPanel.current = panel;
    if (!panel) return;
    panelHeading.current?.focus({preventScroll: true});
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
    updateVotingUrl({tab: view, nominee: person.id, country, sort});
    openPanel("profile");
  };
  const updateFiltersViaInertia = useCallback(
      (nextCountry: string | null, nextSort: CandidateSort) => {
        const params = new URLSearchParams(window.location.search);
        if (nextCountry) params.set("country", nextCountry);
        else params.delete("country");
        params.set("sort", nextSort);
        const href = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
        router.visit(href, {
          preserveScroll: true,
          preserveState: false,
          replace: true,
          only: ["candidates"],
        });
      },
      [],
  );
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
    updateFiltersViaInertia(code, sort);
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
    updateFiltersViaInertia(null, sort);
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
              {visiblePeople.map((person) => (
                  <tr
                      key={person.id}
                      data-selected={selected === person.id}
                      data-nominee-id={person.id}
                  >
                    <td className="voting-rank">
                      {votingNumber(
                          ranked.findIndex((item) => item.id === person.id) + 1,
                          language,
                          2,
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
            page={pagination.current}
            total={pagination.total}
            size={pagination.size}
            onChange={setPage}
            language={language}
            pageUrlMap={pageUrlMap}
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
              inert={panel !== null}
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
                  onClick={() => {
                    setView("list");
                    updateVotingUrl({tab: "list", nominee: null});
                  }}
                  onKeyDown={(event) => {
                    if (
                        event.key ===
                        (localeDirection(language) === "rtl"
                            ? "ArrowLeft"
                            : "ArrowRight")
                    ) {
                      setView("map");
                      updateVotingUrl({tab: "map", nominee: null});
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
                  onClick={() => {
                    setView("map");
                    updateVotingUrl({tab: "map", nominee: null});
                  }}
                  onKeyDown={(event) => {
                    if (
                        event.key ===
                        (localeDirection(language) === "rtl"
                            ? "ArrowRight"
                            : "ArrowLeft")
                    ) {
                      setView("list");
                      updateVotingUrl({tab: "list", nominee: null});
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
                inert={panel !== null}
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
                        onChange={(event) => {
                          const nextCountry = event.target.value || null;
                          selectCountry(nextCountry);
                        }}
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
                          const nextSort = event.target.value as CandidateSort;
                          setSort(nextSort);
                          setPage(1);
                          updateFiltersViaInertia(country, nextSort);
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
                        <Suspense fallback={<MapFallback/>}>
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
                                      language,
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
                                      const nextSort = event.target.value as CandidateSort;
                                      setSort(nextSort);
                                      setPage(1);
                                      updateFiltersViaInertia(country, nextSort);
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
                                language,
                            )}{" "}
                            · {votingCount(countryTotal, "nominees", language)}
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
                                                <span>
                                      {votingNumber(
                                          counts[item.code] ?? 0,
                                          language,
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

            {profileMode && profile && (
                <NomineeProfile
                    key={profile.id}
                    person={profile}
                    language={language}
                    rank={ranked.findIndex((person) => person.id === profile.id) + 1}
                    votes={voteCount(profile, voted)}
                    voted={voted === profile.id}
                    disabled={closed || voted !== null}
                    closing={panelClosing}
                    confirming={panel === "confirm"}
                    reduced={reduced}
                    headingRef={panelHeading}
                    onClose={closePanel}
                    onVote={() => beginVote(profile)}
                    onConfirm={confirmVote}
                    onCancel={() => setPanel("profile")}
                />
            )}
            {panel && !profileMode && (
                <section
                    key={panel}
                    className={"voting-panel voting-panel--" + panel}
                    data-closing={panelClosing}
                    inert={panelClosing}
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
                    <p className="voting-kicker">{copy.round}</p>
                    <h3 id="voting-panel-title" ref={panelHeading} tabIndex={-1}>
                      {title}
                    </h3>
                  </div>
                  {(panel === "confirm" || panel === "success") && panelPerson ? (
                      <div className="voting-decision">
                        <Portrait person={panelPerson} large/>
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
                                <Arrow/>
                              </button>
                            </div>
                        ) : (
                            <button
                                className="voting-outline"
                                type="button"
                                onClick={closePanel}
                            >
                              {copy.backToNominees}
                              <Arrow/>
                            </button>
                        )}
                      </div>
                  ) : null}
                  {panel === "nominate" ? (
                      <NominationForm
                          language={language}
                          value={nomination}
                          onChange={setNomination}
                          onReview={(draft) => {
                            setNomination(draft);
                            setPanel("review");
                          }}
                      />
                  ) : null}
                  {panel === "review" ? (
                      <div className="voting-nomination voting-nomination--review">
                        <h4>{nomination.firstName + " " + nomination.lastName}</h4>
                        <p className="voting-kicker">
                          {getCountryName(nomination.country, language)} ·{" "}
                          {nomination.city} · {nomination.activity}
                        </p>
                        <p className="voting-review-reason">{nomination.reason}</p>
                        {nomination.showNominator && nomination.nominatorName && (
                            <p>
                              {interpolate(profileCopy.nominatedBy, {
                                name: nomination.nominatorName,
                              })}
                            </p>
                        )}
                        {nomination.contributions.length > 0 && (
                            <section className="nomination-review-extra">
                              <h4>{profileCopy.contributions}</h4>
                              <ol>
                                {nomination.contributions.map((fact, index) => (
                                    <li key={index}>
                                      <time dateTime={fact.when}>{fact.when}</time>
                                      <p>{fact.what}</p>
                                      <p>
                                        {profileCopy.factsBeneficiaries}: {fact.forWhom}
                                      </p>
                                    </li>
                                ))}
                              </ol>
                            </section>
                        )}
                        {nomination.links.length > 0 && (
                            <section className="nomination-review-extra">
                              <h4>{profileCopy.links}</h4>
                              <ul>
                                {nomination.links.map((link, index) => (
                                    <li key={index}>
                                      <a
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                      >
                                        {link.label}
                                      </a>
                                    </li>
                                ))}
                              </ul>
                            </section>
                        )}
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
                            <Arrow/>
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
                              setNomination(emptyNominationDraft());
                              closePanel();
                            }}
                        >
                          {copy.backToNominees}
                          <Arrow/>
                        </button>
                      </div>
                  ) : null}
                  <p className="voting-panel__demo">{copy.demoDetail}</p>
                </section>
            )}
          </div>
          {chosen && (
              <div
                  className="voting-dock voting-directory-ui"
                  data-dissolved={directoryDissolved}
                  inert={panel !== null}
                  aria-hidden={panel !== null || undefined}
              >
                <div className="voting-dock__selection">
                  <Portrait person={chosen}/>
                  <span>
                <small>{copy.selected}</small>
                <strong>{fullName(chosen)}</strong>
              </span>
                </div>
                <button
                    className="voting-dock__explore"
                    type="button"
                    onClick={() => openProfile(chosen)}
                >
                  {enhancementCopy.exploreNominee}
                  <Arrow/>
                </button>
                <button
                    className="voting-dock__vote"
                    type="button"
                    disabled={closed || voted !== null}
                    onClick={() => beginVote(chosen)}
                >
                  {voted ? copy.voted : copy.vote}
                  <Arrow/>
                </button>
              </div>
          )}
          {voted && !panel && (
              <p className="voting-session-note" role="status">
                {copy.alreadyVoted}
              </p>
          )}
          <p
              className="voting-demo-label voting-directory-ui"
              data-dissolved={directoryDissolved}
          >
            {copy.demo}
          </p>
        </section>
        <VotingStory language={language} onViewNominees={toNominees}/>
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