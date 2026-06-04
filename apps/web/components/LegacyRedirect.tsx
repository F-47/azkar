"use client";

import { getSavedLocale } from "@/lib/i18n/locale";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LegacyRedirect({ suffix = "" }: { suffix?: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${getSavedLocale()}/azkar${suffix}/`);
  }, [router, suffix]);

  return null;
}
