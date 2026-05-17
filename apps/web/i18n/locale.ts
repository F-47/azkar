import { routing, type Locale } from "@/i18n/routing";

const LANGUAGE_KEY = "azkar-language";

export type Language = Locale;

export const languageOptions: Array<{ value: Language; label: string }> = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

export function normalizeLanguage(value: unknown): Language {
  return value === "en" ? "en" : routing.defaultLocale;
}

export function loadLanguage(): Language {
  if (typeof window === "undefined") return routing.defaultLocale;
  return normalizeLanguage(localStorage.getItem(LANGUAGE_KEY));
}

export function saveLanguage(language: Language): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_KEY, language);
  window.dispatchEvent(new CustomEvent("azkar-language-updated"));
}

export function dirForLanguage(language: Language): "rtl" | "ltr" {
  return language === "ar" ? "rtl" : "ltr";
}

export function isLocale(value: string): value is Language {
  return routing.locales.includes(value as Language);
}
