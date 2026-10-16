import {describe, expect, it} from "vitest";
import {commonMessages} from "./common";
import {interpolate, pluralMessage} from "./catalog";
import {isLocale, localeDirection, locales, resolveLocale} from "./locales";

describe("locale registry and formatting", () => {
  it("supports exactly the eleven requested BCP 47 locales", () => {
    expect(locales.map(({ code }) => code)).toEqual([
      "en",
      "es",
      "zh-Hans",
      "zh-Hant",
      "fr",
      "de",
      "ar",
      "ja",
      "pt-BR",
      "ko",
      "it",
    ]);
    for (const { code, dir } of locales) {
      expect(Intl.getCanonicalLocales(code)).toEqual([code]);
      expect(isLocale(code)).toBe(true);
      expect(localeDirection(code)).toBe(code === "ar" ? "rtl" : "ltr");
      expect(dir).toBe(localeDirection(code));
      expect(Object.values(commonMessages[code]).every(Boolean)).toBe(true);
    }
  });
  it("rejects unsupported, malformed and legacy cookie values", () => {
    for (const input of [
      null,
      undefined,
      "",
      "ru",
      "AR",
      "ar<script>",
      {},
      ["ar"],
    ]) {
      expect(isLocale(input)).toBe(false);
      expect(resolveLocale(input)).toBe("en");
    }
  });
  it("keeps interpolation in translation order and never executes values", () => {
    expect(
      interpolate("{last}، {first}: {count}", {
        first: "A",
        last: "B",
        count: 2,
      }),
    ).toBe("B، A: 2");
    expect(interpolate("{name}", { name: "<script>alert(1)</script>" })).toBe(
      "<script>alert(1)</script>",
    );
    expect(interpolate("{unknown}", {})).toBe("{unknown}");
  });
  it("supports all six Arabic plural categories and CJK invariant plurals", () => {
    const forms = {
      zero: "zero",
      one: "one",
      two: "two",
      few: "few",
      many: "many",
      other: "other",
    };
    expect(
      [0, 1, 2, 3, 11, 100].map((n) => pluralMessage("ar", n, forms)),
    ).toEqual(Object.values(forms));
    expect(pluralMessage("zh-Hans", 1, forms)).toBe("other");
    expect(pluralMessage("ar", 1234, { other: "{count}" })).toBe("١٬٢٣٤");
  });
});
