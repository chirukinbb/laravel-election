import type {HomeLanguage} from "@/features/home/copy";
import {getCountryName} from "./countries";
import type {Nominee} from "./nominees";

// One shared deadline: never a rolling 90 days from an individual visit.
export const DEMO_ROUND = {
  startsAt: "2026-09-22T19:30:00Z",
  endsAt: "2026-12-21T19:30:00Z",
} as const;
export type CandidateSort = "votes" | "name";
export function fullName(person: Pick<Nominee, "firstName" | "lastName">) {
  return person.firstName + " " + person.lastName;
}
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();
}
export function voteCount(person: Nominee, votedId: string | null) {
  return person.supporters.length + Number(votedId === person.id);
}
export function getRanking(people: readonly Nominee[], votedId: string | null) {
  return [...people].sort(
    (a, b) =>
      voteCount(b, votedId) - voteCount(a, votedId) ||
      fullName(a).localeCompare(fullName(b), "en"),
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
  const normalized = normalizeSearch(query);
  const filtered = people.filter(
    (person) =>
      (!country || person.country === country) &&
      normalizeSearch(
        fullName(person) + " " + getCountryName(person.country, language),
      ).includes(normalized),
  );
  return sort === "votes"
    ? getRanking(filtered, votedId)
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
