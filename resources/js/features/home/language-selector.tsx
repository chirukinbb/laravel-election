"use client";

import {useEffect, useId, useRef, useState} from "react";
import {router, usePage} from "@inertiajs/react";
import {homeCopy, type HomeLanguage, homeLanguages} from "./copy";

const supportedCodes = new Set<string>(homeLanguages.map(({code}) => code.toLowerCase()));

function isExternalOrAnchor(url: string): boolean {
  return /^([a-z][a-z0-9+.-]*:)?\/\//i.test(url) || url.startsWith("#");
}

/**
 * Возвращает путь с нужной локалью.
 * ISO-код языка учитывается ТОЛЬКО в первом сегменте пути.
 * Поддерживаются все языки из homeLanguages. Query и hash сохраняются.
 *
 * withLocale("/ru/tree", "es")        => "/es/tree"
 * withLocale("/about", "en")          => "/en/about"
 * withLocale("/ru", "en")             => "/en"
 * withLocale("/en/ru/page", "es")     => "/es/ru/page"  (второй "ru" — не язык)
 * withLocale("/tree?id=1#top", "ru")  => "/ru/tree?id=1#top"
 */
export function withLocale(url: string, newLocale: HomeLanguage): string {
  if (!url) return `/${newLocale}`;
  if (isExternalOrAnchor(url)) return url;

  // Отделяем путь от query/hash, чтобы они не терялись
  const match = url.match(/^([^?#]*)(.*)$/);
  const path = match?.[1] ?? "";
  const suffix = match?.[2] ?? "";

  const segments = path.split("/").filter(Boolean);

  // Убираем язык, только если он стоит первым
  if (segments.length > 0 && supportedCodes.has(segments[0].toLowerCase())) {
    segments.shift();
  }

  const newPath = "/" + [newLocale, ...segments].join("/");
  return newPath + suffix;
}

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const {url: currentUrl, props} = usePage();

  const propLocale = String(props.locale ?? "").toLowerCase();
  const currentLanguage = (
      homeLanguages.find(({code}) => code.toLowerCase() === propLocale)?.code ??
      homeLanguages[0].code
  ) as HomeLanguage;

  const current = homeLanguages.find(({code}) => code === currentLanguage);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (
          event.target instanceof Node &&
          !region.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  const handleSelectLanguage = (newCode: HomeLanguage) => {
    setOpen(false);
    trigger.current?.focus();

    if (newCode === currentLanguage) return;

    router.get(
        withLocale(currentUrl, newCode),
        {},
        {
          preserveState: false, // подтянуть свежие Shared Props
          preserveScroll: true,
        }
    );
  };

  return (
      <div
          className="language-selector"
          ref={region}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
              trigger.current?.focus();
            }
          }}
      >
        <button
            ref={trigger}
            type="button"
            className="language-trigger"
            aria-label={homeCopy[currentLanguage]?.languageLabel}
            aria-expanded={open}
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={() => setOpen((value) => !value)}
        >
          <bdi>{current?.shortLabel}</bdi>
          <svg aria-hidden="true" viewBox="0 0 12 12" fill="none">
            <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth=".9"/>
          </svg>
        </button>
        {open ? (
            <div
                id={menuId}
                className="language-options"
                role="group"
                aria-label={homeCopy[currentLanguage]?.languageLabel}
            >
              {homeLanguages.map(({code, nativeName, dir}) => (
                  <button
                      key={code}
                      type="button"
                      lang={code}
                      dir={dir}
                      aria-pressed={code === currentLanguage}
                      onClick={() => handleSelectLanguage(code)}
                  >
                    {nativeName}
                    <span aria-hidden="true">{code === currentLanguage ? "✓" : ""}</span>
                  </button>
              ))}
            </div>
        ) : null}
      </div>
  );
}