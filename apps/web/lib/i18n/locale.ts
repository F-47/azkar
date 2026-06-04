import { defaultLocale, locales, type Locale } from "@/i18n/routing";

export const LOCALE_STORAGE_KEY = "azkar-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getSavedLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : defaultLocale;
}

export function saveLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function getLocaleDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function localizePath(pathname: string, locale: Locale): string {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const parts = clean.split("/");
  if (isLocale(parts[1])) {
    parts[1] = locale;
    return parts.join("/") || `/${locale}/`;
  }
  return `/${locale}${clean === "/" ? "/" : clean}`;
}
