"use client";

import {useSyncExternalStore} from "react";
import type {HomeLanguage} from "./copy";

const STORAGE_KEY = "tou.home.language";
const listeners = new Set<() => void>();
let sessionChoice: HomeLanguage | null = null;

function isLanguage(value: string | null): value is HomeLanguage {
  return value === "en" || value === "ru" || value === "es";
}

function readLanguage(): HomeLanguage {
  if (sessionChoice) return sessionChoice;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isLanguage(value) ? value : "en";
  } catch {
    return "en";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      sessionChoice = null;
      listener();
    }
  };
  window.addEventListener("storage", sync);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", sync);
  };
}

function chooseLanguage(language: HomeLanguage) {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
    sessionChoice = null;
  } catch {
    // The choice remains usable for this session when persistence is blocked.
    sessionChoice = language;
  }
  listeners.forEach((listener) => listener());
}

export function useHomeLanguage() {
  const language = useSyncExternalStore(
    subscribe,
    readLanguage,
    (): HomeLanguage => "en",
  );
  return [language, chooseLanguage] as const;
}
