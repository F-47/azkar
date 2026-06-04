"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  loadSettings,
  pickRandomZekrForTest,
  restartScheduler,
  saveSettings,
  stopScheduler,
  type NotificationSettings,
} from "@/lib/notificationScheduler";
import { loadCoords, type SavedCoords } from "@/lib/prayerTimes";
import {
  getAutostartEnabled,
  isTauri,
  sendAzkarNotification,
  setAutostartEnabled,
} from "@/lib/tauri";
import { cn } from "@/lib/utils";
import { localizedPath } from "@/lib/i18n/routes";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  Palette,
  Settings,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { AppUpdateCard } from "@/components/settings/AppUpdateCard";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { PrayerSettings } from "@/components/settings/PrayerSettings";

export default function SettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const t = useTranslations("settings");
  const common = useTranslations("common");
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [savedSettings, setSavedSettings] =
    useState<NotificationSettings | null>(null);
  const [testing, setTesting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<SavedCoords | null>(null);
  const [autostart, setAutostart] = useState<boolean | null>(null);
  const [savedAutostart, setSavedAutostart] = useState<boolean | null>(null);
  const [shakeSaveBar, setShakeSaveBar] = useState(false);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setCoords(loadCoords());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        const loaded = loadSettings();
        setSettings(loaded);
        setSavedSettings(loaded);
        if (isTauri()) {
          getAutostartEnabled().then((enabled) => {
            setAutostart(enabled);
            setSavedAutostart(enabled);
          });
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  const hasUnsavedChanges = useMemo(
    () =>
      (settings !== null &&
        savedSettings !== null &&
        JSON.stringify(settings) !== JSON.stringify(savedSettings)) ||
      (autostart !== null &&
        savedAutostart !== null &&
        autostart !== savedAutostart),
    [autostart, savedAutostart, settings, savedSettings],
  );

  const warnUnsavedChanges = useCallback(() => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setShakeSaveBar(false);
    requestAnimationFrame(() => {
      setShakeSaveBar(true);
      shakeTimerRef.current = setTimeout(() => {
        setShakeSaveBar(false);
        shakeTimerRef.current = null;
      }, 450);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  async function handleTest() {
    if (!settings) return;
    setTesting(true);
    const result = pickRandomZekrForTest(
      settings.category,
      settings.notificationTextMode,
    );
    if (result) await sendAzkarNotification(result.title, result.text);
    setTimeout(() => setTesting(false), 2000);
  }

  function update(patch: Partial<NotificationSettings>) {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
  }

  async function handleSave() {
    if (!settings) return;
    saveSettings(settings);
    setSavedSettings(settings);
    if (isTauri() && autostart !== null && autostart !== savedAutostart) {
      await setAutostartEnabled(autostart);
      setSavedAutostart(autostart);
    }
    if (settings.enabled) await restartScheduler();
    else await stopScheduler();
  }

  function handleDiscard() {
    if (!savedSettings) return;
    setSettings(savedSettings);
    setAutostart(savedAutostart);
  }

  function handleBack() {
    if (hasUnsavedChanges) {
      warnUnsavedChanges();
      return;
    }

    router.push(localizedPath(locale, "/azkar/"));
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
          <h1 className="text-xl font-black tracking-tight">{t("title")}</h1>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleBack}
          className="rounded-xl bg-white/5 border border-accent/20 focus-visible:ring-accent/20 focus-visible:border-accent text-muted-foreground hover:text-accent transition-all"
        >
          <BackIcon className="w-5 h-5" />
        </Button>
      </header>

      {hasUnsavedChanges && (
        <div className="fixed top-20 left-4 right-4 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-300">
          <div
            className={cn(
              "mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-xl border border-primary/40 bg-popover/95 p-3 text-popover-foreground backdrop-blur-xl pointer-events-auto",
              shakeSaveBar && "animate-unsaved-shake",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_16px_rgba(34,197,94,0.8)]" />
              <div className="min-w-0">
                <p className="text-sm font-black text-foreground">
                  {t("unsavedTitle")}
                </p>
                <p className="text-[11px] font-bold text-muted-foreground">
                  {t("unsavedText")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleDiscard}
                className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-muted-foreground hover:bg-white/10"
              >
                <X className="h-4 w-4" />
                {common("discard")}
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="h-9 rounded-lg px-4 text-xs font-black shadow-[0_0_24px_rgba(34,197,94,0.25)]"
              >
                <Check className="h-4 w-4" />
                {common("save")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Tabs defaultValue="general" className="gap-4">
            <TabsList className="grid h-auto! min-h-11 w-full grid-cols-4 rounded-xl border border-white/10 bg-white/5 p-1">
              <TabsTrigger
                value="general"
                className="min-w-0 gap-1 rounded-lg px-1 text-[11px] sm:gap-1.5 sm:px-2 sm:text-xs md:text-sm"
              >
                <Settings className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                {t("general")}
              </TabsTrigger>
              <TabsTrigger
                value="prayer"
                className="min-w-0 gap-1 rounded-lg px-1 text-[11px] sm:gap-1.5 sm:px-2 sm:text-xs md:text-sm"
              >
                <Bell className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                {t("prayer")}
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="min-w-0 gap-1 rounded-lg px-1 text-[11px] sm:gap-1.5 sm:px-2 sm:text-xs md:text-sm"
              >
                <Palette className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                {t("appearance")}
              </TabsTrigger>
              <TabsTrigger
                value="maintenance"
                className="min-w-0 gap-1 rounded-lg px-1 text-[11px] sm:gap-1.5 sm:px-2 sm:text-xs md:text-sm"
              >
                <Wrench className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                {t("maintenance")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="grid gap-4">
              <GeneralSettings
                settings={settings}
                update={update}
                coords={coords}
                onUpdateCoords={setCoords}
                autostart={autostart}
                updateAutostart={setAutostart}
              />
            </TabsContent>

            <TabsContent value="prayer" className="grid gap-4">
              {settings.enabled && settings.usePrayerTimes ? (
                <PrayerSettings
                  settings={settings}
                  update={update}
                  coords={coords}
                  onUpdateCoords={setCoords}
                />
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <SlidersHorizontal className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">
                        {t("prayerDisabledTitle")}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("prayerDisabledText")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="appearance" className="grid gap-4">
              {settings.enabled ? (
                <>
                  <AppearanceSettings settings={settings} update={update} />
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
                        {t("testSent")}
                        <Check className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <Bell className="w-5 h-5" />
                        {t("testNow")}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Palette className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">
                        {t("appearanceDisabledTitle")}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("appearanceDisabledText")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="maintenance" className="grid gap-4">
              <div className="grid gap-4">
                {isTauri() && <AppUpdateCard />}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
