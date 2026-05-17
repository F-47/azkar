"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  type SavedCoords,
  type PrayerAdjustments,
  type PrayerCalculationSettings,
  type PrayerCalculationMethod,
  type PrayerHighLatitudeRule,
  type PrayerMadhab,
  type PrayerName,
} from "@/lib/prayerTimes";
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
import type React from "react";
import { useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  type NotificationSettings,
} from "@/lib/notificationScheduler";
import { openLocationSettings } from "@/lib/tauri";
import { type Language } from "@/i18n/locale";
import { useTranslations } from "next-intl";

const methodOptions: Array<{ value: PrayerCalculationMethod; label: string }> =
  [
    { value: "Egyptian", label: "الهيئة المصرية العامة للمساحة" },
    {
      value: "NorthAmerica",
      label: "ISNA - الجمعية الإسلامية لأمريكا الشمالية",
    },
    { value: "MuslimWorldLeague", label: "رابطة العالم الإسلامي" },
    { value: "Karachi", label: "جامعة العلوم الإسلامية بكراتشي" },
    { value: "UmmAlQura", label: "أم القرى" },
    { value: "Dubai", label: "دبي" },
    { value: "MoonsightingCommittee", label: "لجنة رؤية الهلال" },
    { value: "Kuwait", label: "الكويت" },
    { value: "Qatar", label: "قطر" },
    { value: "Singapore", label: "سنغافورة" },
    { value: "Tehran", label: "طهران" },
    { value: "Turkey", label: "تركيا" },
  ];

const madhabOptions: Array<{ value: PrayerMadhab; label: string }> = [
  { value: "shafi", label: "شافعي / مالكي / حنبلي" },
  { value: "hanafi", label: "حنفي" },
];

const highLatitudeOptions: Array<{
  value: PrayerHighLatitudeRule;
  label: string;
}> = [
  { value: "middleofthenight", label: "منتصف الليل" },
  { value: "seventhofthenight", label: "سُبع الليل" },
  { value: "twilightangle", label: "زاوية الشفق" },
];

const prayerNames: Array<{ value: PrayerName; label: string }> = [
  { value: "fajr", label: "الفجر" },
  { value: "sunrise", label: "الشروق" },
  { value: "dhuhr", label: "الظهر" },
  { value: "asr", label: "العصر" },
  { value: "maghrib", label: "المغرب" },
  { value: "isha", label: "العشاء" },
];

