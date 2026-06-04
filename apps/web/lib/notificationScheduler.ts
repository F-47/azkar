import { getNotificationAzkars } from "@/lib/azkarStore";
import {
  DEFAULT_PRAYER_SETTINGS,
  getPrayerTimesForDate,
  getTodayPrayerTimes,
  getTodayPrayerWindows,
  loadCoords,
  normalizePrayerSettings,
  type PrayerName,
  type PrayerCalculationSettings,
} from "@/lib/prayerTimes";
import type { Category, Zekr } from "@/types";
import { plainT } from "@/lib/i18n/plainMessages";
import { getSavedLocale } from "@/lib/i18n/locale";
import { isTauri, sendAzkarNotification } from "./tauri";

const SETTINGS_KEY = "azkar-notification-settings";
const PRAYER_REMINDER_LOG_KEY = "azkar-prayer-reminder-log";
export const MIN_NOTIFICATION_INTERVAL_MINUTES = 1;
const DEFAULT_PRAYER_BEFORE_MINUTES = 15;
const DEFAULT_PRAYER_REPEAT_MINUTES = 15;
const PRAYER_REPEAT_MINUTE_OPTIONS = [5, 10, 15, 30, 60] as const;
const PRAYER_AZKAR_GAP_MS = 10 * 1000;

interface TimeWindow {
  start: string;
  end: string;
}

export interface NotificationAppearance {
  headerBgColor: string;
  backgroundColor: string;
  textColor: string;
  opacity: number;
}

export interface PrayerReminderSettings {
  enabled: boolean;
  beforeMinutes: number;
  notifyAtTime: boolean;
  repeatUntilNextPrayer: boolean;
  repeatMinutes: number;
}

export type NotificationTextMode = "arabic" | "transliteration";

export interface NotificationSettings {
  enabled: boolean;
  showTransliteration: boolean;
  notificationTextMode: NotificationTextMode;
  intervalMinutes: number;
  category: Category | "both";
  usePrayerTimes: boolean;
  prayerTimes: PrayerCalculationSettings;
  prayerReminders: PrayerReminderSettings;
  appearance: NotificationAppearance;
  durationFactor: number;
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  showTransliteration: true,
  notificationTextMode: "arabic",
  intervalMinutes: 5,
  category: "both",
  usePrayerTimes: true,
  prayerTimes: DEFAULT_PRAYER_SETTINGS,
  prayerReminders: {
    enabled: true,
    beforeMinutes: DEFAULT_PRAYER_BEFORE_MINUTES,
    notifyAtTime: true,
    repeatUntilNextPrayer: true,
    repeatMinutes: DEFAULT_PRAYER_REPEAT_MINUTES,
  },
  appearance: {
    headerBgColor: "#064e3b",
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
    opacity: 100,
  },
  durationFactor: 1.0,
};

const FALLBACK_PRAYER_WINDOWS = {
  morning: { start: "04:30", end: "11:59" },
  evening: { start: "15:30", end: "04:29" },
};

function getPrayerWindows(): { morning: TimeWindow; evening: TimeWindow } {
  const coords = loadCoords();
  if (!coords) return FALLBACK_PRAYER_WINDOWS;

  const settings = loadSettings();
  const times = getTodayPrayerWindows(coords, settings.prayerTimes);
  if (!times) return FALLBACK_PRAYER_WINDOWS;

  const [fh, fm] = times.fajr.split(":").map(Number);
  const [ah, am] = times.asr.split(":").map(Number);

  const asrMinus1 =
    am === 0
      ? `${String(ah - 1).padStart(2, "0")}:59`
      : `${String(ah).padStart(2, "0")}:${String(am - 1).padStart(2, "0")}`;
  const fajrMinus1 =
    fm === 0
      ? `${String(fh === 0 ? 23 : fh - 1).padStart(2, "0")}:59`
      : `${String(fh).padStart(2, "0")}:${String(fm - 1).padStart(2, "0")}`;

  return {
    morning: { start: times.fajr, end: asrMinus1 },
    evening: { start: times.asr, end: fajrMinus1 },
  };
}

