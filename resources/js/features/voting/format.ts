import {type Locale, localeNumberingSystem} from "@/i18n/locales";
import {pluralMessage} from "@/i18n/catalog";

const numberFormats = new Map<string, Intl.NumberFormat>();
export function votingNumber(
  value: number,
  locale: Locale,
  minimumIntegerDigits = 1,
): string {
  const key = `${locale}:${minimumIntegerDigits}`;
  let formatter = numberFormats.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      minimumIntegerDigits,
      useGrouping: minimumIntegerDigits === 1,
      numberingSystem: localeNumberingSystem(locale),
    });
    numberFormats.set(key, formatter);
  }
  return formatter.format(value);
}

type CountForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string;
};
const countMessages = {
  en: {
    countries: { one: "{count} country", other: "{count} countries" },
    nominees: { one: "{count} nominee", other: "{count} nominees" },
  },
  es: {
    countries: { one: "{count} país", other: "{count} países" },
    nominees: { one: "{count} nominado", other: "{count} nominados" },
  },
  "zh-Hans": {
    countries: { other: "{count} 个国家" },
    nominees: { other: "{count} 位候选人" },
  },
  "zh-Hant": {
    countries: { other: "{count} 個國家" },
    nominees: { other: "{count} 位候選人" },
  },
  fr: {
    countries: { other: "{count} pays" },
    nominees: { one: "{count} candidat", other: "{count} candidats" },
  },
  de: {
    countries: { one: "{count} Land", other: "{count} Länder" },
    nominees: { one: "{count} nominierte Person", other: "{count} Nominierte" },
  },
  ar: {
    countries: {
      zero: "لا دول",
      one: "دولة واحدة",
      two: "دولتان",
      few: "{count} دول",
      many: "{count} دولة",
      other: "{count} دولة",
    },
    nominees: {
      zero: "لا مرشحين",
      one: "مرشح واحد",
      two: "مرشحان",
      few: "{count} مرشحين",
      many: "{count} مرشحًا",
      other: "{count} مرشح",
    },
  },
  ja: {
    countries: { other: "{count}か国" },
    nominees: { other: "候補者{count}人" },
  },
  "pt-BR": {
    countries: { one: "{count} país", other: "{count} países" },
    nominees: { one: "{count} indicado", other: "{count} indicados" },
  },
  ko: {
    countries: { other: "{count}개국" },
    nominees: { other: "후보자 {count}명" },
  },
  it: {
    countries: { one: "{count} paese", other: "{count} paesi" },
    nominees: { one: "{count} candidato", other: "{count} candidati" },
  },
} satisfies Record<Locale, Record<"countries" | "nominees", CountForms>>;

const countCache = new Map<string, string>();
export function votingCount(
  count: number,
  kind: "countries" | "nominees",
  locale: Locale,
): string {
  const key = `${locale}:${kind}:${count}`;
  let result = countCache.get(key);
  if (result === undefined) {
    result = pluralMessage(locale, count, countMessages[locale][kind]);
    countCache.set(key, result);
  }
  return result;
}
