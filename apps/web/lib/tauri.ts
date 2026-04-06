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

export async function getAppVersion(): Promise<string> {
  if (!isTauri()) return "Web Version";
  try {
    const { getVersion } = await import("@tauri-apps/api/app");
    return await getVersion();
  } catch {
    return "0.1.0";
  }
}
