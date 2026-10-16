import {describe, expect, it} from "vitest";
import {locales} from "@/i18n/locales";
import {accountCopy, accountSummaryCopy} from "@/features/auth/copy";
import {goldenLeavesCopy} from "@/features/golden-leaves/copy";
import {leafEditorialMedia} from "@/features/golden-leaves/media";
import {homeCopy, homeLanguages} from "./copy";

function strings(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") return { [prefix]: value };
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      Object.entries(strings(child, `${prefix}.${key}`)),
    ),
  );
}

describe("cinematic and account translations", () => {
  for (const [namespace, catalog] of Object.entries({
    home: homeCopy,
    account: accountCopy,
    accountSummary: accountSummaryCopy,
    goldenLeaves: goldenLeavesCopy,
  })) {
    it(`${namespace} supplies every key and translated content for exactly the supported locales`, () => {
      expect(Object.keys(catalog).sort()).toEqual(
        locales.map(({ code }) => code).sort(),
      );
      const reference = strings(catalog.en);
      for (const { code } of locales) {
        const translated = strings(catalog[code]);
        expect(Object.keys(translated).sort(), code).toEqual(
          Object.keys(reference).sort(),
        );
        expect(
          Object.values(translated).every((value) => value.trim().length > 0),
          code,
        ).toBe(true);
        if (code !== "en") {
          const changed = Object.entries(translated).filter(
            ([key, value]) => value !== reference[key],
          );
          expect(
            changed.length / Object.keys(reference).length,
            code,
          ).toBeGreaterThan(0.8);
        }
      }
    });
  }

  it("keeps image descriptions and placeholder labels translated for every media slot", () => {
    for (const { code } of locales) {
      expect(goldenLeavesCopy[code].media).toHaveLength(
        leafEditorialMedia.length,
      );
      expect(goldenLeavesCopy[code].viewImage).toContain("{description}");
    }
  });

  it("uses the shared locale registry without a legacy Russian option", () => {
    expect(homeLanguages).toBe(locales);
    expect(homeLanguages).toHaveLength(11);
    expect(homeLanguages.some(({ code }) => (code as string) === "ru")).toBe(
      false,
    );
  });
});
