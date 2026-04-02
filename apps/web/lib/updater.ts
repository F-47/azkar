import { isTauri } from './tauri'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pendingUpdate: any = null

export async function checkForUpdate(): Promise<string | null> {
  if (!isTauri()) return null
  try {
    const { check } = await import('@tauri-apps/plugin-updater')
    pendingUpdate = await check()
    return pendingUpdate?.available ? pendingUpdate.version : null
  } catch {
    return null
  }
}

export async function installUpdate(onProgress: (pct: number) => void): Promise<void> {
  if (!pendingUpdate?.available) return
  let downloaded = 0
  let total = 0
  await pendingUpdate.downloadAndInstall((event: { event: string; data: { contentLength?: number; chunkLength: number } }) => {
    if (event.event === 'Started') total = event.data.contentLength ?? 0
    if (event.event === 'Progress') {
      downloaded += event.data.chunkLength
      if (total > 0) onProgress(Math.round((downloaded / total) * 100))
    }
    if (event.event === 'Finished') onProgress(100)
  })
}