function normalizePrayerRepeatMinutes(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PRAYER_REPEAT_MINUTES;

  return PRAYER_REPEAT_MINUTE_OPTIONS.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

function normalizeNotificationTextMode(
  value: unknown,
): NotificationTextMode {
  return value === "transliteration" ? "transliteration" : "arabic";
}

export function normalizeNotificationIntervalMinutes(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.intervalMinutes;

  return Math.max(MIN_NOTIFICATION_INTERVAL_MINUTES, Math.round(value));
}

export function loadSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored) as Partial<NotificationSettings>;
    const prayerReminders = {
      ...DEFAULT_SETTINGS.prayerReminders,
      ...parsed.prayerReminders,
    };
    prayerReminders.beforeMinutes = Number.isFinite(
      prayerReminders.beforeMinutes,
    )
      ? prayerReminders.beforeMinutes
      : DEFAULT_SETTINGS.prayerReminders.beforeMinutes;
    prayerReminders.repeatMinutes = normalizePrayerRepeatMinutes(
      prayerReminders.repeatMinutes,
    );

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      notificationTextMode: normalizeNotificationTextMode(
        parsed.notificationTextMode,
      ),
      intervalMinutes: normalizeNotificationIntervalMinutes(
        parsed.intervalMinutes ?? DEFAULT_SETTINGS.intervalMinutes,
      ),
      prayerTimes: normalizePrayerSettings(parsed.prayerTimes),
      prayerReminders,
      appearance: {
        ...DEFAULT_SETTINGS.appearance,
        ...parsed.appearance,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      ...settings,
      intervalMinutes: normalizeNotificationIntervalMinutes(
        settings.intervalMinutes,
      ),
    }),
  );
}

function isInWindow(window: TimeWindow): boolean {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = window.start.split(":").map(Number);
  const [eh, em] = window.end.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;

  return start <= end ? cur >= start && cur <= end : cur >= start || cur <= end;
}

function getEffectiveCategory(
  settings: NotificationSettings,
): Category | "both" | null {
  if (!settings.usePrayerTimes) return settings.category;

  const windows = getPrayerWindows();
  const inMorning = isInWindow(windows.morning);
  const inEvening = isInWindow(windows.evening);

  if (inMorning) return "morning";
  if (inEvening) return "evening";
  return null;
}

const QUEUE_KEY = "azkar-shuffled-queue";

function getEligibleNotificationAzkars(
  category: Category | "both",
  mode: NotificationTextMode,
): Zekr[] {
  const azkars = getNotificationAzkars(category);
  if (mode === "arabic") return azkars;
  return azkars.filter((zekr) => !!zekr.transliteration?.trim());
}

function getNextFromQueue(
  category: Category | "both",
  mode: NotificationTextMode,
): Zekr | null {
  const pool = getEligibleNotificationAzkars(category, mode);
  if (!pool.length) return null;

  if (typeof window === "undefined") return pool[0];

  const stored = localStorage.getItem(QUEUE_KEY);
  const queues: Record<string, number[]> = stored ? JSON.parse(stored) : {};

  const queueKey = `${category}:${mode}`;
  let queue = queues[queueKey] || [];

  // Filter queue to only include IDs currently in the pool (in case settings changed)
  const poolIds = new Set(pool.map((z) => z.id));
  queue = queue.filter((id) => poolIds.has(id));

  if (queue.length === 0) {
    // Rebuild in original list order (no shuffling)
    queue = pool.map((z) => z.id);
  }

  const id = queue.shift()!;
  queues[queueKey] = queue;

  localStorage.setItem(QUEUE_KEY, JSON.stringify(queues));

  return pool.find((z) => z.id === id) || pool[0];
}

function pickRandomZekr(
  category: Category | "both",
  mode: NotificationTextMode,
) {
  return getNextFromQueue(category, mode);
}

