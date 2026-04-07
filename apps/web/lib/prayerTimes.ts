import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";

const COORDS_KEY = "azkar-prayer-coords";

export interface SavedCoords {
  lat: number;
  lon: number;
  source: "gps" | "timezone";
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
  const offsetMinutes = -new Date().getTimezoneOffset();
  const lon = Math.max(-180, Math.min(180, (offsetMinutes / 60) * 15));
  return { lat: 30, lon, source: "timezone" };
}

export function requestCoords(): Promise<SavedCoords> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(coordsFromTimezone());
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          source: "gps",
        });
      },
      () => resolve(coordsFromTimezone()),
      { timeout: 8000 },
    );
  });
}

export function getTodayPrayerWindows(
  coords: SavedCoords,
): { fajr: string; asr: string } | null {
  try {
    const c = new Coordinates(coords.lat, coords.lon);
    const params = CalculationMethod.MuslimWorldLeague();
    const pt = new PrayerTimes(c, new Date(), params);

    const fmt = (d: Date) =>
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

    return { fajr: fmt(pt.fajr), asr: fmt(pt.asr) };
  } catch {
    return null;
  }
}
