"use client";

import CategoryToggle from "@/components/CategoryToggle";
import ProgressBar from "@/components/ProgressBar";
import ZekrCard from "@/components/ZekrCard";
import { useAzkar } from "@/hooks/useAzkar";
import { startScheduler } from "@/lib/notificationScheduler";
import { requestNotificationPermission } from "@/lib/tauri";
import { cn } from "@/lib/utils";
import {
  ListChecks,
  Loader2,
  Moon,
  RotateCw,
  Settings,
  Sun,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Reset from "@/components/reset";

export default function AzkarPage() {
  const {
    azkar,
    category,
    progress,
    mounted,
    decrement,

    switchCategory,
    totalCount,
    completedCount,
    isComplete,
  } = useAzkar();

  useEffect(() => {
    requestNotificationPermission().then(() => startScheduler());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.1),transparent_60%)]" />
      <header className="sticky top-0 z-10 border-b border-white/5 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-background/40" />

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

              <h1 className="text-xl font-black tracking-tight">
                {category === "morning" ? "أذكار الصباح" : "أذكار المساء"}
              </h1>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                asChild
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 focus-visible:ring-yellow-500/20 focus-visible:border-yellow-500 flex items-center justify-center text-muted-foreground hover:text-yellow-500 hover:bg-white/10 hover:border-yellow-500/30 transition-all"
                title="إدارة الأذكار"
              >
                <Link href="/azkar/manage">
                  <ListChecks className="w-5 h-5" />
                </Link>
              </Button>

              <Button
                title="الإعدادات"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 focus-visible:ring-accent/20 focus-visible:border-accent flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-white/10 hover:border-accent/30 transition-all"
                asChild
              >
                <Link href="/azkar/settings">
                  <Settings className="w-5 h-5" />
                </Link>
              </Button>

              <Reset />
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

      <main className="flex-1 overflow-y-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          {mounted && isComplete && azkar.length > 0 && (
            <div className="p-8 rounded-2xl text-center relative overflow-hidden group mb-8 border border-green-500/20 bg-green-500/5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1),transparent_70%)] animate-pulse" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                  <LayoutDashboard className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black mb-2 text-white">
                  ما شاء الله!
                </h2>
                <p className="text-muted-foreground font-medium">
                  اكتملت جميع أذكار{" "}
                  {category === "morning" ? "الصباح" : "المساء"}
                </p>
                <p className="text-sm mt-1 text-green-400/80">
                  تقبّل الله منك طاعتك
                </p>
              </div>
            </div>
          )}

          {!mounted ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-50">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-sm font-bold tracking-widest uppercase">
                جاري تحميل الأذكار...
              </p>
            </div>
          ) : azkar.length === 0 ? (
            <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-2xl">
              <p className="text-xl font-bold text-muted-foreground">
                لا توجد أذكار مفعلة
              </p>
              <Link
                href="/azkar/manage"
                className="mt-4 inline-block text-primary font-bold hover:underline"
              >
                انتقل لصفحة الإدارة لتفعيل الأذكار
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {azkar.map((zekr) => (
                <ZekrCard
                  key={zekr.id}
                  zekr={zekr}
                  remaining={progress[zekr.id] ?? zekr.count}
                  onDecrement={decrement}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 px-4 text-center text-muted-foreground/30 relative z-10 border-t border-white/5 mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em]">
          أذكار المسلم • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
