import type {HomeLanguage} from "@/features/home/copy";
import {getCountryName} from "./countries";
import {type Nominee, NOMINEE_PORTRAIT_ATLAS} from "./nominees";

export type ServerCandidate = {
  id: number | string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  portraitUrl?: string | null;
  activity?: Record<string, string> | null;
  reason?: string | null;
  nominatorName?: string | null;
  showNominator?: boolean;
  contributions?: Array<{
    what?: string | null;
    when?: string | null;
    forWhom?: string | null;
  }>;
  links?: Array<{ label?: string | null; url?: string | null }>;
  votes?: number | null;
};

export function normalizeServerCandidates(
    payload: readonly ServerCandidate[] | null | undefined,
): Nominee[] {
  if (!payload) return [];

  return payload.map((candidate) => {
    const id = String(candidate.id);
    const votes = Number.isFinite(Number(candidate.votes)) ? Number(candidate.votes) : 0;
    const fallbackReason = candidate.reason ?? "";
    const activity = {
      en: candidate.activity?.en ?? candidate.activity?.["en-US"] ?? "",
      es: candidate.activity?.es ?? candidate.activity?.["es-ES"] ?? candidate.activity?.en ?? "",
    };

    return {
      id,
      firstName: candidate.firstName ?? "",
      lastName: candidate.lastName ?? "",
      country: candidate.country ?? "",
      city: candidate.city ?? "",
      portraitUrl: candidate.portraitUrl || NOMINEE_PORTRAIT_ATLAS,
      activity,
      reason: {en: fallbackReason, es: fallbackReason},
      qualities: {en: fallbackReason, es: fallbackReason},
      contribution: {
        en: candidate.contributions?.[0]?.what ?? fallbackReason,
        es: candidate.contributions?.[0]?.what ?? fallbackReason,
      },
      supporters: Array.from({length: Math.max(0, votes)}, (_, index) => ({
        id: `${id}-supporter-${index}`,
        name: `${candidate.firstName ?? "Candidate"} supporter ${index + 1}`,
        country: candidate.country ?? "",
      })),
      contributions: (candidate.contributions ?? []).map((item, index) => ({
        id: `${id}-contribution-${index}`,
        date: item.when ?? "",
        description: {
          en: item.what ?? "",
          es: item.what ?? "",
        },
        beneficiaries: {
          en: item.forWhom ?? "",
          es: item.forWhom ?? "",
        },
      })),
      links: (candidate.links ?? []).map((item, index) => ({
        label: {
          en: item.label ?? `Link ${index + 1}`,
          es: item.label ?? `Link ${index + 1}`,
        },
        url: item.url ?? "#",
      })),
      nominator:
          candidate.showNominator === true
              ? {
                name: candidate.nominatorName ?? "",
                consentToDisplay: true,
              }
              : undefined,
    } as Nominee;
  });
}

// One shared deadline: never a rolling 90 days from an individual visit.
export const DEMO_ROUND = {
  startsAt: "2026-09-22T19:30:00Z",
  endsAt: "2026-12-21T19:30:00Z",
} as const;
export type CandidateSort = "votes" | "name";

export function fullName(person: Pick<Nominee, "firstName" | "lastName">) {
  return person.firstName + " " + person.lastName;
}
export function normalizeSearch(value: string, language: HomeLanguage = "en") {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase(language)
    .trim();
}
export function voteCount(person: Nominee, votedId: string | null) {
  return person.supporters.length + Number(votedId === person.id);
}
export function getRanking(
  people: readonly Nominee[],
  votedId: string | null,
  language: HomeLanguage = "en",
) {
  return [...people].sort(
    (a, b) =>
      voteCount(b, votedId) - voteCount(a, votedId) ||
      fullName(a).localeCompare(fullName(b), language),
  );
}
export function filterNominees(
  people: readonly Nominee[],
  query: string,
  country: string | null,
  sort: CandidateSort,
  language: HomeLanguage,
  votedId: string | null,
) {
  const normalized = normalizeSearch(query, language);
  const filtered = people.filter(
    (person) =>
      (!country || person.country === country) &&
      normalizeSearch(
        fullName(person) + " " + getCountryName(person.country, language),
        language,
      ).includes(normalized),
  );
  return sort === "votes"
    ? getRanking(filtered, votedId, language)
    : [...filtered].sort((a, b) =>
        fullName(a).localeCompare(fullName(b), language, {
          sensitivity: "base",
        }),
      );
}
export function remainingTime(
  now: number,
  end = Date.parse(DEMO_ROUND.endsAt),
) {
  const seconds = Math.max(0, Math.ceil((end - now) / 1000));
  return [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ] as const;
}
