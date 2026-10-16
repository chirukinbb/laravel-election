import regions from "./geography-country-regions.json";
import type {Locale} from "@/i18n/locales";

export type Continent =
  "africa" | "asia" | "europe" | "north-america" | "south-america" | "oceania";

export type Country = {
  code: string;
  name: string;
  continent: Continent;
};

type Language = Locale;

export const continentNames: Record<Language, Record<Continent, string>> = {
  en: {
    africa: "Africa",
    asia: "Asia",
    europe: "Europe",
    "north-america": "North America",
    "south-america": "South America",
    oceania: "Oceania",
  },
  "zh-Hans": {
    africa: "非洲",
    asia: "亚洲",
    europe: "欧洲",
    "north-america": "北美洲",
    "south-america": "南美洲",
    oceania: "大洋洲",
  },
  "zh-Hant": {
    africa: "非洲",
    asia: "亞洲",
    europe: "歐洲",
    "north-america": "北美洲",
    "south-america": "南美洲",
    oceania: "大洋洲",
  },
  fr: {
    africa: "Afrique",
    asia: "Asie",
    europe: "Europe",
    "north-america": "Amérique du Nord",
    "south-america": "Amérique du Sud",
    oceania: "Océanie",
  },
  de: {
    africa: "Afrika",
    asia: "Asien",
    europe: "Europa",
    "north-america": "Nordamerika",
    "south-america": "Südamerika",
    oceania: "Ozeanien",
  },
  ar: {
    africa: "أفريقيا",
    asia: "آسيا",
    europe: "أوروبا",
    "north-america": "أمريكا الشمالية",
    "south-america": "أمريكا الجنوبية",
    oceania: "أوقيانوسيا",
  },
  ja: {
    africa: "アフリカ",
    asia: "アジア",
    europe: "ヨーロッパ",
    "north-america": "北アメリカ",
    "south-america": "南アメリカ",
    oceania: "オセアニア",
  },
  "pt-BR": {
    africa: "África",
    asia: "Ásia",
    europe: "Europa",
    "north-america": "América do Norte",
    "south-america": "América do Sul",
    oceania: "Oceania",
  },
  ko: {
    africa: "아프리카",
    asia: "아시아",
    europe: "유럽",
    "north-america": "북아메리카",
    "south-america": "남아메리카",
    oceania: "오세아니아",
  },
  it: {
    africa: "Africa",
    asia: "Asia",
    europe: "Europa",
    "north-america": "America del Nord",
    "south-america": "America del Sud",
    oceania: "Oceania",
  },
  es: {
    africa: "África",
    asia: "Asia",
    europe: "Europa",
    "north-america": "América del Norte",
    "south-america": "América del Sur",
    oceania: "Oceanía",
  },
};

const displayNames = new Map<Language, Intl.DisplayNames>();

// These labels identify the two UN observer states rather than ICU territory labels.
const nameOverrides: Record<Language, Record<string, string>> = {
  en: { VA: "Holy See (Vatican City)", PS: "State of Palestine" },
  es: { VA: "Santa Sede (Ciudad del Vaticano)", PS: "Estado de Palestina" },
  "zh-Hans": { VA: "圣座（梵蒂冈）", PS: "巴勒斯坦国" },
  "zh-Hant": { VA: "聖座（梵蒂岡）", PS: "巴勒斯坦國" },
  fr: { VA: "Saint-Siège (Cité du Vatican)", PS: "État de Palestine" },
  de: { VA: "Heiliger Stuhl (Vatikanstadt)", PS: "Staat Palästina" },
  ar: { VA: "الكرسي الرسولي (الفاتيكان)", PS: "دولة فلسطين" },
  ja: { VA: "ローマ教皇庁（バチカン市国）", PS: "パレスチナ国" },
  "pt-BR": { VA: "Santa Sé (Cidade do Vaticano)", PS: "Estado da Palestina" },
  ko: { VA: "교황청 (바티칸 시국)", PS: "팔레스타인국" },
  it: { VA: "Santa Sede (Città del Vaticano)", PS: "Stato di Palestina" },
};

export function getCountryName(code: string, language: Language): string {
  let names = displayNames.get(language);
  if (!names) {
    names = new Intl.DisplayNames([language], { type: "region" });
    displayNames.set(language, names);
  }
  return nameOverrides[language][code] ?? names.of(code) ?? code;
}

/**
 * 193 UN members plus the Holy See and State of Palestine, not ISO territories.
 * Statistical groupings follow UN M49; Central America and the Caribbean are
 * included in North America. Russia is in Europe, Türkiye/Cyprus/Caucasus in Asia.
 * https://unstats.un.org/unsd/methodology/m49/overview/
 */
export const countries: readonly Country[] = Object.entries(regions)
  .flatMap(([continent, codes]) =>
    codes.split(" ").map((code) => ({
      code,
      name: getCountryName(code, "en"),
      continent: continent as Continent,
    })),
  )
  .sort((a, b) => a.name.localeCompare(b.name, "en"));
