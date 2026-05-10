"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
                    عرض المواقيت
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl gap-3">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-black">
                      مواقيت الصلاة اليوم
                    </DialogTitle>
                    <DialogDescription>
                      المواقيت محسوبة حسب الإعدادات الحالية والموقع المحفوظ.
                    </DialogDescription>
                  </DialogHeader>

                  {hasTrustedLocation && currentPrayerTimes ? (
                    <div className="grid gap-3">
                      {nextPrayer && (
                        <div className="rounded-xl border border-orange-500/25 bg-orange-500/10 p-4">
                          <div className="grid gap-4">
                            <div>
                              <p className="text-xs font-bold text-orange-300">
                                الصلاة القادمة
                              </p>
                              <h4 className="mt-1 text-2xl font-black text-orange-50">
                                {nextPrayer.label}
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
                              الصلاة الحالية
                            </p>
                            <p className="text-sm font-bold">
                              {currentPrayer.label}
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
                                    {prayer.label}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {isNext
                                      ? "قادمة"
                                      : isPassed
                                        ? "انتهت"
                                        : "لاحقا"}
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
                      لعرض مواقيت دقيقة، فعّل الموقع واضغط تحديث. لن نعرض مواقيت
                      تقريبية حتى لا تظهر معلومات غير دقيقة.
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold">
                          {coords?.source === "gps"
                            ? "الموقع الحالي"
                            : "موقع تقريبي"}
                        </p>
                        <p className="text-[11px] text-muted-foreground tabular-nums truncate">
                          {coords?.label ??
                            (coords
                              ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`
                              : "لا يوجد موقع محفوظ")}
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
                      تحديث
                    </button>
                  </div>

                  {locationError && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs leading-6 text-red-200">
                      {locationError === "denied" &&
                        "تم رفض إذن الموقع. فعّل إذن الموقع للتطبيق من إعدادات النظام ثم اضغط تحديث."}
                      {locationError === "unsupported" &&
                        "الموقع غير متاح داخل هذه البيئة. جرّب تشغيل التطبيق من المتصفح أو فعّل خدمات الموقع للنظام."}
                      {locationError === "unavailable" &&
                        "تعذر تحديد الموقع الحالي. تأكد من تشغيل خدمات الموقع ثم اضغط تحديث مرة أخرى."}
                      {locationError === "timeout" &&
                        "استغرق تحديد الموقع وقتا طويلا. تأكد من اتصال الجهاز وخدمات الموقع ثم حاول مرة أخرى."}
                      {locationError === "unknown" &&
                        "تعذر طلب الموقع لسبب غير معروف. تأكد من صلاحيات الموقع ثم حاول مرة أخرى."}
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
                    <h4 className="text-sm font-bold">تنبيهات الصلاة</h4>
                    <p className="text-xs text-muted-foreground">
                      تذكير قبل الصلاة وعند دخول وقتها
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    updatePrayerReminders({
                      enabled: !prayerReminders.enabled,
                    })
                  }
                  className={cn(
                    "relative w-12 h-7 rounded-full transition-all duration-300 p-1 shrink-0",
                    prayerReminders.enabled
                      ? "bg-primary"
                      : "bg-white/10 border border-white/10",
                  )}
                >
                  <span
                    className={cn(
                      "block w-5 h-5 rounded-full bg-white transition-transform duration-300",
                      prayerReminders.enabled
                        ? "translate-x-0"
                        : "-translate-x-5",
                    )}
                  />
                </button>
              </div>

              {prayerReminders.enabled && (
                <div className="grid gap-3 animate-in fade-in zoom-in-95 duration-300">
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold">
                          تذكير عند دخول الوقت
                        </p>
                        <p className="text-xs text-muted-foreground">
                          يظهر تنبيه مباشر عند بداية الصلاة
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updatePrayerReminders({
                            notifyAtTime: !prayerReminders.notifyAtTime,
                          })
                        }
                        className={cn(
                          "relative w-12 h-7 rounded-full transition-all duration-300 p-1 shrink-0",
                          prayerReminders.notifyAtTime
                            ? "bg-primary"
                            : "bg-white/10 border border-white/10",
                        )}
                      >
                        <span
                          className={cn(
                            "block w-5 h-5 rounded-full bg-white transition-transform duration-300",
                            prayerReminders.notifyAtTime
                              ? "translate-x-0"
                              : "-translate-x-5",
                          )}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold">التذكير قبل الصلاة</p>
                        <p className="text-xs text-muted-foreground">
                          اختر كم دقيقة قبل الصلاة تريد التنبيه
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updatePrayerReminders({
                            beforeMinutes:
                              beforeMinutes > 0
                                ? 0
                                : DEFAULT_SETTINGS.prayerReminders
                                    .beforeMinutes,
                          })
                        }
                        className={cn(
                          "relative w-12 h-7 rounded-full transition-all duration-300 p-1 shrink-0",
                          beforeMinutes > 0
                            ? "bg-primary"
                            : "bg-white/10 border border-white/10",
                        )}
                      >
                        <span
                          className={cn(
                            "block w-5 h-5 rounded-full bg-white transition-transform duration-300",
                            beforeMinutes > 0
                              ? "translate-x-0"
                              : "-translate-x-5",
                          )}
                        />
                      </button>
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
                        التوقيت الحالي: قبل الصلاة بـ {beforeMinutes} دقائق
                      </p>
                    )}
                  </div>
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold">
                          إعادة التذكير حتى الصلاة التالية
                        </p>
                        <p className="text-xs text-muted-foreground">
                          يعاد التنبيه كل عدة دقائق إذا لم تصل للصلاة بعد
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updatePrayerReminders({
                            repeatUntilNextPrayer:
                              !prayerReminders.repeatUntilNextPrayer,
                          })
                        }
                        className={cn(
                          "relative w-12 h-7 rounded-full transition-all duration-300 p-1 shrink-0",
                          prayerReminders.repeatUntilNextPrayer
                            ? "bg-primary"
                            : "bg-white/10 border border-white/10",
                        )}
                      >
                        <span
                          className={cn(
                            "block w-5 h-5 rounded-full bg-white transition-transform duration-300",
                            prayerReminders.repeatUntilNextPrayer
                              ? "translate-x-0"
                              : "-translate-x-5",
                          )}
                        />
                      </button>
                    </div>

                    {prayerReminders.repeatUntilNextPrayer && (
                      <div className="grid gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground">
                            كل كم دقيقة؟
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            الحد الأدنى 5 دقائق
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
                <Field label="طريقة الحساب">
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

                <Field label="المذهب الفقهي">
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

              <Field label="وضع خطوط العرض العالية">
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
                  تعديل مواقيت الصلاة
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {prayerNames.map((prayer) => (
                    <Field key={prayer.value} label={prayer.label}>
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
                          دقيقة
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