const englishPrayerNames: Record<PrayerName, string> = {
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

function getPrayerLabel(
  prayer: { value: PrayerName; label: string },
  language: Language,
) {
  return language === "en" ? englishPrayerNames[prayer.value] : prayer.label;
}

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
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] =
    useState<LocationRequestError | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const prayerTimes = settings.prayerTimes ?? DEFAULT_PRAYER_SETTINGS;
  const language = settings.language;
  const t = useTranslations();
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
    ? prayerNames.map((prayer) => ({
        ...prayer,
        time: currentPrayerTimes[prayer.value],
        date: parseTimeToDate(currentPrayerTimes[prayer.value], today),
      }))
    : [];
  const nextPrayerToday = prayerSchedule.find(
    (prayer) => prayer.date.getTime() > now,
  );
  const nextPrayer =
    nextPrayerToday ??
    (tomorrowPrayerTimes
      ? {
          ...prayerNames[0],
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
    await openLocationSettings();
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
                    {t("showPrayerTimes")}
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl gap-3">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-black">
                      {t("prayerTimes")}
                    </DialogTitle>
                    <DialogDescription>
                      {t("prayerTimesDescription")}
                    </DialogDescription>
                  </DialogHeader>

                  {hasTrustedLocation && currentPrayerTimes ? (
                    <div className="grid gap-3">
                      {nextPrayer && (
                        <div className="rounded-xl border border-orange-500/25 bg-orange-500/10 p-4">
                          <div className="grid gap-4">
                            <div>
                              <p className="text-xs font-bold text-orange-300">
                                {t("nextPrayer")}
                              </p>
                              <h4 className="mt-1 text-2xl font-black text-orange-50">
                                {getPrayerLabel(nextPrayer, language)}
                              </h4>
                            </div>
                            <div className="flex items-end justify-between gap-3">
                              <p className="text-3xl font-black tabular-nums leading-none text-orange-300 sm:text-4xl">
                                {formatCountdown(nextPrayer.date, now)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentPrayer && currentPrayer !== nextPrayer && (
                        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-primary/10 px-4 py-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {t("currentPrayer")}
                            </p>
                            <p className="text-sm font-bold">
                              {getPrayerLabel(currentPrayer, language)}
                            </p>
                          </div>
                          <span className="text-xs sm:text-lg font-black tabular-nums text-muted-foreground">
                            {currentPrayer.time}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {prayerSchedule.map((prayer) => {
                          const isPassed = prayer.date.getTime() <= now;
                          const isNext =
                            prayer.date.getTime() ===
                            nextPrayer?.date.getTime();
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
                                <span
                                  className={cn(
                                    "flex size-7 items-center justify-center rounded-full border",
                                    isNext
                                      ? "border-orange-500/40 bg-orange-500/10 text-orange-300"
                                      : isPassed
                                        ? "border-white/10 bg-primary/20 text-muted-foreground"
                                        : "border-white/10 bg-white/5 text-foreground",
                                  )}
                                >
                                  {isPassed && !isNext ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Clock3 className="w-4 h-4" />
                                  )}
                                </span>
                                <div>
                                  <span className="block text-sm font-bold">
                                    {getPrayerLabel(prayer, language)}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {isNext
                                      ? t("upcoming")
                                      : isPassed
                                        ? t("ended")
                                        : t("later")}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={cn(
                                  "text-xs sm:text-lg font-black tabular-nums",
                                  isNext ? "text-orange-300" : "text-current",
                                )}
                              >
                                {prayer.time}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                      {t("enableLocationForAccurateTimes")}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold">
                          {coords?.source === "gps"
                            ? t("currentLocation")
                            : t("approximateLocation")}
                        </p>
                        <p className="text-[11px] text-muted-foreground tabular-nums truncate">
                          {coords?.source === "gps"
                            ? "GPS"
                            : (coords?.label ??
                              (coords
                                ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`
                                : t("noSavedLocation")))}
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
                      <p>
                        {locationError === "denied" &&
                          t("locationDenied")}
                        {locationError === "unsupported" &&
                          t("locationUnsupported")}
                        {locationError === "unavailable" &&
                          t("locationUnavailable")}
                        {locationError === "timeout" &&
                          t("locationTimeout")}
                        {locationError === "unknown" &&
                          t("locationUnknown")}
                      </p>
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
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-green-400">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{t("prayerNotifications")}</h4>
                    <p className="text-xs text-muted-foreground">
                      {t("prayerNotificationsDescription")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={prayerReminders.enabled}
                  onCheckedChange={() =>
                    updatePrayerReminders({
                      enabled: !prayerReminders.enabled,
                    })
                  }
                />
              </div>

              {prayerReminders.enabled && (
                <div className="grid gap-3 animate-in fade-in zoom-in-95 duration-300">
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold">
                          {t("atPrayerTime")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("atPrayerTimeDescription")}
                        </p>
                      </div>
                      <Switch
                        type="button"
                        checked={prayerReminders.notifyAtTime}
                        onCheckedChange={() =>
                          updatePrayerReminders({
                            notifyAtTime: !prayerReminders.notifyAtTime,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold">{t("beforePrayer")}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("beforePrayerDescription")}
                        </p>
                      </div>
                      <Switch
                        type="button"
                        checked={beforeMinutes > 0}
                        onCheckedChange={() =>
                          updatePrayerReminders({
                            beforeMinutes:
                              beforeMinutes > 0
                                ? 0
                                : DEFAULT_SETTINGS.prayerReminders
                                    .beforeMinutes,
                          })
                        }
                      />
                    </div>

                    {beforeMinutes > 0 && (
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { value: 5, label: "5" },
                          { value: 10, label: "10" },
                          { value: 15, label: "15" },
                          { value: 30, label: "30" },
                          { value: 60, label: "60" },
                        ].map((option) => {
                          const active = beforeMinutes === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                updatePrayerReminders({
                                  beforeMinutes: option.value,
                                })
                              }
                              className={cn(
                                "h-10 rounded-lg border text-sm font-black tabular-nums transition-colors",
                                active
                                  ? "border-green-500/30 bg-primary/10 text-green-300"
                                  : "border-white/10 bg-white/5 text-muted-foreground",
                              )}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {beforeMinutes > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        {t("currentTiming", { minutes: beforeMinutes })}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold">
                          {t("repeatUntilNextPrayer")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("repeatUntilNextPrayerDescription")}
                        </p>
                      </div>
                      <Switch
                        type="button"
                        checked={prayerReminders.repeatUntilNextPrayer}
                        onCheckedChange={() =>
                          updatePrayerReminders({
                            repeatUntilNextPrayer:
                              !prayerReminders.repeatUntilNextPrayer,
                          })
                        }
                      />
                    </div>

                    {prayerReminders.repeatUntilNextPrayer && (
                      <div className="grid gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground">
                            {t("everyHowManyMinutes")}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {t("minimumFiveMinutes")}
                          </p>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {[5, 10, 15, 30, 60].map((option) => {
                            const active = repeatMinutes === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() =>
                                  updatePrayerReminders({
                                    repeatMinutes: option,
                                  })
                                }
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
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t("calculationMethod")}>
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
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label={t("highLatitudeRule")}>
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
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid gap-3">
                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase">
                  <Clock3 className="w-4 h-4 text-teal-500" />
                  {t("prayerAdjustments")}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {prayerNames.map((prayer) => (
                    <Field key={prayer.value} label={getPrayerLabel(prayer, language)}>
                      <div className="flex items-center justify-between gap-2 rounded-lg bg-white/5 border border-white/10 px-2">
                        <Input
                          type="number"
                          min={-60}
                          max={60}
                          value={prayerTimes.adjustments[prayer.value]}
                          onChange={(event) =>
                            updatePrayerTimes({
                              adjustments: {
                                [prayer.value]: Math.max(
                                  -60,
                                  Math.min(60, Number(event.target.value)),
                                ),
                              },
                            })
                          }
                          className="h-10 w-fit bg-transparent border-0 p-0 text-center text-sm font-black tabular-nums focus-visible:ring-0"
                        />
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {t("minute")}
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
