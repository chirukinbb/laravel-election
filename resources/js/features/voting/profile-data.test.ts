import {describe, expect, it} from "vitest";
import {locales} from "@/i18n/locales";
import {profileCopy} from "./profile-copy";
import {nominees} from "./nominees";
import {getRanking, voteCount} from "./voting-model";
import {getVisibleNominator, type NomineeProfileDetails,} from "./profile-data";
import {
    characterCount,
    emptyNominationDraft,
    type NominationDraft,
    safePublicUrl,
    validateNominationDraft,
} from "./nomination-validation";

const makeDraft = (): NominationDraft => ({
  ...emptyNominationDraft(),
  firstName: "  Ana ",
  lastName: "Vera",
  country: "py",
  city: " Asunción ",
  activity: "Community librarian",
  reason: "A".repeat(300),
});

describe("nominee profile details", () => {
  it("updates votes and rank from the same current vote state, including a changed tie", () => {
    const ana = nominees[0];
    const rafael = nominees[1];
    if (!ana || !rafael) throw new Error("Missing demonstration fixtures");
    const tiedRafael = { ...rafael, supporters: ana.supporters };
    const people = [ana, tiedRafael];
    expect(getRanking(people, null, "en").map(({ id }) => id)).toEqual([
      ana.id,
      rafael.id,
    ]);
    expect(voteCount(tiedRafael, rafael.id)).toBe(49);
    expect(getRanking(people, rafael.id, "en").map(({ id }) => id)).toEqual([
      rafael.id,
      ana.id,
    ]);
    expect(getRanking(people, ana.id, "en").map(({ id }) => id)).toEqual([
      ana.id,
      rafael.id,
    ]);
    expect(people[0]?.id).toBe(ana.id);
    expect(tiedRafael.supporters).toHaveLength(48);
  });
  it("has complete, appropriately sized reasons and valid dates in every locale", () => {
    for (const nominee of nominees) {
      expect(nominee.city.trim(), nominee.id).not.toBe("");
      for (const { code } of locales) {
        const length = characterCount(nominee.reason[code]);
        expect(length, `${nominee.id}/${code}`).toBeGreaterThanOrEqual(300);
        expect(length, `${nominee.id}/${code}`).toBeLessThanOrEqual(1200);
      }
      expect(nominee.contributions?.length ?? 0).toBeLessThanOrEqual(6);
      for (const entry of nominee.contributions ?? []) {
        expect(new Date(entry.date).toISOString().slice(0, 10)).toBe(
          entry.date,
        );
        for (const { code } of locales) {
          expect(entry.description[code].trim()).not.toBe("");
          expect(entry.beneficiaries[code].trim()).not.toBe("");
        }
      }
    }
    expect(nominees[0]?.contributions).toHaveLength(3);
    expect(nominees.some((nominee) => !nominee.contributions)).toBe(true);
    expect(nominees.some((nominee) => !nominee.links)).toBe(true);
  });

  it("does not expose a name without explicit consent", () => {
    expect(getVisibleNominator({})).toBeNull();
    expect(
      getVisibleNominator({
        nominator: { name: "Private Name", consentToDisplay: false },
      }),
    ).toBeNull();
    expect(
      getVisibleNominator({
        nominator: { name: "   ", consentToDisplay: true },
      }),
    ).toBeNull();
    expect(
      getVisibleNominator({
        nominator: { name: "  Public Name ", consentToDisplay: true },
      }),
    ).toBe("Public Name");
    expect(nominees.some((nominee) => getVisibleNominator(nominee))).toBe(true);
    expect(nominees.some((nominee) => !getVisibleNominator(nominee))).toBe(
      true,
    );
  });

  it("supports optional public links independently of contributions and attribution", () => {
    const fixture: NomineeProfileDetails = {
      city: "Asunción",
      links: [
        {
          label: Object.fromEntries(
            locales.map(({ code }) => [code, profileCopy[code].links]),
          ) as Record<(typeof locales)[number]["code"], string>,
          url: "https://example.org/public-profile",
        },
      ],
    };
    expect(fixture.contributions).toBeUndefined();
    expect(getVisibleNominator(fixture)).toBeNull();
    expect(fixture.links?.map(({ url }) => safePublicUrl(url))).toEqual([
      "https://example.org/public-profile",
    ]);
  });

  it("has all profile and form messages in all eleven locales with matching placeholders", () => {
    const tokens = (value: string) =>
      [...value.matchAll(/\{([a-z]+)\}/gi)].map((match) => match[1]).sort();
    expect(Object.keys(profileCopy).sort()).toEqual(
      locales.map(({ code }) => code).sort(),
    );
    for (const { code } of locales) {
      expect(Object.keys(profileCopy[code]).sort()).toEqual(
        Object.keys(profileCopy.en).sort(),
      );
      for (const [key, value] of Object.entries(profileCopy[code])) {
        if (typeof value === "string") {
          expect(value.trim(), `${code}/${key}`).not.toBe("");
          expect(tokens(value), `${code}/${key}`).toEqual(
            tokens(
              profileCopy.en[
                key as Exclude<keyof typeof profileCopy.en, "errors">
              ],
            ),
          );
        }
      }
      expect(Object.keys(profileCopy[code].errors).sort()).toEqual(
        Object.keys(profileCopy.en.errors).sort(),
      );
    }
  });
});

