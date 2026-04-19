import { getNotificationAzkars } from "@/lib/azkarStore";
import { getTodayPrayerWindows, loadCoords } from "@/lib/prayerTimes";
import type { Category, Zekr } from "@/types";
import { isTauri, sendAzkarNotification } from "./tauri";

const SETTINGS_KEY = "azkar-notification-settings";

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

export interface NotificationSettings {
  enabled: boolean;
  intervalMinutes: number;
  category: Category | "both";
  usePrayerTimes: boolean;
  appearance: NotificationAppearance;
  durationFactor: number;
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  intervalMinutes: 5,
  category: "both",
  usePrayerTimes: true,
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

const QUEUE_KEY = "azkar-shuffled-queue";

function getNextFromQueue(category: Category | "both"): Zekr | null {
  const pool = getNotificationAzkars(category);
  if (!pool.length) return null;

  if (typeof window === "undefined") return pool[0];

  const stored = localStorage.getItem(QUEUE_KEY);
  const queues: Record<string, number[]> = stored ? JSON.parse(stored) : {};

  let queue = queues[category] || [];

  // Filter queue to only include IDs currently in the pool (in case settings changed)
  const poolIds = new Set(pool.map((z) => z.id));
  queue = queue.filter((id) => poolIds.has(id));

  if (queue.length === 0) {
    // Rebuild in original list order (no shuffling)
    queue = pool.map((z) => z.id);
  }

  const id = queue.shift()!;
  queues[category] = queue;

  localStorage.setItem(QUEUE_KEY, JSON.stringify(queues));

  return pool.find((z) => z.id === id) || pool[0];
}

function pickRandomZekr(category: Category | "both") {
  return getNextFromQueue(category);
}

function categoryTitle(category: Category | "both"): string {
  if (category === "morning") return "أذكار الصباح";
  if (category === "evening") return "أذكار المساء";
  return "أذكار";
}

export function pickRandomZekrForTest(
  category: Category | "both",
): { title: string; text: string } | null {
  const zekr = pickRandomZekr(category);
  if (!zekr) return null;
  return {
    title: categoryTitle(zekr.category),
    text: formatForNotification(zekr.text),
  };
}

function formatForNotification(text: string): string {
  return text.trim();
}

async function configureRustScheduler(
  settings: NotificationSettings,
): Promise<void> {
  if (!isTauri()) return;
  try {
    const azkars = settings.enabled
      ? getNotificationAzkars(settings.category)
      : [];
    const texts = azkars.map((z) => formatForNotification(z.text));
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
      if (zekr)
        await sendAzkarNotification(
          categoryTitle(zekr.category),
          formatForNotification(zekr.text),
        );
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
