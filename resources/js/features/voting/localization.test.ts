import {createElement} from "react";
import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {locales} from "@/i18n/locales";
import {votingCopy} from "./copy";
import {mapCopy} from "./map-copy";
import {votingStoryCopy} from "./voting-story-copy";
import {nomineeTranslations} from "./nominee-translations";
import {nominees} from "./nominees";
import {countries, getCountryName} from "./countries";
import {filterNominees} from "./voting-model";
import {votingCount, votingNumber} from "./format";
import {Countdown} from "./countdown";

const codes = locales.map(({ code }) => code);
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "object" && value !== null)
    return Object.values(value).flatMap(strings);
  return [];
}

describe("complete Voting locale catalogs", () => {
  it("has exactly the eleven supported locales, complete keys and no empty messages", () => {
    for (const catalog of [votingCopy, mapCopy, votingStoryCopy]) {
      expect(Object.keys(catalog).sort()).toEqual([...codes].sort());
      for (const code of codes) {
        expect(Object.keys(catalog[code]).sort()).toEqual(
          Object.keys(catalog.en).sort(),
        );
        expect(strings(catalog[code]).length).toBe(strings(catalog.en).length);
        expect(
          strings(catalog[code]).every((value) => value.trim().length > 0),
        ).toBe(true);
      }
    }
  });

  it("binds every translated profile to a stable nominee ID without English fallback", () => {
    for (const catalog of Object.values(nomineeTranslations)) {
      expect(Object.keys(catalog).sort()).toEqual(
        nominees.map(({ id }) => id).sort(),
      );
    }
    for (const person of nominees) {
      for (const field of [
        "activity",
        "reason",
        "qualities",
        "contribution",
      ] as const) {
        expect(Object.keys(person[field]).sort()).toEqual([...codes].sort());
        for (const code of codes.filter((value) => value !== "en")) {
          expect(person[field][code], `${person.id}/${field}/${code}`).not.toBe(
            person[field].en,
          );
        }
      }
    }
  });

  it.each(codes)("searches all translated nominee countries in %s", (code) => {
    expect(countries).toHaveLength(195);
    for (const person of nominees) {
      const localizedCountry = getCountryName(person.country, code);
      expect(
        filterNominees(
          nominees,
          localizedCountry,
          null,
          "name",
          code,
          null,
        ).map(({ id }) => id),
      ).toContain(person.id);
    }
  });

  it("keeps simplified and traditional Chinese text distinct", () => {
    expect(votingCopy["zh-Hans"].search).toBe("搜索候选人");
    expect(votingCopy["zh-Hant"].search).toBe("搜尋候選人");
    expect(getCountryName("US", "zh-Hans")).toBe("美国");
    expect(getCountryName("US", "zh-Hant")).toBe("美國");
  });
});

describe("localized voting quantities", () => {
  it("formats numbers and plural counts for Arabic, European and CJK locales", () => {
    expect(votingNumber(7, "ar", 2)).toBe("٠٧");
    expect(votingNumber(1200, "de")).toBe("1.200");
    expect(votingNumber(1200, "pt-BR")).toBe("1.200");
    expect(votingCount(1, "nominees", "en")).toBe("1 nominee");
    expect(votingCount(2, "nominees", "en")).toBe("2 nominees");
    expect(votingCount(0, "nominees", "ar")).toBe("لا مرشحين");
    expect(votingCount(1, "nominees", "ar")).toBe("مرشح واحد");
    expect(votingCount(2, "nominees", "ar")).toBe("مرشحان");
    expect(votingCount(3, "nominees", "ar")).toBe("٣ مرشحين");
    expect(votingCount(11, "nominees", "ar")).toBe("١١ مرشحًا");
    expect(votingCount(20, "nominees", "ja")).toBe("候補者20人");
  });

  it("renders the countdown with localized labels and digits", () => {
    const { container } = render(createElement(Countdown, { language: "ar" }));
    expect(screen.getByRole("timer").textContent).toMatch(/[٠-٩]/);
    expect(screen.getByRole("timer").textContent).not.toMatch(/[0-9]/);
    expect(screen.getByText("ثوانٍ")).toBeInTheDocument();
    expect(
      container.querySelector(".voting-countdown")?.getAttribute("title"),
    ).toContain("UTC");
  });
});