describe("nomination draft validation", () => {
  it("normalizes a valid draft and defaults to no public attribution", () => {
    const draft = makeDraft();
    draft.nominatorName = "Name must stay private";
    const result = validateNominationDraft(draft);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error("Expected valid draft");
    expect(result.data).toMatchObject({
      firstName: "Ana",
      city: "Asunción",
      country: "PY",
      nominatorName: "",
      showNominator: false,
    });
    expect(draft.nominatorName).toBe("Name must stay private");
    expect(result.data.links).toEqual([]);
    expect(result.data.contributions).toEqual([]);
  });

  it("requires an attribution name only when consent is given", () => {
    expect(
      validateNominationDraft({ ...makeDraft(), showNominator: true }),
    ).toMatchObject({ success: false, errors: { nominatorName: "required" } });
    expect(
      validateNominationDraft({
        ...makeDraft(),
        showNominator: true,
        nominatorName: "  Irene Solano  ",
      }),
    ).toMatchObject({ success: true, data: { nominatorName: "Irene Solano" } });
  });

  it.each([299, 1201])(
    "rejects a nomination reason of %i characters",
    (length) => {
      expect(
        validateNominationDraft({ ...makeDraft(), reason: "A".repeat(length) }),
      ).toMatchObject({ success: false, errors: { reason: "reasonLength" } });
    },
  );

  it.each([300, 1200])(
    "accepts a nomination reason of %i Unicode code points",
    (length) => {
      expect(characterCount("𠮷")).toBe(1);
      expect(
        validateNominationDraft({ ...makeDraft(), reason: "𠮷".repeat(length) })
          .success,
      ).toBe(true);
    },
  );

  it("validates trimmed required identity fields and supported countries", () => {
    expect(
      validateNominationDraft({
        ...makeDraft(),
        firstName: "  ",
        city: "",
        country: "ZZ",
        activity: " ",
      }),
    ).toMatchObject({
      success: false,
      errors: {
        firstName: "required",
        city: "required",
        country: "invalidCountry",
        activity: "required",
      },
    });
  });

  it("rejects incomplete contributions and impossible calendar dates", () => {
    expect(
      validateNominationDraft({
        ...makeDraft(),
        contributions: [{ what: "", when: "2025-02-29", forWhom: " " }],
      }),
    ).toMatchObject({
      success: false,
      errors: {
        "contributions.0.what": "required",
        "contributions.0.when": "invalidDate",
        "contributions.0.forWhom": "required",
      },
    });
    expect(
      validateNominationDraft({
        ...makeDraft(),
        contributions: [
          {
            what: "Opened a library",
            when: "2024-02-29",
            forWhom: "Local residents",
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("accepts six contributions and rejects a seventh", () => {
    const entry = {
      what: "Shared books",
      when: "2024-06-01",
      forWhom: "Local residents",
    };
    expect(
      validateNominationDraft({
        ...makeDraft(),
        contributions: Array.from({ length: 6 }, () => ({ ...entry })),
      }).success,
    ).toBe(true);
    expect(
      validateNominationDraft({
        ...makeDraft(),
        contributions: Array.from({ length: 7 }, () => ({ ...entry })),
      }),
    ).toMatchObject({
      success: false,
      errors: { contributions: "maxContributions" },
    });
  });

  it("validates optional link labels and URLs before review", () => {
    expect(
      validateNominationDraft({
        ...makeDraft(),
        links: [{ label: "", url: "javascript:alert(1)" }],
      }),
    ).toMatchObject({
      success: false,
      errors: { "links.0.label": "required", "links.0.url": "invalidUrl" },
    });
    expect(
      validateNominationDraft({
        ...makeDraft(),
        links: [
          { label: " Public profile ", url: " https://example.org/profile " },
        ],
      }),
    ).toMatchObject({
      success: true,
      data: {
        links: [
          { label: "Public profile", url: "https://example.org/profile" },
        ],
      },
    });
  });

  it("limits links to six", () => {
    const links = Array.from({ length: 7 }, () => ({
      label: "Website",
      url: "https://example.org",
    }));
    expect(validateNominationDraft({ ...makeDraft(), links })).toMatchObject({
      success: false,
      errors: { links: "maxLinks" },
    });
  });
});

describe("safe public nominee links", () => {
  it.each([
    "javascript:alert(1)",
    "data:text/html,test",
    "file:///etc/passwd",
    "//example.org",
    "https://person:secret@example.org",
    "https://example.org\\@evil.test",
    "https://example.org/\u202eevil",
    "https://example.org/a b",
    "not a URL",
  ])("rejects %s", (value) => {
    expect(safePublicUrl(value)).toBeNull();
  });
  it.each([
    "https://example.org/public-profile",
    "http://example.org/community",
    "https://例え.jp/紹介",
  ])("permits a public web link: %s", (value) => {
    expect(safePublicUrl(value)).toBe(new URL(value).href);
  });
});
