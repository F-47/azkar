import morningAzkar from "@/data/morning-azkar.json";
import eveningAzkar from "@/data/evening-azkar.json";
import type { Zekr, Category } from "@/types";

const CUSTOM_AZKAR_KEY = "azkar-custom";
const DISABLED_AZKAR_KEY = "azkar-disabled";
const NOTIF_DISABLED_AZKAR_KEY = "azkar-notif-disabled";

export function getCustomAzkars(): Zekr[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CUSTOM_AZKAR_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCustomAzkars(azkars: Zekr[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_AZKAR_KEY, JSON.stringify(azkars));
  window.dispatchEvent(new Event("azkar-updated"));
}

export function getDisabledIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(DISABLED_AZKAR_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveDisabledIds(ids: number[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISABLED_AZKAR_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("azkar-updated"));
}

export function getNotifDisabledIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(NOTIF_DISABLED_AZKAR_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveNotifDisabledIds(ids: number[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIF_DISABLED_AZKAR_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("azkar-updated"));
}

export function getAllAzkars(): Zekr[] {
  const base = [...morningAzkar, ...eveningAzkar] as Zekr[];
  const custom = getCustomAzkars();
  return [...base, ...custom];
}

export function getActiveAzkars(category?: Category | "both"): Zekr[] {
  const all = getAllAzkars();
  const disabledIds = new Set(getDisabledIds());
  const filtered = all.filter((z) => !disabledIds.has(z.id));

  if (!category || category === "both") {
    return filtered;
  }
  return filtered.filter((z) => z.category === category);
}

export function getNotificationAzkars(category?: Category | "both"): Zekr[] {
  const active = getActiveAzkars(category);
  const notifDisabled = new Set(getNotifDisabledIds());
  return active.filter((z) => !notifDisabled.has(z.id));
}

export function addCustomZekr(zekr: Omit<Zekr, "id" | "isCustom">): void {
  const custom = getCustomAzkars();
  // Generate a unique negative ID to prevent collision with static json
  const id = -new Date().getTime();

  custom.push({
    ...zekr,
    id,
    isCustom: true,
  });
  saveCustomAzkars(custom);
}

export function deleteCustomZekr(id: number): void {
  const custom = getCustomAzkars();
  const next = custom.filter((z) => z.id !== id);
  saveCustomAzkars(next);

  // Clean up disabled ones too
  const disabled = getDisabledIds().filter((disabledId) => disabledId !== id);
  saveDisabledIds(disabled);

  const notifDisabled = getNotifDisabledIds().filter(
    (disabledId) => disabledId !== id,
  );
  saveNotifDisabledIds(notifDisabled);
}

export function toggleZekrStatus(id: number, enabled: boolean): void {
  let disabled = getDisabledIds();
  if (enabled) {
    disabled = disabled.filter((disabledId) => disabledId !== id);
  } else {
    if (!disabled.includes(id)) {
      disabled.push(id);
    }
  }
  saveDisabledIds(disabled);
}

export function toggleZekrNotifStatus(id: number, enabled: boolean): void {
  let disabled = getNotifDisabledIds();
  if (enabled) {
    disabled = disabled.filter((disabledId) => disabledId !== id);
  } else {
    if (!disabled.includes(id)) {
      disabled.push(id);
    }
  }
  saveNotifDisabledIds(disabled);
}

export function toggleAllZekrStatus(ids: number[], enabled: boolean): void {
  let disabled = getDisabledIds();
  if (enabled) {
    disabled = disabled.filter((disabledId) => !ids.includes(disabledId));
  } else {
    const toAdd = ids.filter((id) => !disabled.includes(id));
    disabled.push(...toAdd);
  }
  saveDisabledIds(disabled);
}

export function toggleAllZekrNotifStatus(
  ids: number[],
  enabled: boolean,
): void {
  let disabled = getNotifDisabledIds();
  if (enabled) {
    disabled = disabled.filter((disabledId) => !ids.includes(disabledId));
  } else {
    const toAdd = ids.filter((id) => !disabled.includes(id));
    disabled.push(...toAdd);
  }
  saveNotifDisabledIds(disabled);
}
