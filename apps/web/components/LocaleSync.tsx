"use client";

import type { Locale } from "@/i18n/routing";
import { getLocaleDirection, saveLocale } from "@/lib/i18n/locale";
import { useEffect } from "react";

export function LocaleSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    saveLocale(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = getLocaleDirection(locale);
  }, [locale]);

  return null;
}
