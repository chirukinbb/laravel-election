import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState,} from "react";
import {
  defaultLocale,
  isLocale,
  LEGACY_LOCALE_STORAGE_KEY,
  type Locale,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  localeDirection,
} from "./locales";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>({ locale: defaultLocale, setLocale: () => {} });

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = localeDirection(locale);
}

function persistLocale(locale: Locale) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  syncStorage(locale);
}

function syncStorage(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    localStorage.setItem(LEGACY_LOCALE_STORAGE_KEY, locale);
  } catch {
    /* Cookies and in-memory state work without browser storage. */
  }
}

export function LocaleProvider({
                                 initialLocale = defaultLocale,
                                 children,
                               }: {
  readonly initialLocale?: Locale;
  readonly children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    persistLocale(next);
    applyDocumentLocale(next);
    setLocaleState(next);
  }, []);

  useEffect(() => {
    const cookie = document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${LOCALE_COOKIE}=`));
    const cookieLocale = cookie?.slice(LOCALE_COOKIE.length + 1);

    if (isLocale(cookieLocale)) {
      syncStorage(cookieLocale);
      if (cookieLocale !== initialLocale) {
        setLocale(cookieLocale);
      }
      return;
    }

    const hasCookie = cookie !== undefined;
    if (!hasCookie) {
      try {
        const saved =
            localStorage.getItem(LOCALE_STORAGE_KEY) ??
            localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY);
        if (isLocale(saved) && saved !== initialLocale) {
          setLocale(saved);
          return;
        }
      } catch {
        /* Storage is optional. */
      }
      persistLocale(initialLocale);
    }
  }, [initialLocale, setLocale]);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCALE_STORAGE_KEY && isLocale(event.newValue)) {
        applyDocumentLocale(event.newValue);
        setLocaleState(event.newValue as Locale);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}