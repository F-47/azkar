import { type Locale } from "@/i18n/routing";

export type AppPath =
  | "/"
  | "/privacy/"
  | "/azkar/"
  | "/azkar/manage/"
  | "/azkar/settings/";

export function localizedPath(locale: string, path: AppPath): string {
  if (path === "/") return locale === "ar" ? "/" : `/${locale}/`;
  if (locale === "ar" && path === "/privacy/") return "/privacy/";
  return `/${locale}${path}`;
}

export function localeRoot(locale: Locale): string {
  return localizedPath(locale, "/");
}
