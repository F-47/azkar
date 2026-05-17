import {
  Coordinates,
  CalculationMethod,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
} from "adhan";
import { isTauri, requestDesktopLocation } from "./tauri";

const COORDS_KEY = "azkar-prayer-coords";

export type PrayerCalculationMethod =
  | "MuslimWorldLeague"
  | "Egyptian"
  | "Karachi"
  | "UmmAlQura"
  | "Dubai"
  | "MoonsightingCommittee"
  | "NorthAmerica"
  | "Kuwait"
  | "Qatar"
  | "Singapore"
  | "Tehran"
  | "Turkey";

export type PrayerMadhab = "shafi" | "hanafi";
export type PrayerHighLatitudeRule =
  | "middleofthenight"
  | "seventhofthenight"
  | "twilightangle";
export type PrayerName =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export type PrayerAdjustments = Record<PrayerName, number>;
export type PrayerTimesMap = Record<PrayerName, string>;

export interface PrayerCalculationSettings {
  method: PrayerCalculationMethod;
  madhab: PrayerMadhab;
  highLatitudeRule: PrayerHighLatitudeRule;
  adjustments: PrayerAdjustments;
}

export const DEFAULT_PRAYER_SETTINGS: PrayerCalculationSettings = {
  method: "Egyptian",
  madhab: "shafi",
  highLatitudeRule: "twilightangle",
  adjustments: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
};

export interface SavedCoords {
  lat: number;
  lon: number;
  source: "gps" | "timezone";
  accuracy?: number | null;
  label?: string;
}

export type LocationRequestError =
  | "unsupported"
  | "denied"
  | "unavailable"
  | "timeout"
  | "unknown";

export interface GpsCoordsResult {
  coords: SavedCoords | null;
  error?: LocationRequestError;
}

export function saveCoords(coords: SavedCoords): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COORDS_KEY, JSON.stringify(coords));
}

export function loadCoords(): SavedCoords | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(COORDS_KEY);
    return stored ? (JSON.parse(stored) as SavedCoords) : null;
  } catch {
    return null;
  }
}

function coordsFromTimezone(): SavedCoords {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone === "Africa/Cairo") {
    return { lat: 31.1338, lon: 30.1297, source: "timezone" };
  }

  const offsetMinutes = -new Date().getTimezoneOffset();
  const lon = Math.max(-180, Math.min(180, (offsetMinutes / 60) * 15));
  return { lat: 30, lon, source: "timezone" };
}

export function requestCoords(): Promise<SavedCoords> {
  return requestGpsCoords().then(
    (result) => result.coords ?? coordsFromTimezone(),
  );
}

export function requestGpsCoords(): Promise<GpsCoordsResult> {
  if (isTauri()) {
    return requestDesktopLocation()
      .then((location) => ({
        coords: {
          lat: location.lat,
          lon: location.lon,
          accuracy: location.accuracy,
          source: "gps" as const,
          label: "GPS",
        },
      }))
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("denied")) {
          return { coords: null, error: "denied" };
        }
        if (message.includes("unsupported")) {
          return { coords: null, error: "unsupported" };
        }
        return { coords: null, error: "unavailable" };
      });
  }

  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ coords: null, error: "unsupported" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          coords: {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            source: "gps",
          },
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({ coords: null, error: "denied" });
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          resolve({ coords: null, error: "unavailable" });
        } else if (error.code === error.TIMEOUT) {
          resolve({ coords: null, error: "timeout" });
        } else {
          resolve({ coords: null, error: "unknown" });
        }
      },
      { enableHighAccuracy: true, maximumAge: 5 * 60 * 1000, timeout: 15000 },
    );
  });
}

export function normalizePrayerSettings(
  settings?: Partial<PrayerCalculationSettings>,
): PrayerCalculationSettings {
  return {
    ...DEFAULT_PRAYER_SETTINGS,
    ...settings,
    adjustments: {
      ...DEFAULT_PRAYER_SETTINGS.adjustments,
      ...settings?.adjustments,
    },
  };
}

function buildCalculationParameters(
  settings?: Partial<PrayerCalculationSettings>,
) {
  const config = normalizePrayerSettings(settings);
  const params = CalculationMethod[config.method]();
  params.madhab = config.madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;

  if (config.highLatitudeRule === "seventhofthenight") {
    params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  } else if (config.highLatitudeRule === "twilightangle") {
    params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
  } else {
    params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  }

  params.adjustments = { ...params.adjustments, ...config.adjustments };
  return params;
}

export function getTodayPrayerWindows(
  coords: SavedCoords,
  settings?: Partial<PrayerCalculationSettings>,
): { fajr: string; asr: string } | null {
  const times = getTodayPrayerTimes(coords, settings);
  if (!times) return null;
  return { fajr: times.fajr, asr: times.asr };
}

export function getTodayPrayerTimes(
  coords: SavedCoords,
  settings?: Partial<PrayerCalculationSettings>,
): PrayerTimesMap | null {
  return getPrayerTimesForDate(coords, new Date(), settings);
}

export function getPrayerTimesForDate(
  coords: SavedCoords,
  date: Date,
  settings?: Partial<PrayerCalculationSettings>,
): PrayerTimesMap | null {
  try {
    const c = new Coordinates(coords.lat, coords.lon);
    const params = buildCalculationParameters(settings);
    const pt = new PrayerTimes(c, date, params);

    const fmt = (d: Date) =>
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

    return {
      fajr: fmt(pt.fajr),
      sunrise: fmt(pt.sunrise),
      dhuhr: fmt(pt.dhuhr),
      asr: fmt(pt.asr),
      maghrib: fmt(pt.maghrib),
      isha: fmt(pt.isha),
    };
  } catch {
    return null;
  }
}
