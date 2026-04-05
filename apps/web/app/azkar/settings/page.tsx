"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  loadSettings,
  pickRandomZekrForTest,
  restartScheduler,
  saveSettings,
  stopScheduler,
  type NotificationSettings,
} from "@/lib/notificationScheduler";
import { isTauri, sendAzkarNotification } from "@/lib/tauri";
import { checkForUpdate, installUpdate } from "@/lib/updater";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bell,
  Check,
  Clock,
  Moon,
  PartyPopper,
  RefreshCw,
  Settings,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  const period = h < 12 ? "ص" : "م";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${period}`;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [updateState, setUpdateState] = useState<
    "idle" | "checking" | "available" | "downloading" | "done"
  >("idle");
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
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
    const zekr = pickRandomZekrForTest(settings.category);
    if (zekr) await sendAzkarNotification(zekr);
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

  async function handleCheckUpdate() {
    setUpdateState("checking");
    const version = await checkForUpdate();
    if (version) {
      setUpdateVersion(version);
      setUpdateState("available");
    } else setUpdateState("idle");
  }

  async function handleInstallUpdate() {
    setUpdateState("downloading");
    setDownloadProgress(0);
    await installUpdate((pct) => setDownloadProgress(pct));
    setUpdateState("done");
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
          <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bell className="w-6 h-6" />
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
                    settings.enabled
                      ? "translate-x-0 shadow-lg"
                      : "-translate-x-6",
                  )}
                />
              </button>
            </div>
          </Card>
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
              <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm">
                    نوع الأذكار في الإشعارات
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-5">
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
              <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm">ساعات التفعيل</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                      من الساعة
                    </label>
                    <Select
                      value={String(settings.activeStart)}
                      onValueChange={(value) =>
                        update({ activeStart: Number(value) })
                      }
                    >
                      <SelectTrigger className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>

                      <SelectContent>
                        {HOURS.map((h) => (
                          <SelectItem key={h} value={String(h)}>
                            {formatHour(h)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                      إلى الساعة
                    </label>
                    <Select
                      value={String(settings.activeEnd)}
                      onValueChange={(value) =>
                        update({ activeEnd: Number(value) })
                      }
                    >
                      <SelectTrigger className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>

                      <SelectContent>
                        {HOURS.map((h) => (
                          <SelectItem key={h} value={String(h)}>
                            {formatHour(h)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs items-center flex gap-1.5 mt-4 text-muted-foreground/60 bg-white/5 p-2 rounded-lg border border-white/5">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>لن تظهر إشعارات خارج هذا النطاق الزمني</span>
                </p>
              </Card>
            </div>
          )}
          <div className="grid gap-4">
            <Button
              onClick={handleTest}
              disabled={testing}
              className={cn(
                "h-14 rounded-xl text-sm font-black tracking-widest transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-3 border",
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
            </Button>

            {isTauri() && (
              <Card className="rounded-xl p-6 border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm tracking-tight">
                    تحديثات التطبيق
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>

                {updateState === "idle" && (
                  <Button
                    onClick={handleCheckUpdate}
                    variant="ghost"
                    className="w-full h-11 rounded-xl bg-white/5 border border-white/5 text-xs font-bold hover:bg-white/10"
                  >
                    التحقق من التحديثات
                  </Button>
                )}
                {updateState === "checking" && (
                  <div className="flex flex-col items-center py-2 gap-3">
                    <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      جارٍ التحقق...
                    </p>
                  </div>
                )}
                {updateState === "available" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <PartyPopper className="w-5 h-5" />
                      <span className="text-xs font-bold">
                        يتوفر إصدار جديد: {updateVersion}
                      </span>
                    </div>
                    <Button
                      onClick={handleInstallUpdate}
                      className="w-full h-12 rounded-xl bg-amber-500 text-white font-black shadow-lg shadow-amber-500/20"
                    >
                      تحميل وتثبيت التحديث
                    </Button>
                  </div>
                )}
                {updateState === "downloading" && (
                  <div className="space-y-4 py-2">
                    <div className="flex justify-between items-end px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        جارٍ التحميل
                      </span>
                      <span className="text-sm font-black text-primary">
                        {downloadProgress}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 p-0.5 border border-white/5">
                      <div
                        className="h-full rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {updateState === "done" && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3">
                    <Zap className="w-5 h-5 animate-pulse" />
                    <span className="text-xs font-bold">
                      ✓ تم التحديث. أعد تشغيل التطبيق.
                    </span>
                  </div>
                )}
              </Card>
            )}

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
