"use client";

import CategoryToggle from "@/components/CategoryToggle";
import ProgressBar from "@/components/ProgressBar";
import ZekrCard from "@/components/ZekrCard";
import { useAzkar } from "@/hooks/useAzkar";
import { startScheduler } from "@/lib/notificationScheduler";
import {
  requestNotificationPermission,
  sendAzkarNotification,
} from "@/lib/tauri";
import { Bell, Moon, RotateCw, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AzkarPage() {
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

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

  useEffect(() => {
    requestNotificationPermission().then(() => startScheduler());
  }, []);

  useEffect(() => {
    if (isComplete && mounted && azkar.length > 0) {
      const msg =
        category === "morning"
          ? "أحسنت! اكتملت أذكار الصباح"
          : "أحسنت! اكتملت أذكار المساء";
      sendAzkarNotification(msg);
    }
  }, [isComplete, category, mounted, azkar.length]);

  const headerBg =
    category === "morning"
      ? "linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)"
      : "linear-gradient(135deg, #0D1B2A 0%, #1a3a5c 60%, #1B5E20 100%)";

  return (
    <div
      className="min-h-screen flex flex-col"
      dir="rtl"
      style={{ background: "var(--bg-primary)" }}
    >
      <header
        className="sticky top-0 z-10 px-4 pt-5 pb-4 shadow-lg"
        style={{ background: headerBg }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-xl font-bold flex items-center gap-2">
            {category === "morning" ? (
              <>
                <Sun className="w-5 h-5" />
                أذكار الصباح
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                أذكار المساء
              </>
            )}
          </h1>

          <div className="flex items-center gap-2">
            <Link
              href="/azkar/settings"
              className="text-white/70 hover:text-white transition-colors text-lg"
              title="إعدادات الإشعارات"
            >
              <Settings />
            </Link>
            <button
              onClick={reset}
              className="text-orange-500 hover:text-orange-600 transition-colors text-lg"
              title="إعادة تعيين"
            >
              <RotateCw />
            </button>
          </div>
        </div>

        <CategoryToggle active={category} onChange={switchCategory} />

        <div className="mt-3">
          {mounted && (
            <ProgressBar completed={completedCount} total={totalCount} />
          )}
        </div>
      </header>

      {mounted && isComplete && (
        <div
          className="mx-4 mt-4 p-4 rounded-xl text-center shadow-sm"
          style={{
            background: "var(--success-bg)",
            border: "1px solid var(--success-border)",
          }}
        >
          <p
            className="font-bold text-lg"
            style={{ color: "var(--success-text)" }}
          >
            ما شاء الله! اكتملت جميع الأذكار
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--success-text)" }}>
            تقبّل الله منك
          </p>
        </div>
      )}

      <main className="flex-1 px-4 py-4 space-y-3 pb-8 max-w-2xl w-full mx-auto">
        {!mounted ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{
                borderColor: "var(--green-primary)",
                borderTopColor: "transparent",
              }}
            />
          </div>
        ) : azkar.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>
              لا توجد أذكار
            </p>
          </div>
        ) : (
          azkar.map((zekr, i) => (
            <ZekrCard
              key={zekr.id}
              zekr={zekr}
              index={i + 1}
              remaining={progress[zekr.id] ?? zekr.count}
              onDecrement={decrement}
            />
          ))
        )}
      </main>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 arabic-text text-sm px-5 py-3 rounded-2xl shadow-xl z-50 pointer-events-none"
          style={{ background: "var(--green-primary)", color: "#fff" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
