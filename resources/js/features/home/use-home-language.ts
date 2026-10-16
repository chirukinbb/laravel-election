"use client";

import {useLocale} from "@/i18n/provider";

/** Compatibility facade: all features share the site-wide locale. */
export function useHomeLanguage() {
  const { locale, setLocale } = useLocale();
  return [locale, setLocale] as const;
}
