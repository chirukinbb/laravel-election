import {countries} from "./countries";

export const MIN_NOMINATION_REASON = 300;
export const MAX_NOMINATION_REASON = 1200;
export const MAX_CONTRIBUTIONS = 6;
export const MAX_NOMINEE_LINKS = 6;

export interface NominationDraft {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  activity: string;
  reason: string;
  nominatorName: string;
  showNominator: boolean;
  contributions: { what: string; when: string; forWhom: string }[];
  links: { label: string; url: string }[];
}

export type NominationError =
  | "required"
  | "reasonLength"
  | "tooLong"
  | "invalidCountry"
  | "invalidDate"
  | "invalidUrl"
  | "maxContributions"
  | "maxLinks";

export function emptyNominationDraft(): NominationDraft {
  return {
    firstName: "",
    lastName: "",
    country: "",
    city: "",
    activity: "",
    reason: "",
    nominatorName: "",
    showNominator: false,
    contributions: [],
    links: [],
  };
}

/** Unicode code points, so a non-BMP character is not counted twice. */
export function characterCount(text: string): number {
  return Array.from(text).length;
}

/** User-authored links must never become executable or credential-bearing URLs. */
export function safePublicUrl(value: string): string | null {
  const trimmed = value.trim();
  if (
    !/^https?:\/\//i.test(trimmed) ||
    /[\s\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069\\]/u.test(
      trimmed,
    )
  )
    return null;
  try {
    const url = new URL(trimmed);
    if (
      !url.hostname ||
      url.username ||
      url.password ||
      !["https:", "http:"].includes(url.protocol)
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

const countryCodes = new Set(countries.map(({ code }) => code));
export function validateNominationDraft(
  draft: NominationDraft,
):
  | { success: true; data: NominationDraft }
  | { success: false; errors: Record<string, NominationError> } {
  const errors: Record<string, NominationError> = {};
  const trimmed = (value: string) => value.trim().normalize("NFC");
  const data: NominationDraft = {
    firstName: trimmed(draft.firstName),
    lastName: trimmed(draft.lastName),
    country: draft.country.trim().toUpperCase(),
    city: trimmed(draft.city),
    activity: trimmed(draft.activity),
    reason: trimmed(draft.reason),
    showNominator: draft.showNominator === true,
    // Never carry an unconsented identity into the review/public profile model.
    nominatorName:
      draft.showNominator === true ? trimmed(draft.nominatorName) : "",
    contributions: draft.contributions.map(({ what, when, forWhom }) => ({
      what: trimmed(what),
      when: when.trim(),
      forWhom: trimmed(forWhom),
    })),
    links: draft.links.map(({ label, url }) => ({
      label: trimmed(label),
      url: url.trim(),
    })),
  };
  const check = (key: string, value: string, maximum: number) => {
    if (!value) errors[key] = "required";
    else if (characterCount(value) > maximum) errors[key] = "tooLong";
  };
  check("firstName", data.firstName, 80);
  check("lastName", data.lastName, 80);
  check("city", data.city, 100);
  check("activity", data.activity, 120);
  if (!countryCodes.has(data.country)) errors.country = "invalidCountry";
  const reasonLength = characterCount(data.reason);
  if (
    reasonLength < MIN_NOMINATION_REASON ||
    reasonLength > MAX_NOMINATION_REASON
  )
    errors.reason = "reasonLength";
  if (data.showNominator) check("nominatorName", data.nominatorName, 120);
  if (data.contributions.length > MAX_CONTRIBUTIONS)
    errors.contributions = "maxContributions";
  data.contributions.forEach((entry, index) => {
    check(`contributions.${index}.what`, entry.what, 500);
    check(`contributions.${index}.forWhom`, entry.forWhom, 200);
    if (!validDate(entry.when))
      errors[`contributions.${index}.when`] = "invalidDate";
  });
  if (data.links.length > MAX_NOMINEE_LINKS) errors.links = "maxLinks";
  data.links.forEach((entry, index) => {
    check(`links.${index}.label`, entry.label, 100);
    const safe = safePublicUrl(entry.url);
    if (!safe || characterCount(entry.url) > 2048)
      errors[`links.${index}.url`] = "invalidUrl";
    else entry.url = safe;
  });
  return Object.keys(errors).length
    ? { success: false, errors }
    : { success: true, data };
}
