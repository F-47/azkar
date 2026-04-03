export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export async function sendAzkarNotification(body: string): Promise<void> {
  if (!isTauri()) return
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('show_notification', { body })
  } catch (e) {
    console.warn('Notification failed:', e)
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  return isTauri()
}
