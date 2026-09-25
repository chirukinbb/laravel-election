"use client";

import {useEffect, useId, useRef, useState} from "react";
import {homeCopy, type HomeLanguage, homeLanguages} from "./copy";

export function LanguageSelector({
  language,
  onChange,
}: {
  readonly language: HomeLanguage;
  readonly onChange: (language: HomeLanguage) => void;
}) {
  const [open, setOpen] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !region.current?.contains(event.target)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

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
        aria-label={homeCopy[language].languageLabel}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {language.toUpperCase()}
        <svg aria-hidden="true" viewBox="0 0 12 12" fill="none">
          <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth=".9" />
        </svg>
      </button>
      {open ? (
        <div
          id={menuId}
          className="language-options"
          role="group"
          aria-label={homeCopy[language].languageLabel}
        >
          {homeLanguages.map(({ code, nativeName }) => (
            <button
              key={code}
              type="button"
              lang={code}
              aria-pressed={code === language}
              onClick={() => {
                onChange(code);
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              {nativeName}
              <span aria-hidden="true">{code === language ? "✓" : ""}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
