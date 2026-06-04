"use client";

import { locales, type Locale } from "@/i18n/routing";
import { getLocaleDirection, localizePath, saveLocale } from "@/lib/i18n/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("language");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getLocaleDirection(locale);
  }, [locale]);

  function switchLocale(nextLocale: Locale) {
    saveLocale(nextLocale);
    router.push(localizePath(pathname || "/", nextLocale));
  }

  return (
    <div className={className}>
      <Select
        value={locale}
        onValueChange={(value) => switchLocale(value as Locale)}
      >
        <SelectTrigger
          aria-label={t("label")}
          className="h-11 w-full rounded-lg border-white/10 bg-white/5 px-4 text-sm font-bold"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Languages className="h-4 w-4 shrink-0 text-muted-foreground" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {locales.map((item) => (
            <SelectItem key={item} value={item}>
              {t(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
