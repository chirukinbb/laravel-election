import {locales} from "@/i18n/locales";
import {describe, expect, it} from "vitest";
import {countries, getCountryName} from "./countries";
import {nominees} from "./nominees";
import {
  DEMO_ROUND,
  filterNominees,
  fullName,
  getRanking,
  normalizeSearch,
  normalizeServerCandidates,
  remainingTime,
  voteCount,
} from "./voting-model";

describe("Voting demonstration directory", () => {
  it("contains 20 distinct nominees and complete translated profiles from all six regions", () => {
    expect(nominees).toHaveLength(20);
    expect(new Set(nominees.map((person) => person.id)).size).toBe(20);
    expect(new Set(nominees.map((person) => person.portraitIndex))).toEqual(
      new Set(Array.from({ length: 20 }, (_, index) => index)),
    );
    const countryDirectory = new Map(
      countries.map((country) => [country.code, country]),
    );
    expect(countryDirectory.size).toBe(195);
    const regions = new Set<string>();
    for (const nominee of nominees) {
      const country = countryDirectory.get(nominee.country);
      expect(country, nominee.id).toBeDefined();
      if (country) regions.add(country.continent);
      expect(nominee.firstName.trim()).not.toBe("");
      expect(nominee.lastName.trim()).not.toBe("");
      for (const field of [
        "activity",
        "reason",
        "qualities",
        "contribution",
      ] as const) {
        for (const language of locales.map(({ code }) => code)) {
          expect(
            nominee[field][language].trim(),
            `${nominee.id}: ${field}/${language}`,
          ).not.toBe("");
        }
      }
    }
    expect(regions).toEqual(
      new Set([
        "africa",
        "asia",
        "europe",
        "north-america",
        "south-america",
        "oceania",
      ]),
    );
  });

  it("derives every total from valid, globally distinct demonstration supporters", () => {
    const countryCodes = new Set(countries.map((country) => country.code));
    const allSupporters = nominees.flatMap((nominee) => nominee.supporters);
    expect(new Set(allSupporters.map((person) => person.id)).size).toBe(
      allSupporters.length,
    );
    expect(new Set(allSupporters.map((person) => person.name)).size).toBe(
      allSupporters.length,
    );
    for (const nominee of nominees) {
      expect(nominee.supporters.length).toBeGreaterThanOrEqual(8);
      expect(nominee.supporters.length).toBeLessThanOrEqual(50);
      expect(voteCount(nominee, null)).toBe(nominee.supporters.length);
      for (const supporter of nominee.supporters) {
        expect(countryCodes.has(supporter.country), supporter.id).toBe(true);
        expect(supporter.name).not.toContain("undefined");
      }
    }
    const ana = nominees.find((person) => person.id === "demo-ana-vera");
    expect(ana).toBeDefined();
    if (!ana) throw new Error("Missing Ana fixture");
    expect(voteCount(ana, ana.id)).toBe(49);
    expect(voteCount(ana, "demo-kenji-morihara")).toBe(48);
    expect(ana.supporters).toHaveLength(48);
  });

  it("normalizes server paginated candidates into the UI nominee shape", () => {
    const payload = [
      {
        id: 1,
        firstName: "Alma",
        lastName: "Aranda",
        country: "AR",
        city: "Buenos Aires",
        portraitUrl: "https://example.com/alma.png",
        activity: {en: "Community organizer", es: "Organizadora comunitaria"},
        reason: "She combines local action with a strong focus on education and public trust.",
        nominatorName: "Community Committee",
        showNominator: true,
        contributions: [
          {what: "Technology access programs", when: "2024-01-15", forWhom: "Local families"},
        ],
        links: [{label: "Profile", url: "https://example.com/alma"}],
        votes: 3,
      },
    ];

    const normalized = normalizeServerCandidates(payload);

    expect(normalized).toHaveLength(1);
    expect(normalized[0]?.id).toBe("1");
    expect(normalized[0]?.firstName).toBe("Alma");
    expect(normalized[0]?.supporters).toHaveLength(3);
    expect(normalized[0]?.nominator).toEqual({
      name: "Community Committee",
      consentToDisplay: true,
    });
    expect(normalized[0]?.contributions).toHaveLength(1);
    expect(normalized[0]?.links?.[0]?.url).toBe("https://example.com/alma");
  });
});

