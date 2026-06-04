"use client";

import { isTauri } from "@/lib/tauri";
import { localizedPath } from "@/lib/i18n/routes";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getServerSnapshot = () => false;

export default function AzkarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const locale = useLocale();
  const allowed = useSyncExternalStore(subscribe, isTauri, getServerSnapshot);

  useEffect(() => {
    if (!allowed) {
      router.replace(localizedPath(locale, "/"));
    }
  }, [allowed, locale, router]);

  if (!allowed) return null;

  return <>{children}</>;
}
