export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export async function sendAzkarNotification(body: string): Promise<void> {
  if (!isTauri()) return
  try {
    const { sendNotification } = await import('@tauri-apps/plugin-notification')
    sendNotification({ title: 'أذكار', body })
  } catch (e) {
    console.warn('Notification failed:', e)
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isTauri()) return false
  try {
    const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification')
    let granted = await isPermissionGranted()
    if (!granted) {
      const permission = await requestPermission()
      granted = permission === 'granted'
    }
    return granted
  } catch (e) {
    console.warn('Notification permission error:', e)
    return false
  }
}
