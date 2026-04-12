"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Clock,
  Loader2,
  Moon,
  Power,
  RefreshCw,
  Sparkles,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type NotificationSettings } from "@/lib/notificationScheduler";
import { requestCoords, saveCoords, type SavedCoords } from "@/lib/prayerTimes";
import { getAutostartEnabled, isTauri, setAutostartEnabled } from "@/lib/tauri";
import { useEffect, useState } from "react";

export function GeneralSettings({
  settings,
  update,
  coords,
  onUpdateCoords,
}: {
  settings: NotificationSettings;
  update: (patch: Partial<NotificationSettings>) => void;
  coords: SavedCoords | null;
  onUpdateCoords: (c: SavedCoords) => void;
}) {
  const [locating, setLocating] = useState(false);
  const [autostart, setAutostart] = useState<boolean | null>(null);

  useEffect(() => {
    if (isTauri()) {
      getAutostartEnabled().then(setAutostart);
    }
  }, []);

  async function handleToggleAutostart() {
    const next = !autostart;
    setAutostart(next);
    await setAutostartEnabled(next);
  }

  async function handleTogglePrayerTimes() {
    const turningOn = !settings.usePrayerTimes;
    if (turningOn && !coords) {
      setLocating(true);
      const c = await requestCoords();
      saveCoords(c);
      onUpdateCoords(c);
      setLocating(false);
    }
    update({ usePrayerTimes: turningOn });
  }

  return (
    <>
      <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">تفعيل الإشعارات</h3>
              <p className="text-xs text-muted-foreground">
                تظهر أذكار عشوائية على سطح المكتب
              </p>
            </div>
          </div>
          <button
            onClick={() => update({ enabled: !settings.enabled })}
            className={cn(
              "relative w-14 h-8 rounded-full transition-all duration-500 p-1",
              settings.enabled
                ? "bg-primary"
                : "bg-white/10 border border-white/5",
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full bg-white transition-all duration-500",
                settings.enabled ? "translate-x-0 shadow-lg" : "-translate-x-6",
              )}
            />
          </button>
        </div>
      </Card>

      {isTauri() && autostart !== null && (
        <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">تشغيل عند بدء النظام</h3>
                <p className="text-xs text-muted-foreground">
                  يبدأ التطبيق تلقائياً مع تشغيل الجهاز
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleAutostart}
              className={cn(
                "relative w-14 h-8 rounded-full transition-all duration-500 p-1",
                autostart ? "bg-primary" : "bg-white/10 border border-white/5",
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full bg-white transition-all duration-500",
                  autostart ? "translate-x-0 shadow-lg" : "-translate-x-6",
                )}
              />
            </button>
          </div>
        </Card>
      )}

      {settings.enabled && (
        <div className="grid gap-4 animate-in fade-in zoom-in-95 duration-500">
          <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">تكرار الإشعار</h3>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={settings.intervalMinutes}
                  onChange={(e) =>
                    update({
                      intervalMinutes: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="w-16 py-4 rounded-lg bg-white/5 border border-white/10 text-center text-lg font-black tabular-nums focus:outline-none focus:border-primary transition-all"
                />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  دقيقة
                </span>
              </div>
            </div>
          </Card>

          <Card className="rounded-xl p-5 border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">بناءً على أوقات الصلاة</h3>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    الصباح من الفجر • المساء من العصر حتى الفجر
                  </p>
                  {coords && (
                    <p className="text-[10px] text-teal-500/70 mt-0.5">
                      {coords.source === "gps"
                        ? "موقع GPS"
                        : "تقدير من المنطقة الزمنية"}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleTogglePrayerTimes}
                disabled={locating}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-all duration-500 p-1 shrink-0",
                  settings.usePrayerTimes
                    ? "bg-primary"
                    : "bg-white/10 border border-white/5",
                )}
              >
                {locating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                ) : (
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full bg-white transition-all duration-500",
                      settings.usePrayerTimes
                        ? "translate-x-0 shadow-lg"
                        : "-translate-x-6",
                    )}
                  />
                )}
              </button>
            </div>
          </Card>

          {!settings.usePrayerTimes && (
            <Card className="rounded-xl p-5 border-white/10 bg-white/5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">نوع الأذكار</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "الصباح",
                    value: "morning",
                    icon: Sun,
                    color: "text-amber-500",
                  },
                  {
                    label: "المساء",
                    value: "evening",
                    icon: Moon,
                    color: "text-blue-400",
                  },
                  {
                    label: "الكل",
                    value: "both",
                    icon: Sparkles,
                    color: "text-purple-400",
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = settings.category === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        update({
                          category:
                            opt.value as NotificationSettings["category"],
                        })
                      }
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-lg transition-all duration-300 border active:scale-95",
                        active
                          ? cn(
                              "border-primary/50 bg-primary/5 shadow-md scale-105",
                              opt.color,
                            )
                          : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/10",
                      )}
                    >
                      <Icon className={cn("w-5 h-5", opt.color)} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
