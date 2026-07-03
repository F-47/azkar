"use client";

import CategoryToggle from "@/components/CategoryToggle";
import ProgressBar from "@/components/ProgressBar";
import Reset from "@/components/reset";
import { Button } from "@/components/ui/button";
import UpdateNotifier from "@/components/UpdateNotifier";
import ZekrCard from "@/components/ZekrCard";
import { useAzkar } from "@/hooks/useAzkar";
import { loadSettings, startScheduler } from "@/lib/notificationScheduler";
import { requestNotificationPermission } from "@/lib/tauri";
import { cn } from "@/lib/utils";
import { localizedPath } from "@/lib/i18n/routes";
import {
  LayoutDashboard,
  ListChecks,
  Loader2,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AzkarPage() {
  const {
    azkar,
    category,
    progress,
    mounted,
    decrement,
    reset,
    switchCategory,
    totalCount,
    completedCount,
    isComplete,
  } = useAzkar();
  const t = useTranslations("azkar");
  const common = useTranslations("common");
  const locale = useLocale();
  const [showTransliteration] = useState(
    () => loadSettings().showTransliteration,
  );

  useEffect(() => {
    requestNotificationPermission().then(() => startScheduler());
  }, []);

  const categoryName =
    category === "morning" ? common("morning") : common("evening");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <UpdateNotifier />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.1),transparent_60%)]" />
      <header className="sticky top-0 z-20 border-b border-white/5 bg-background/95">
        <div className="px-4 py-4 relative">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                  category === "morning"
                    ? "bg-amber-500/20 text-amber-500"
                    : "bg-blue-500/20 text-blue-400",
                )}
              >
                {category === "morning" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </div>

              <h1 className="text-lg font-black tracking-tight sm:text-xl">
                {category === "morning" ? t("morningTitle") : t("eveningTitle")}
              </h1>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                asChild
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 focus-visible:ring-yellow-500/20 focus-visible:border-yellow-500 flex items-center justify-center text-muted-foreground hover:text-yellow-500 hover:bg-white/10 hover:border-yellow-500/30 transition-all"
                title={t("manage")}
              >
                <Link
                  href={localizedPath(locale, "/azkar/manage/")}
                  prefetch={false}
                >
                  <ListChecks className="w-5 h-5" />
                </Link>
              </Button>

              <Button
                title={t("settings")}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 focus-visible:ring-accent/20 focus-visible:border-accent flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-white/10 hover:border-accent/30 transition-all"
                asChild
              >
                <Link
                  href={localizedPath(locale, "/azkar/settings/")}
                  prefetch={false}
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </Button>

              <Reset onReset={reset} />
            </div>
          </div>
          <CategoryToggle active={category} onChange={switchCategory} />
          <div className="mt-5">
            {mounted && (
              <ProgressBar completed={completedCount} total={totalCount} />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          {mounted && isComplete && azkar.length > 0 && (
            <div className="p-8 rounded-2xl text-center relative overflow-hidden group mb-8 border border-green-500/20 bg-green-500/5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.08),transparent_70%)]" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutDashboard className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-black mb-2 text-white sm:text-2xl">
                  {t("completeTitle")}
                </h2>
                <p className="text-muted-foreground font-medium">
                  {t("completeText", { category: categoryName })}
                </p>
                <p className="text-sm mt-1 text-green-400/80">
                  {t("completeSubtext")}
                </p>
              </div>
            </div>
          )}

          {!mounted ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-50">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-sm font-bold uppercase">
                {common("loadingAzkar")}
              </p>
            </div>
          ) : azkar.length === 0 ? (
            <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-2xl">
              <p className="text-lg font-bold text-muted-foreground">
                {t("empty")}
              </p>
              <Link
                href={localizedPath(locale, "/azkar/manage/")}
                className="mt-4 inline-block text-primary font-bold hover:underline"
              >
                {t("emptyLink")}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 border-none">
              {azkar.map((zekr) => (
                <ZekrCard
                  key={zekr.id}
                  zekr={zekr}
                  remaining={progress[zekr.id] ?? zekr.count}
                  showTransliteration={showTransliteration}
                  onDecrement={decrement}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 px-4 text-center text-muted-foreground/30 relative z-10 border-t border-white/5 mt-8 space-y-3">
        <div className="relative w-14 h-14 mx-auto">
          <Image src="/logo.png" alt="icon" fill className="object-contain" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em]">
          {t("footer", { year: new Date().getFullYear() })}
        </p>
      </footer>
    </div>
  );
}
