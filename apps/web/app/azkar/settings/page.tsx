"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Loader2,
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
              <Card className="rounded-2xl p-6 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                      <RefreshCw
                        className={cn(
                          "w-6 h-6",
                          updateState === "checking" && "animate-spin",
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">تحديثات التطبيق</h3>
                      <p className="text-xs text-muted-foreground/60">
                        الإصدار الحالي: 3.1.9
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                      تلقائي
                    </span>
                  </div>
                </div>

                <div className="relative z-10">
                  {updateState === "idle" && (
                    <Button
                      onClick={handleCheckUpdate}
                      variant="ghost"
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 hover:border-primary/30 hover:text-primary transition-all duration-300"
                    >
                      <Sparkles className="w-4 h-4 ml-2 opacity-50" />
                      التحقق من التحديثات
                    </Button>
                  )}

                  {updateState === "checking" && (
                    <Button
                      onClick={handleCheckUpdate}
                      variant="ghost"
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 hover:border-primary/30 hover:text-primary transition-all duration-300"
                    >
                      جار التحقق من وجود تحديثات
                      <RefreshCw className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  )}

                  {updateState === "available" && (
                    <div className="space-y-4 animate-in zoom-in-95 duration-500">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                        <PartyPopper className="w-6 h-6 shrink-0" />
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-black uppercase tracking-widest opacity-80">
                            يتوفر تحديث جديد
                          </span>
                          <span className="text-xs font-bold">
                            الإصدار v{updateVersion} متاح الآن
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={handleInstallUpdate}
                        className="w-full h-14 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-[0.98] transition-all"
                      >
                        <Zap className="w-5 h-5 ml-2 fill-current" />
                        تثبيت التحديث الآن
                      </Button>
                    </div>
                  )}

                  {updateState === "downloading" && (
                    <div className="space-y-5 py-4 animate-in fade-in duration-500">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            جار تحميل التحديث
                          </span>
                        </div>
                        <span className="text-xs font-black text-primary tabular-nums tracking-tighter">
                          {downloadProgress}%
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-white/5 p-1 border border-white/10 ring-4 ring-primary/5">
                        <div
                          className="h-full rounded-full bg-primary shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-500 ease-out"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {updateState === "done" && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                          <Check className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-black uppercase tracking-widest opacity-80">
                            اكتمل التحميل
                          </span>
                          <span className="text-xs font-bold">
                            تم تجهيز التحديث بنجاح!
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          import("@/lib/tauri").then((m) => m.relaunchApp());
                        }}
                        className="w-full h-14 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-sm shadow-[0_10px_20px_rgba(34,197,94,0.2)] active:scale-[0.98] transition-all"
                      >
                        <RefreshCw className="w-5 h-5 ml-2" />
                        إعادة التشغيل والتثبيت
                      </Button>
                    </div>
                  )}
                </div>
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
