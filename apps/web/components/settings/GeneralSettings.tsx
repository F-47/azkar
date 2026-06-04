"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  BookOpenText,
  BookType,
  Clock,
  Languages,
  Loader2,
  Moon,
  Power,
  RefreshCw,
  Sparkles,
  Sun,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MIN_NOTIFICATION_INTERVAL_MINUTES,
  normalizeNotificationIntervalMinutes,
  type NotificationTextMode,
  type NotificationSettings,
} from "@/lib/notificationScheduler";
import { requestCoords, saveCoords, type SavedCoords } from "@/lib/prayerTimes";
import { isTauri } from "@/lib/tauri";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function GeneralSettings({
  settings,
  update,
  coords,
  onUpdateCoords,
  autostart,
  updateAutostart,
}: {
  settings: NotificationSettings;
  update: (patch: Partial<NotificationSettings>) => void;
  coords: SavedCoords | null;
  onUpdateCoords: (c: SavedCoords) => void;
  autostart: boolean | null;
  updateAutostart: (next: boolean) => void;
}) {
  const [locating, setLocating] = useState(false);
  const t = useTranslations("general");
  const common = useTranslations("common");
  const language = useTranslations("language");

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
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">{language("label")}</h3>
            </div>
          </div>
          <LanguageSwitcher className="w-40 shrink-0" />
        </div>
      </Card>

      <SettingCard
        icon={<BookOpenText className="w-5 h-5" />}
        iconClassName="bg-violet-500/10 text-violet-400"
        title={t("showTransliteration")}
        description={t("showTransliterationDesc")}
        enabled={settings.showTransliteration}
        onToggle={() =>
          update({ showTransliteration: !settings.showTransliteration })
        }
      />

      <SettingCard
        icon={<Bell className="w-5 h-5" />}
        iconClassName="bg-primary/10 text-primary"
        title={t("notificationsTitle")}
        description={t("notificationsDesc")}
        enabled={settings.enabled}
        onToggle={() => update({ enabled: !settings.enabled })}
      />

      {isTauri() && autostart !== null && (
        <SettingCard
          icon={<Power className="w-5 h-5" />}
          iconClassName="bg-red-500/10 text-red-500"
          title={t("autostartTitle")}
          description={t("autostartDesc")}
          enabled={autostart}
          onToggle={() => updateAutostart(!autostart)}
        />
      )}

      {settings.enabled && (
        <div className="grid gap-4 animate-in fade-in zoom-in-95 duration-500">
          <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <BookType className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {t("notificationText")}
                  </h3>
                  <p className="text-sm text-muted-foreground/70 mt-0.5">
                    {t("notificationTextDesc")}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {(["arabic", "transliteration"] as NotificationTextMode[]).map(
                  (mode) => {
                    const active = settings.notificationTextMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => update({ notificationTextMode: mode })}
                        className={cn(
                          "rounded-lg border px-4 py-3 text-sm font-bold transition-all active:scale-[0.98]",
                          active
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
                        )}
                      >
                        {t(
                          mode === "arabic"
                            ? "notificationTextArabic"
                            : "notificationTextTransliteration",
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </Card>

          <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold">{t("interval")}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={MIN_NOTIFICATION_INTERVAL_MINUTES}
                  value={settings.intervalMinutes}
                  onChange={(e) =>
                    update({
                      intervalMinutes: normalizeNotificationIntervalMinutes(
                        Number(e.target.value),
                      ),
                    })
                  }
                  className="w-12 py-4 rounded-lg bg-white/5 border border-white/10 text-center text-lg font-black tabular-nums focus:outline-none focus:border-primary transition-all"
                />
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {common("minute")}
                </span>
              </div>
            </div>
          </Card>

          <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{t("duration")}</h3>
                  <p className="text-sm text-muted-foreground/70 mt-0.5">
                    {t("durationDesc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={settings.durationFactor}
                  onChange={(e) =>
                    update({
                      durationFactor: Math.max(
                        0.5,
                        Math.min(5, Number(e.target.value)),
                      ),
                    })
                  }
                  className="w-12 py-4 rounded-lg bg-white/5 border border-white/10 text-center text-lg font-black tabular-nums focus:outline-none focus:border-primary transition-all"
                />
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {t("durationUnit")}
                </span>
              </div>
            </div>
          </Card>

          <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{t("usePrayerTimes")}</h3>
                  <p className="text-sm text-muted-foreground/70 mt-0.5">
                    {t("usePrayerTimesDesc")}
                  </p>
                  {coords && (
                    <p className="text-xs font-medium text-teal-500/80 mt-0.5">
                      {coords.source === "gps"
                        ? t("gpsLocation")
                        : t("timezoneLocation")}
                    </p>
                  )}
                </div>
              </div>
              {locating ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <Switch
                  checked={settings.usePrayerTimes}
                  onCheckedChange={handleTogglePrayerTimes}
                />
              )}
            </div>
          </Card>

          {!settings.usePrayerTimes && (
            <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold">{t("category")}</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: common("morning"),
                    value: "morning",
                    icon: Sun,
                    color: "text-amber-500",
                  },
                  {
                    label: common("evening"),
                    value: "evening",
                    icon: Moon,
                    color: "text-blue-400",
                  },
                  {
                    label: common("all"),
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
                      <span className="text-xs uppercase tracking-widest">
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

function SettingCard({
  icon,
  iconClassName,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              iconClassName,
            )}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-base">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
    </Card>
  );
}
