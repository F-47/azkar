"use client";

import { Button } from "@/components/ui/button";
import {
  loadSettings,
  pickRandomZekrForTest,
  restartScheduler,
  saveSettings,
  stopScheduler,
  type NotificationSettings,
} from "@/lib/notificationScheduler";
import { loadCoords, type SavedCoords } from "@/lib/prayerTimes";
import { isTauri, sendAzkarNotification } from "@/lib/tauri";
import { cn } from "@/lib/utils";
import { ArrowLeft, Bell, Check, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { AppUpdateCard } from "@/components/settings/AppUpdateCard";
import { GeneralSettings } from "@/components/settings/GeneralSettings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<SavedCoords | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setCoords(loadCoords());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => setSettings(loadSettings()), 0);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  async function handleTest() {
    if (!settings) return;
    setTesting(true);
    const result = pickRandomZekrForTest(settings.category);
    if (result) await sendAzkarNotification(result.title, result.text);
    setTimeout(() => setTesting(false), 2000);
  }

  function update(patch: Partial<NotificationSettings>) {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function handleSave() {
    if (!settings) return;
    saveSettings(settings);
    if (settings.enabled) restartScheduler();
    else stopScheduler();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!mounted || !settings) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.1),transparent_60%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black tracking-tight">الإعدادات</h1>
        </div>
        <Link href="/azkar">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-xl bg-white/5 border border-accent/20 focus-visible:ring-accent/20 focus-visible:border-accent text-muted-foreground hover:text-accent transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </header>

      <main className="flex-1 px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <GeneralSettings
            settings={settings}
            update={update}
            coords={coords}
            onUpdateCoords={setCoords}
          />

          {settings.enabled && (
            <AppearanceSettings settings={settings} update={update} />
          )}

          <div className="grid gap-4">
            <button
              onClick={handleTest}
              disabled={testing}
              className={cn(
                "h-14 rounded-xl text-sm font-black transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-3 border",
                testing
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-white/5 text-white hover:bg-primary/5 hover:border-primary/20",
              )}
            >
              {testing ? (
                <>
                  تم إرسال إشعار التجربة
                  <Check className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5" />
                  اختبار إشعار الآن
                </>
              )}
            </button>

            {isTauri() && <AppUpdateCard />}

            <Button
              onClick={handleSave}
              className={cn(
                "h-12 rounded-xl text-base font-black transition-all active:scale-[0.98] mb-10",
                saved
                  ? "bg-primary/10 hover:bg-primary/15 text-primary"
                  : "bg-primary/80 text-primary-foreground shadow-primary/40",
              )}
            >
              {saved ? (
                <>
                  تم حفظ الإعدادات
                  <Check className="w-5 h-5" />
                </>
              ) : (
                "حفظ الكل"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
