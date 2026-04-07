import { getNotificationAzkars } from "@/lib/azkarStore";
import { getTodayPrayerWindows, loadCoords } from "@/lib/prayerTimes";
import type { Category } from "@/types";
import { isTauri, sendAzkarNotification } from "./tauri";

const SETTINGS_KEY = "azkar-notification-settings";

interface TimeWindow {
  start: string;
  end: string;
}

export interface NotificationSettings {
  enabled: boolean;
  intervalMinutes: number;
  category: Category | "both";
  usePrayerTimes: boolean;
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  intervalMinutes: 30,
  category: "both",
  usePrayerTimes: false,
};

const FALLBACK_PRAYER_WINDOWS = {
  morning: { start: "04:30", end: "11:59" },
  evening: { start: "15:30", end: "04:29" },
};

function getPrayerWindows(): { morning: TimeWindow; evening: TimeWindow } {
  const coords = loadCoords();
  if (!coords) return FALLBACK_PRAYER_WINDOWS;

  const times = getTodayPrayerWindows(coords);
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

export function loadSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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

  const { category } = settings;
  const windows = getPrayerWindows();
  const inMorning = isInWindow(windows.morning);
  const inEvening = isInWindow(windows.evening);

  if (category === "morning") return inMorning ? "morning" : null;
  if (category === "evening") return inEvening ? "evening" : null;

  if (inMorning) return "morning";
  if (inEvening) return "evening";
  return null;
}

function pickRandomZekr(category: Category | "both") {
  const all = getNotificationAzkars();
  const pool =
    category === "both" ? all : all.filter((z) => z.category === category);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickRandomZekrForTest(
  category: Category | "both",
): string | null {
  const zekr = pickRandomZekr(category);
  return zekr ? formatForNotification(zekr.text) : null;
}

function formatForNotification(text: string): string {
  return text.trim();
}

async function configureRustScheduler(
  settings: NotificationSettings,
): Promise<void> {
  if (!isTauri()) return;
  try {
    const texts = settings.enabled
      ? getNotificationAzkars(settings.category).map((z) =>
          formatForNotification(z.text),
        )
      : [];

    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("configure_scheduler", {
      settings: {
        enabled: settings.enabled,
        intervalMinutes: settings.intervalMinutes,
        texts,
      },
    });
  } catch (e) {
    console.warn("Failed to configure Rust scheduler:", e);
  }
}

let timer: ReturnType<typeof setInterval> | null = null;

function stopJsTimer(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startJsTimer(settings: NotificationSettings): void {
  stopJsTimer();
  if (!settings.enabled) return;
  timer = setInterval(
    async () => {
      const current = loadSettings();
      if (!current.enabled) {
        stopJsTimer();
        return;
      }
      const effectiveCategory = getEffectiveCategory(current);
      if (!effectiveCategory) return;
      const zekr = pickRandomZekr(effectiveCategory);
      if (zekr) await sendAzkarNotification(formatForNotification(zekr.text));
    },
    settings.intervalMinutes * 60 * 1000,
  );
}

export async function startScheduler(): Promise<void> {
  stopJsTimer();
  const settings = loadSettings();

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
