import {cache} from "react";
import {resolveLocale} from "./locales";

/** Request cache only: never share a visitor's locale between requests. */
export const getRequestLocale = cache(async () => {
  return resolveLocale(undefined);
});
