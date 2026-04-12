export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function sendAzkarNotification(body: string): Promise<void> {
  if (!isTauri()) return;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("show_notification", { body });
  } catch (e) {
    console.warn("Notification failed:", e);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  return isTauri();
}

export async function relaunchApp(): Promise<void> {
  if (!isTauri()) return;
  try {
    const { relaunch } = await import("@tauri-apps/plugin-process");
    await relaunch();
  } catch (e) {
    console.error("Failed to relaunch:", e);
  }
}

export async function getAutostartEnabled(): Promise<boolean> {
  if (!isTauri()) return false;
  try {
    const { isEnabled } = await import("@tauri-apps/plugin-autostart");
    return await isEnabled();
  } catch {
    return false;
  }
}

export async function setAutostartEnabled(enabled: boolean): Promise<void> {
  if (!isTauri()) return;
  try {
    const { enable, disable } = await import("@tauri-apps/plugin-autostart");
    if (enabled) await enable();
    else await disable();
  } catch (e) {
    console.error("Failed to set autostart:", e);
  }
}

export async function getAppVersion(): Promise<string> {
  if (!isTauri()) return "Web Version";
  try {
    const { getVersion } = await import("@tauri-apps/api/app");
    return await getVersion();
  } catch {
    return "0.1.0";
  }
}
