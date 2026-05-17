'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isTauri } from '@/lib/tauri'

export default function AzkarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [allowed] = useState(() => isTauri())

  useEffect(() => {
    if (!allowed) {
      router.replace('/')
    }
  }, [allowed, router])

  if (!allowed) return null

  return <>{children}</>
}
