import { isTauri, sendAzkarNotification } from "./tauri";
import { getNotificationAzkars } from "@/lib/azkarStore";
import type { Category } from "@/types";

const SETTINGS_KEY = "azkar-notification-settings";

export interface NotificationSettings {
  enabled: boolean;
  intervalMinutes: number;
  category: Category | "both";
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  intervalMinutes: 30,
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
      const zekr = pickRandomZekr(current.category);
      if (zekr) await sendAzkarNotification(formatForNotification(zekr.text));
    },
    settings.intervalMinutes * 60 * 1000,
  );
}

export async function startScheduler(): Promise<void> {
  stopJsTimer();
  const settings = loadSettings();

  if (isTauri()) {
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
