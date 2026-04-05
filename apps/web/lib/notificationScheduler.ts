import { sendAzkarNotification } from "./tauri";
import { getNotificationAzkars } from "@/lib/azkarStore";
import type { Zekr, Category } from "@/types";

const SETTINGS_KEY = "azkar-notification-settings";

export interface NotificationSettings {
  enabled: boolean;
  intervalMinutes: number;
  activeStart: number;
  activeEnd: number;
  category: Category | "both";
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  intervalMinutes: 30,
  activeStart: 6,
  activeEnd: 22,
  category: "both",
};

export const INTERVAL_OPTIONS = [
  { label: "كل ٥ دقائق", value: 5 },
  { label: "كل ١٥ دقيقة", value: 15 },
  { label: "كل ٣٠ دقيقة", value: 30 },
  { label: "كل ساعة", value: 60 },
  { label: "كل ساعتين", value: 120 },
  { label: "كل ٣ ساعات", value: 180 },
];

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

function isInActiveHours(settings: NotificationSettings): boolean {
  const hour = new Date().getHours();
  return hour >= settings.activeStart && hour < settings.activeEnd;
}

function pickRandomZekr(category: Category | "both"): Zekr | null {
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

let timer: ReturnType<typeof setInterval> | null = null;

export function startScheduler(): void {
  stopScheduler();
  const settings = loadSettings();
  if (!settings.enabled) return;

  timer = setInterval(
    async () => {
      const current = loadSettings();
      if (!current.enabled) {
        stopScheduler();
        return;
      }
      if (!isInActiveHours(current)) return;
      const zekr = pickRandomZekr(current.category);
      if (zekr) await sendAzkarNotification(formatForNotification(zekr.text));
    },
    settings.intervalMinutes * 60 * 1000,
  );
}

export function stopScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export function restartScheduler(): void {
  stopScheduler();
  startScheduler();
}