describe("Voting search, filters and ranking", () => {
  it("matches accents and casing without changing displayed names", () => {
    expect(normalizeSearch("  LUCÍA SERRANO ")).toBe("lucia serrano");
    const result = filterNominees(nominees, "LUCIA", null, "name", "en", null);
    expect(result.map(fullName)).toEqual(["Lucía Serrano"]);
  });

  it.each([
    ["en", "japan"],
    ["ar", "اليابان"],
    ["es", "japon"],
  ] as const)("searches the translated country in %s", (language, query) => {
    expect(
      filterNominees(nominees, query, null, "votes", language, null).map(
        fullName,
      ),
    ).toEqual(["Kenji Morihara"]);
    expect(getCountryName("JP", language)).not.toBe("JP");
  });

  it("combines country and search filters, including empty countries", () => {
    expect(
      filterNominees(nominees, "", "PY", "name", "en", null).map(fullName),
    ).toEqual(["Ana Vera", "Elena Arvelo"]);
    expect(
      filterNominees(nominees, "elena", "PY", "votes", "en", null).map(
        fullName,
      ),
    ).toEqual(["Elena Arvelo"]);
    expect(
      filterNominees(nominees, "elena", "JP", "votes", "en", null),
    ).toEqual([]);
    expect(filterNominees(nominees, "", "VA", "votes", "en", null)).toEqual([]);
    expect(
      filterNominees(nominees, "nonexistent nominee", null, "name", "en", null),
    ).toEqual([]);
  });

  it("retains the global places when a country subset is alphabetised", () => {
    const originalOrder = nominees.map((nominee) => nominee.id);
    const ranking = getRanking(nominees, null);
    const filtered = filterNominees(nominees, "", "PY", "name", "en", null);
    const places = filtered.map(
      (person) =>
        ranking.findIndex((candidate) => candidate.id === person.id) + 1,
    );
    expect(places).toEqual([1, 20]);
    expect(nominees.map((nominee) => nominee.id)).toEqual(originalOrder);
    expect(getRanking(nominees, null).map((person) => person.id)).toEqual(
      ranking.map((person) => person.id),
    );
  });

  it.each(locales.map(({ code }) => code))(
    "sorts names alphabetically for %s without changing the input",
    (language) => {
      const selected = filterNominees(
        nominees,
        "",
        null,
        "name",
        language,
        null,
      );
      const names = selected.map(fullName);
      expect(names).toEqual(
        [...names].sort((a, b) =>
          a.localeCompare(b, language, { sensitivity: "base" }),
        ),
      );
      expect(selected).toHaveLength(20);
      expect(nominees[0]?.id).toBe("demo-ana-vera");
    },
  );
});

describe("Voting deadline", () => {
  const start = Date.parse(DEMO_ROUND.startsAt);
  const end = Date.parse(DEMO_ROUND.endsAt);

  it("uses one fixed absolute deadline exactly 90 days after the start", () => {
    expect(end - start).toBe(90 * 24 * 60 * 60 * 1000);
    expect(remainingTime(start)).toEqual([90, 0, 0, 0]);
    expect(remainingTime(start + 24 * 60 * 60 * 1000)).toEqual([89, 0, 0, 0]);
    expect(
      remainingTime(end - (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000),
    ).toEqual([2, 3, 4, 5]);
  });

  it("does not finish early and stays at zero after the deadline", () => {
    expect(remainingTime(end - 100)).toEqual([0, 0, 0, 1]);
    expect(remainingTime(end)).toEqual([0, 0, 0, 0]);
    expect(remainingTime(end + 24 * 60 * 60 * 1000)).toEqual([0, 0, 0, 0]);
  });
});
