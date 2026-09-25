import regions from "./geography-country-regions.json";

export type Continent =
  "africa" | "asia" | "europe" | "north-america" | "south-america" | "oceania";

export type Country = {
  code: string;
  name: string;
  continent: Continent;
};

type Language = "en" | "ru" | "es";

export const continentNames: Record<Language, Record<Continent, string>> = {
  en: {
    africa: "Africa",
    asia: "Asia",
    europe: "Europe",
    "north-america": "North America",
    "south-america": "South America",
    oceania: "Oceania",
  },
  ru: {
    africa: "Африка",
    asia: "Азия",
    europe: "Европа",
    "north-america": "Северная Америка",
    "south-america": "Южная Америка",
    oceania: "Океания",
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

const displayNames = {
  en: new Intl.DisplayNames(["en"], { type: "region" }),
  ru: new Intl.DisplayNames(["ru"], { type: "region" }),
  es: new Intl.DisplayNames(["es"], { type: "region" }),
};

// These labels identify the two UN observer states rather than ICU territory labels.
const nameOverrides: Record<Language, Record<string, string>> = {
  en: { VA: "Holy See (Vatican City)", PS: "State of Palestine" },
  ru: { VA: "Святой Престол (Ватикан)", PS: "Государство Палестина" },
  es: { VA: "Santa Sede (Ciudad del Vaticano)", PS: "Estado de Palestina" },
};

export function getCountryName(code: string, language: Language): string {
  return (
    nameOverrides[language][code] ?? displayNames[language].of(code) ?? code
  );
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
