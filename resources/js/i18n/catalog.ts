import {type Locale, localeNumberingSystem} from "./locales";

/** Widen strings while retaining namespace keys and tuples. */
export type DeepStrings<T> = T extends string
  ? string
  : T extends object
    ? { readonly [K in keyof T]: DeepStrings<T[K]> }
    : T;
export function defineMessages<T extends object>(
  english: T,
  translations: Record<Exclude<Locale, "en">, DeepStrings<T>>,
): Readonly<Record<Locale, DeepStrings<T>>> {
  return { ...translations, en: english } as Record<Locale, DeepStrings<T>>;
}
/** Sentence order belongs to translations, not concatenated UI fragments. */
export function interpolate(
  message: string,
  values: Readonly<Record<string, string | number>>,
) {
  return message.replace(
    /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g,
    (token, key: string) =>
      Object.hasOwn(values, key) ? String(values[key]) : token,
  );
}
export function pluralMessage(
  locale: Locale,
  count: number,
  forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string },
) {
  const form = new Intl.PluralRules(locale).select(count);
  return interpolate(forms[form] ?? forms.other, {
    count: new Intl.NumberFormat(locale, {
      numberingSystem: localeNumberingSystem(locale),
    }).format(count),
  });
}