function categoryTitle(category: Category | "both"): string {
  if (category === "morning") return plainT("notifications.morning");
  if (category === "evening") return plainT("notifications.evening");
  if (category === "both") return plainT("notifications.azkar");
  if (category === "morning") return "أذكار الصباح";
  if (category === "evening") return "أذكار المساء";
  return "أذكار";
}

export function pickRandomZekrForTest(
  category: Category | "both",
  mode: NotificationTextMode,
): { title: string; text: string } | null {
  const zekr = pickRandomZekr(category, mode);
  if (!zekr) return null;
  return {
    title: categoryTitle(zekr.category),
    text: getNotificationBody(zekr, mode),
  };
}

function formatForNotification(text: string): string {
  return text.trim();
}

function getNotificationBody(
  zekr: Zekr,
  mode: NotificationTextMode,
): string {
  const text = mode === "transliteration" ? zekr.transliteration : zekr.text;
  return formatForNotification(text ?? "");
}

const reminderPrayers: Array<{
  value: Exclude<PrayerName, "sunrise">;
}> = [
  { value: "fajr" },
  { value: "dhuhr" },
  { value: "asr" },
  { value: "maghrib" },
  { value: "isha" },
];

function parseTodayTime(time: string): Date {
  return parseTimeOnDate(time, new Date());
}

