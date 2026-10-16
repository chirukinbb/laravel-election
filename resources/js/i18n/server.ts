import "server-only";
import {cache} from "react";
import {cookies} from "next/headers";
import {LOCALE_COOKIE, resolveLocale} from "./locales";

/** Request cache only: never share a visitor's locale between requests. */
export const getRequestLocale = cache(async () => {
  const jar = await cookies();
  return resolveLocale(jar.get(LOCALE_COOKIE)?.value);
});
