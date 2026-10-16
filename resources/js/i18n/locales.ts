export const locales = [
  { code: "en", nativeName: "English", dir: "ltr", shortLabel: "EN" },
  { code: "es", nativeName: "Español", dir: "ltr", shortLabel: "ES" },
  { code: "zh-Hans", nativeName: "简体中文", dir: "ltr", shortLabel: "简中" },
  { code: "zh-Hant", nativeName: "繁體中文", dir: "ltr", shortLabel: "繁中" },
  { code: "fr", nativeName: "Français", dir: "ltr", shortLabel: "FR" },
  { code: "de", nativeName: "Deutsch", dir: "ltr", shortLabel: "DE" },
  {
    code: "ar",
    nativeName: "العربية",
    dir: "rtl",
    shortLabel: "ع",
    numberingSystem: "arab",
  },
  { code: "ja", nativeName: "日本語", dir: "ltr", shortLabel: "日本語" },
  {
    code: "pt-BR",
    nativeName: "Português (Brasil)",
    dir: "ltr",
    shortLabel: "PT",
  },
  { code: "ko", nativeName: "한국어", dir: "ltr", shortLabel: "한국어" },
  { code: "it", nativeName: "Italiano", dir: "ltr", shortLabel: "IT" },
] as const;

export type Locale = (typeof locales)[number]["code"];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "tou.locale";
export const LOCALE_STORAGE_KEY = "tou.locale";
export const LEGACY_LOCALE_STORAGE_KEY = "tou.home.language";
const supported = new Set<string>(locales.map(({ code }) => code));
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && supported.has(value);
}
export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}
export function localeDirection(locale: Locale): "ltr" | "rtl" {
  return locales.find(({ code }) => code === locale)!.dir;
}
export function localeInfo(locale: Locale) {
  return locales.find(({ code }) => code === locale)!;
}

export function localeNumberingSystem(locale: Locale): string {
  const info = localeInfo(locale);
  return "numberingSystem" in info ? info.numberingSystem : "latn";
}