function parseTimeOnDate(time: string, baseDate: Date): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function loadPrayerReminderLog(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(PRAYER_REMINDER_LOG_KEY);
    return stored ? (JSON.parse(stored) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function savePrayerReminderLog(log: Record<string, number>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRAYER_REMINDER_LOG_KEY, JSON.stringify(log));
}

function reminderLogKey(prayer: string, type: string): string {
  return `${dateKey()}:${prayer}:${type}`;
}

export function markPrayerAsPrayed(prayer: string): void {
  const log = loadPrayerReminderLog();
  log[reminderLogKey(prayer, "prayed")] = Date.now();
  savePrayerReminderLog(log);
}

function formatCount(count: number, unit: "Hour" | "Minute"): string {
  const locale = getSavedLocale();
  const singularKey = `notifications.${unit.toLowerCase()}`;
  const pluralKey = `notifications.${unit.toLowerCase()}s`;

  if (locale === "ar") {
    if (count === 1) return plainT(singularKey);
    if (count === 2) return plainT(`notifications.two${unit}s`);

    const formattedCount = new Intl.NumberFormat(locale).format(count);
    if (count >= 3 && count <= 10) {
      return plainT(pluralKey, { count: formattedCount });
    }
    return `${formattedCount} ${plainT(singularKey)}`;
  }

  const formattedCount = new Intl.NumberFormat(locale).format(count);
  return plainT(count === 1 ? singularKey : pluralKey, {
    count: formattedCount,
  });
}

function formatHourCount(hours: number): string {
  return formatCount(hours, "Hour");
}

function formatMinuteCount(minutes: number): string {
  return formatCount(minutes, "Minute");
}

function formatRemainingPrayerTime(ms: number): string {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourText = formatHourCount(hours);

  if (hours <= 0) return formatMinuteCount(totalMinutes);
  if (minutes === 0) return hourText;
  return new Intl.ListFormat(getSavedLocale(), {
    style: "long",
    type: "conjunction",
  }).format([hourText, formatMinuteCount(minutes)]);
}

async function maybeSendPrayerReminders(
  settings: NotificationSettings,
): Promise<boolean> {
  const reminderSettings = settings.prayerReminders;
  if (!reminderSettings.enabled) return false;

  const coords = loadCoords();
  if (!coords || coords.source !== "gps") return false;

  const times = getTodayPrayerTimes(coords, settings.prayerTimes);
  if (!times) return false;

  const now = new Date();
  const nowMs = now.getTime();
  const yesterday = addDays(now, -1);
  const tomorrow = addDays(now, 1);
  const yesterdayTimes = getPrayerTimesForDate(
    coords,
    yesterday,
    settings.prayerTimes,
  );
  const tomorrowTimes = getPrayerTimesForDate(
    coords,
    tomorrow,
    settings.prayerTimes,
  );
  const schedule = reminderPrayers.map((prayer) => ({
    ...prayer,
    date: parseTodayTime(times[prayer.value]),
  }));
  const ishaPrayer = reminderPrayers.find((prayer) => prayer.value === "isha");

  if (yesterdayTimes && ishaPrayer) {
    schedule.unshift({
      ...ishaPrayer,
      date: parseTimeOnDate(yesterdayTimes.isha, yesterday),
    });
  }

  const log = loadPrayerReminderLog();
  let changed = false;
  let sentNotification = false;

  for (let index = 0; index < schedule.length; index++) {
    const prayer = schedule[index];
    const nextPrayer = schedule[index + 1];
    const prayerMs = prayer.date.getTime();
    const nextPrayerMs =
      nextPrayer?.date.getTime() ??
      (tomorrowTimes
        ? parseTimeOnDate(tomorrowTimes.fajr, tomorrow).getTime()
        : prayerMs + 10 * 60 * 60 * 1000);
    const beforeMs = prayerMs - reminderSettings.beforeMinutes * 60 * 1000;
    const beforeKey = reminderLogKey(prayer.value, "before");
    const atKey = reminderLogKey(prayer.value, "at");
    const repeatKey = reminderLogKey(prayer.value, "repeat");
    const prayedKey = reminderLogKey(prayer.value, "prayed");

    if (
      reminderSettings.beforeMinutes > 0 &&
      nowMs >= beforeMs &&
      nowMs < prayerMs &&
      !log[beforeKey]
    ) {
      const prayerName = plainT(`prayer.names.${prayer.value}`);
      await sendAzkarNotification(
        plainT("notifications.prayerBeforeTitle", { prayer: prayerName }),
        plainT("notifications.prayerBeforeBody", {
          duration: formatMinuteCount(reminderSettings.beforeMinutes),
        }),
        undefined,
        "prayer",
      );
      log[beforeKey] = nowMs;
      changed = true;
      sentNotification = true;
      continue;
    }

    if (
      reminderSettings.notifyAtTime &&
      nowMs >= prayerMs &&
      nowMs < prayerMs + 60 * 1000 &&
      !log[atKey]
    ) {
      const prayerName = plainT(`prayer.names.${prayer.value}`);
      await sendAzkarNotification(
        plainT("notifications.prayerAtTitle", { prayer: prayerName }),
        plainT("notifications.prayerAtBody"),
        undefined,
        "prayer",
      );
      log[atKey] = nowMs;
      changed = true;
      sentNotification = true;
      continue;
    }

    if (
      reminderSettings.repeatUntilNextPrayer &&
      nowMs >= prayerMs + reminderSettings.repeatMinutes * 60 * 1000 &&
      nowMs < nextPrayerMs &&
      !log[prayedKey]
    ) {
      const lastRepeat = log[repeatKey] ?? prayerMs;
      if (nowMs - lastRepeat >= reminderSettings.repeatMinutes * 60 * 1000) {
        const remainingText = formatRemainingPrayerTime(nextPrayerMs - nowMs);
        const prayerName = plainT(`prayer.names.${prayer.value}`);
        await sendAzkarNotification(
          plainT("notifications.prayerRepeatTitle", { prayer: prayerName }),
          plainT("notifications.prayerRepeatBody", {
            duration: remainingText,
          }),
          {
            type: "markPrayerPrayed",
            label: plainT("notifications.markPrayed"),
            prayer: prayer.value,
          },
        );
        log[repeatKey] = nowMs;
        changed = true;
        sentNotification = true;
        continue;
      }
    }
  }

  if (changed) savePrayerReminderLog(log);
  return sentNotification;
}

async function configureRustScheduler(
  settings: NotificationSettings,
): Promise<void> {
  if (!isTauri()) return;
  try {
    const azkars = settings.enabled
      ? getEligibleNotificationAzkars(
          settings.category,
          settings.notificationTextMode,
        )
      : [];
    const texts = azkars.map((z) =>
      getNotificationBody(z, settings.notificationTextMode),
    );
    const titles = azkars.map((z) => categoryTitle(z.category));

    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("configure_scheduler", {
      settings: {
        enabled: settings.enabled,
        intervalMinutes: settings.intervalMinutes,
        texts,
        titles,
      },
    });
  } catch (e) {
    console.warn("Failed to configure Rust scheduler:", e);
  }
}

let timer: ReturnType<typeof setInterval> | null = null;
let prayerReminderTimer: ReturnType<typeof setInterval> | null = null;
let delayedAzkarTimer: ReturnType<typeof setTimeout> | null = null;
let lastPrayerNotificationAt = 0;

function stopJsTimer(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (prayerReminderTimer) {
    clearInterval(prayerReminderTimer);
    prayerReminderTimer = null;
  }
  if (delayedAzkarTimer) {
    clearTimeout(delayedAzkarTimer);
    delayedAzkarTimer = null;
  }
  lastPrayerNotificationAt = 0;
}

async function sendAzkarFromSettings(settings: NotificationSettings) {
  const effectiveCategory = getEffectiveCategory(settings);
  if (!effectiveCategory) return;
  const zekr = pickRandomZekr(
    effectiveCategory,
    settings.notificationTextMode,
  );
  if (!zekr) return;
  await sendAzkarNotification(
    categoryTitle(zekr.category),
    getNotificationBody(zekr, settings.notificationTextMode),
  );
}

function scheduleDelayedAzkar(delayMs = PRAYER_AZKAR_GAP_MS) {
  if (delayedAzkarTimer) return;
  delayedAzkarTimer = setTimeout(async () => {
    delayedAzkarTimer = null;
    const current = loadSettings();
    if (!current.enabled) return;

    const elapsedSincePrayer = Date.now() - lastPrayerNotificationAt;
    if (elapsedSincePrayer < PRAYER_AZKAR_GAP_MS) {
      scheduleDelayedAzkar(PRAYER_AZKAR_GAP_MS - elapsedSincePrayer);
      return;
    }

    await sendAzkarFromSettings(current);
  }, delayMs);
}

function startJsTimer(settings: NotificationSettings): void {
  stopJsTimer();
  if (!settings.enabled) return;

  if (settings.prayerReminders.enabled) {
    void maybeSendPrayerReminders(settings).then((sent) => {
      if (sent) lastPrayerNotificationAt = Date.now();
    });
    prayerReminderTimer = setInterval(async () => {
      const current = loadSettings();
      if (!current.enabled || !current.prayerReminders.enabled) return;
      const sent = await maybeSendPrayerReminders(current);
      if (sent) lastPrayerNotificationAt = Date.now();
    }, 30 * 1000);
  }

  timer = setInterval(
    async () => {
      const current = loadSettings();
      if (!current.enabled) {
        stopJsTimer();
        return;
      }

      const elapsedSincePrayer = Date.now() - lastPrayerNotificationAt;
      if (elapsedSincePrayer < PRAYER_AZKAR_GAP_MS) {
        scheduleDelayedAzkar(PRAYER_AZKAR_GAP_MS - elapsedSincePrayer);
        return;
      }

      await sendAzkarFromSettings(current);
    },
    settings.intervalMinutes * 60 * 1000,
  );
}

export async function startScheduler(): Promise<void> {
  stopJsTimer();
  const settings = loadSettings();

  if (settings.enabled && settings.usePrayerTimes) {
    const { loadCoords, requestCoords, saveCoords } =
      await import("./prayerTimes");
    const coords = loadCoords();
    if (!coords) {
      try {
        const c = await requestCoords();
        if (c) saveCoords(c);
      } catch (e) {
        console.warn("Failed to silently auto-fetch coordinates:", e);
      }
    }
  }

  if (isTauri() && !settings.usePrayerTimes) {
    await configureRustScheduler(settings);
  } else {
    startJsTimer(settings);
  }
}

export async function stopScheduler(): Promise<void> {
  stopJsTimer();
  if (isTauri()) {
    await configureRustScheduler({ ...DEFAULT_SETTINGS, enabled: false });
  }
}

export async function restartScheduler(): Promise<void> {
  await startScheduler();
}
