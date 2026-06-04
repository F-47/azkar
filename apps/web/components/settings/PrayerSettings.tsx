"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_PRAYER_SETTINGS,
  getPrayerTimesForDate,
  getTodayPrayerTimes,
  requestGpsCoords,
  saveCoords,
  type LocationRequestError,
  type PrayerAdjustments,
  type PrayerCalculationMethod,
  type PrayerCalculationSettings,
  type PrayerHighLatitudeRule,
  type PrayerMadhab,
  type PrayerName,
  type SavedCoords,
} from "@/lib/prayerTimes";
import {
  DEFAULT_SETTINGS,
  type NotificationSettings,
} from "@/lib/notificationScheduler";
import { openLocationSettings } from "@/lib/tauri";
import { cn } from "@/lib/utils";
import {
  BellRing,
  Check,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  RefreshCcw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";

const methodOptions: PrayerCalculationMethod[] = [
  "Egyptian",
  "NorthAmerica",
  "MuslimWorldLeague",
  "Karachi",
  "UmmAlQura",
  "Dubai",
  "MoonsightingCommittee",
  "Kuwait",
  "Qatar",
  "Singapore",
  "Tehran",
  "Turkey",
];

const madhabOptions: PrayerMadhab[] = ["shafi", "hanafi"];
const highLatitudeOptions: PrayerHighLatitudeRule[] = [
  "middleofthenight",
  "seventhofthenight",
  "twilightangle",
];
const prayerNames: PrayerName[] = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];
const reminderMinuteOptions = [5, 10, 15, 30, 60];

