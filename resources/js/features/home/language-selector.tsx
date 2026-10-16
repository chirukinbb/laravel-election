"use client";

import {useEffect, useId, useRef, useState} from "react";
import {router, usePage} from "@inertiajs/react";
import {homeCopy, type HomeLanguage, homeLanguages} from "./copy";

/**
 * Вспомогательная функция: заменяет или добавляет языковой префикс в URL.
 * Пример: withLocale("/ru/about", "es") -> "/es/about"
 *         withLocale("/about", "es")    -> "/es/about"
 */
function withLocale(url: string, newLocale: string): string {
  if (!url) return `/${newLocale}`;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("#")) {
    return url;
  }

  let cleanUrl = url.startsWith("/") ? url : `/${url}`;

  // Очищаем существующий языковой префикс (/ru, /en, /es)
  cleanUrl = cleanUrl.replace(/^\/(en|ru|es)(\/|$)/, "/");

  // Формируем новый путь с выбранной локалью
  const finalUrl = `/${newLocale}${cleanUrl}`.replace(/\/+/g, "/");
  return finalUrl;
}

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Достаем из Inertia текущий URL страницы и локаль
  const { url: currentUrl, props } = usePage();

  // Текущий язык берем из Shared Props Inertia (со страницы/middleware)
  const currentLanguage = (props.locale as HomeLanguage) || "en";

  // Закрытие выпадающего списка при клике снаружи
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

  // Обработчик выбора языка (SPA-переход через Inertia)
  const handleSelectLanguage = (newCode: HomeLanguage) => {
    setOpen(false);
    trigger.current?.focus();

    if (newCode === currentLanguage) return;

    // Формируем новый URL с выбранным языком
    const newUrl = withLocale(currentUrl, newCode);

    // Делаем SPA-переход без перезагрузки страницы
    router.get(
        newUrl,
        {},
        {
          preserveState: false, // Важно: сбрасываем состояние, чтобы Inertia подтянула свежие Shared Props
          preserveScroll: true, // Сохраняем позицию скролла
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
            onClick={() => setOpen((value) => !value)}
        >
          <bdi>
            {homeLanguages.find(({ code }) => code === currentLanguage)?.shortLabel}
          </bdi>
          <svg aria-hidden="true" viewBox="0 0 12 12" fill="none">
            <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth=".9" />
          </svg>
        </button>
        {open ? (
            <div
                id={menuId}
                className="language-options"
                role="group"
                aria-label={homeCopy[currentLanguage]?.languageLabel}
            >
              {homeLanguages.map(({ code, nativeName, dir }) => (
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