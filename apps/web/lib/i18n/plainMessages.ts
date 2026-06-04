import ar from "@/messages/ar.json";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import tr from "@/messages/tr.json";
import { getSavedLocale } from "@/lib/i18n/locale";
import type { Locale } from "@/i18n/routing";

const messages = { ar, en, fr, tr } as const;

function getByPath(source: unknown, path: string): string | undefined {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, source) as string | undefined;
}

export function plainT(
  path: string,
  values: Record<string, string | number> = {},
  locale: Locale = getSavedLocale(),
): string {
  const template =
    getByPath(messages[locale], path) ?? getByPath(messages.ar, path) ?? path;

  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