function parseTimeToDate(time: string, baseDate = new Date()) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatCountdown(target: Date, now: number) {
  const diffSeconds = Math.max(0, Math.floor((target.getTime() - now) / 1000));
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;
  return `-${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type PrayerSettingsPatch = Omit<
  Partial<PrayerCalculationSettings>,
  "adjustments"
> & {
  adjustments?: Partial<PrayerAdjustments>;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

export function PrayerSettings({
  settings,
  update,
  coords,
  onUpdateCoords,
}: {
  settings: NotificationSettings;
  update: (patch: Partial<NotificationSettings>) => void;
  coords: SavedCoords | null;
  onUpdateCoords: (coords: SavedCoords) => void;
}) {
  const t = useTranslations("prayer");
  const common = useTranslations("common");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] =
    useState<LocationRequestError | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const prayerTimes = settings.prayerTimes ?? DEFAULT_PRAYER_SETTINGS;
  const prayerReminders = {
    ...DEFAULT_SETTINGS.prayerReminders,
    ...settings.prayerReminders,
  };
  const beforeMinutes = Number.isFinite(prayerReminders.beforeMinutes)
    ? prayerReminders.beforeMinutes
    : DEFAULT_SETTINGS.prayerReminders.beforeMinutes;
  const repeatMinutes = Number.isFinite(prayerReminders.repeatMinutes)
    ? prayerReminders.repeatMinutes
    : DEFAULT_SETTINGS.prayerReminders.repeatMinutes;
  const hasTrustedLocation = coords?.source === "gps";
  const today = new Date(now);
  const tomorrow = addDays(today, 1);
  const currentPrayerTimes = hasTrustedLocation
    ? getTodayPrayerTimes(coords, prayerTimes)
    : null;
  const tomorrowPrayerTimes =
    hasTrustedLocation && coords
      ? getPrayerTimesForDate(coords, tomorrow, prayerTimes)
      : null;
  const prayerSchedule = currentPrayerTimes
    ? prayerNames.map((value) => ({
        value,
        label: t(`names.${value}`),
        time: currentPrayerTimes[value],
        date: parseTimeToDate(currentPrayerTimes[value], today),
      }))
    : [];
  const nextPrayerToday = prayerSchedule.find(
    (prayer) => prayer.date.getTime() > now,
  );
  const nextPrayer =
    nextPrayerToday ??
    (tomorrowPrayerTimes
      ? {
          value: "fajr" as const,
          label: t("names.fajr"),
          time: tomorrowPrayerTimes.fajr,
          date: parseTimeToDate(tomorrowPrayerTimes.fajr, tomorrow),
        }
      : null);
  const currentPrayer = [...prayerSchedule]
    .reverse()
    .find((prayer) => prayer.date.getTime() <= now);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleRefreshLocation() {
    setLocating(true);
    setLocationError(null);
    const result = await requestGpsCoords();
    if (result.coords) {
      saveCoords(result.coords);
      onUpdateCoords(result.coords);
    } else {
      setLocationError(result.error ?? "unknown");
    }
    setLocating(false);
  }

  async function handleOpenLocationSettings() {
    try {
      await openLocationSettings();
    } catch {
      setLocationError("unsupported");
    }
  }

  function updatePrayerTimes(patch: PrayerSettingsPatch) {
    update({
      prayerTimes: {
        ...DEFAULT_PRAYER_SETTINGS,
        ...prayerTimes,
        ...patch,
        adjustments: {
          ...DEFAULT_PRAYER_SETTINGS.adjustments,
          ...prayerTimes.adjustments,
          ...patch.adjustments,
        },
      },
    });
  }

  function updatePrayerReminders(
    patch: Partial<NotificationSettings["prayerReminders"]>,
  ) {
    update({
      prayerReminders: {
        ...prayerReminders,
        beforeMinutes,
        repeatMinutes,
        ...patch,
      },
    });
  }

  function resetPrayerSettings() {
    update({
      prayerTimes: {
        ...DEFAULT_PRAYER_SETTINGS,
        adjustments: { ...DEFAULT_PRAYER_SETTINGS.adjustments },
      },
      prayerReminders: { ...DEFAULT_SETTINGS.prayerReminders },
    });
  }

  return (
    <Card className="rounded-xl p-6 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10 grid gap-5">
        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <button className="h-11 rounded-lg bg-teal-500/10 border border-teal-500/20 text-sm font-bold text-teal-300 hover:bg-teal-500/15 transition-colors flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                {t("viewTimes")}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl gap-3">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">
                  {t("todayTimes")}
                </DialogTitle>
                <DialogDescription>{t("timesDesc")}</DialogDescription>
              </DialogHeader>

              {hasTrustedLocation && currentPrayerTimes ? (
                <div className="grid gap-3">
                  {nextPrayer && (
                    <div className="rounded-xl border border-orange-500/25 bg-orange-500/10 p-4">
                      <p className="text-xs font-bold text-orange-300">
                        {t("nextPrayer")}
                      </p>
                      <h4 className="mt-1 text-xl font-black text-orange-50">
                        {nextPrayer.label}
                      </h4>
                      <p className="mt-4 text-2xl font-black tabular-nums leading-none text-orange-300 sm:text-3xl">
                        {formatCountdown(nextPrayer.date, now)}
                      </p>
                    </div>
                  )}

                  {currentPrayer && currentPrayer !== nextPrayer && (
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-primary/10 px-4 py-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("currentPrayer")}
                        </p>
                        <p className="text-sm font-bold">
                          {currentPrayer.label}
                        </p>
                      </div>
                      <span className="text-sm sm:text-base font-black tabular-nums text-muted-foreground">
                        {currentPrayer.time}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {prayerSchedule.map((prayer) => {
                      const isPassed = prayer.date.getTime() <= now;
                      const isNext =
                        prayer.date.getTime() === nextPrayer?.date.getTime();
                      return (
                        <div
                          key={prayer.value}
                          className={cn(
                            "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                            isNext
                              ? "border-orange-500/30 bg-orange-500/10"
                              : isPassed
                                ? "border-white/5 bg-white/[0.025] text-muted-foreground"
                                : "border-white/10 bg-white/5",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex size-7 items-center justify-center rounded-full border border-white/10 bg-white/5">
                              {isPassed && !isNext ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Clock3 className="w-4 h-4" />
                              )}
                            </span>
                            <div>
                              <span className="block text-sm font-bold">
                                {prayer.label}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {isNext
                                  ? t("next")
                                  : isPassed
                                    ? t("passed")
                                    : t("later")}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm sm:text-base font-black tabular-nums">
                            {prayer.time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                  {t("accurateLocationNeeded")}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold">
                      {coords?.source === "gps"
                        ? t("currentLocation")
                        : t("approxLocation")}
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums truncate">
                      {coords?.source === "gps"
                        ? "GPS"
                        : (coords?.label ??
                          (coords
                            ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`
                            : t("noLocation")))}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRefreshLocation}
                  disabled={locating}
                  className="h-9 px-3 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-white hover:bg-primary/15 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  {locating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {t("refresh")}
                </button>
              </div>

              {locationError && (
                <div className="grid gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs leading-6 text-red-200">
                  <p>{t(locationError)}</p>
                  {locationError !== "timeout" && (
                    <button
                      type="button"
                      onClick={handleOpenLocationSettings}
                      className="h-9 w-fit rounded-lg border border-red-400/30 bg-red-400/10 px-3 text-xs font-bold text-red-100 transition-colors hover:bg-red-400/15"
                    >
                      {t("openLocationSettings")}
                    </button>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            className="rounded-xl bg-white/5 size-8 border border-white/10"
            size="sm"
            onClick={resetPrayerSettings}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-3">
            <ToggleRow
              title={t("remindersTitle")}
              description={t("remindersDesc")}
              enabled={prayerReminders.enabled}
              onToggle={() =>
                updatePrayerReminders({ enabled: !prayerReminders.enabled })
              }
              icon={<BellRing className="w-4 h-4" />}
            />

            {prayerReminders.enabled && (
              <div className="grid gap-3 animate-in fade-in zoom-in-95 duration-300">
                <ReminderToggle
                  title={t("notifyAtTime")}
                  description={t("notifyAtTimeDesc")}
                  enabled={prayerReminders.notifyAtTime}
                  onToggle={() =>
                    updatePrayerReminders({
                      notifyAtTime: !prayerReminders.notifyAtTime,
                    })
                  }
                />

                <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <ReminderToggle
                    title={t("beforePrayer")}
                    description={t("beforePrayerDesc")}
                    enabled={beforeMinutes > 0}
                    onToggle={() =>
                      updatePrayerReminders({
                        beforeMinutes:
                          beforeMinutes > 0
                            ? 0
                            : DEFAULT_SETTINGS.prayerReminders.beforeMinutes,
                      })
                    }
                    nested
                  />
                  {beforeMinutes > 0 && (
                    <>
                      <MinuteGrid
                        value={beforeMinutes}
                        onChange={(value) =>
                          updatePrayerReminders({ beforeMinutes: value })
                        }
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {t("currentTiming", { minutes: beforeMinutes })}
                      </p>
                    </>
                  )}
                </div>

                <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <ReminderToggle
                    title={t("repeatUntilNext")}
                    description={t("repeatUntilNextDesc")}
                    enabled={prayerReminders.repeatUntilNextPrayer}
                    onToggle={() =>
                      updatePrayerReminders({
                        repeatUntilNextPrayer:
                          !prayerReminders.repeatUntilNextPrayer,
                      })
                    }
                    nested
                  />
                  {prayerReminders.repeatUntilNextPrayer && (
                    <div className="grid gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground">
                          {t("everyHowMany")}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {t("minimumFive")}
                        </p>
                      </div>
                      <MinuteGrid
                        value={repeatMinutes}
                        onChange={(value) =>
                          updatePrayerReminders({ repeatMinutes: value })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t("method")}>
                <Select
                  value={prayerTimes.method}
                  onValueChange={(value) =>
                    updatePrayerTimes({
                      method: value as PrayerCalculationMethod,
                    })
                  }
                >
                  <SelectTrigger className="w-full rounded-lg bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {methodOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {t(`methods.${option}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label={t("madhab")}>
                <Select
                  value={prayerTimes.madhab}
                  onValueChange={(value) =>
                    updatePrayerTimes({ madhab: value as PrayerMadhab })
                  }
                >
                  <SelectTrigger className="w-full rounded-lg bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {madhabOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {t(`madhabs.${option}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label={t("highLatitude")}>
              <Select
                value={prayerTimes.highLatitudeRule}
                onValueChange={(value) =>
                  updatePrayerTimes({
                    highLatitudeRule: value as PrayerHighLatitudeRule,
                  })
                }
              >
                <SelectTrigger className="w-full rounded-lg bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {highLatitudeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t(`highLatitudes.${option}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase">
                <Clock3 className="w-4 h-4 text-teal-500" />
                {t("adjustments")}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {prayerNames.map((prayer) => (
                  <Field key={prayer} label={t(`names.${prayer}`)}>
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-white/5 border border-white/10 px-2">
                      <Input
                        type="number"
                        min={-60}
                        max={60}
                        value={prayerTimes.adjustments[prayer]}
                        onChange={(event) =>
                          updatePrayerTimes({
                            adjustments: {
                              [prayer]: Math.max(
                                -60,
                                Math.min(60, Number(event.target.value)),
                              ),
                            },
                          })
                        }
                        className="h-10 w-fit bg-transparent border-0 p-0 text-center text-sm font-black tabular-nums focus-visible:ring-0"
                      />
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {common("minute")}
                      </span>
                    </div>
                  </Field>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
  icon,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-green-400">
          {icon}
        </div>
        <div>
          <h4 className="text-base font-bold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <SwitchButton enabled={enabled} onClick={onToggle} />
    </div>
  );
}

function ReminderToggle({
  title,
  description,
  enabled,
  onToggle,
  nested = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  nested?: boolean;
}) {
  const content = (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-base font-bold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <SwitchButton enabled={enabled} onClick={onToggle} />
    </div>
  );

  if (nested) return content;
  return (
    <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      {content}
    </div>
  );
}

function SwitchButton({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return <Switch checked={enabled} onCheckedChange={onClick} />;
}

function MinuteGrid({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {reminderMinuteOptions.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "h-10 rounded-lg border text-sm font-black tabular-nums transition-colors",
              active
                ? "border-green-500/30 bg-primary/10 text-green-300"
                : "border-white/10 bg-white/5 text-muted-foreground",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
