'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { useRouter } from '@/i18n/navigation'
import { type Language } from '@/i18n/locale'
import { isTauri } from '@/lib/tauri'
import { useLocale } from 'next-intl'

export default function AzkarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const language = useLocale() as Language
  const allowed = useSyncExternalStore(
    () => () => {},
    isTauri,
    () => false,
  )

  useEffect(() => {
    if (!isTauri()) {
      router.replace('/', { locale: language })
    }
  }, [language, router])

  if (!allowed) return null

  return <>{children}</>
}
