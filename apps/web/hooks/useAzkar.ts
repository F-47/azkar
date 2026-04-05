'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Category, Zekr, ProgressMap } from '@/types'
import { getActiveAzkars } from '@/lib/azkarStore'

const STORAGE_KEY = 'azkar-progress'
const DATE_KEY = 'azkar-date'

function getStorageKey(category: Category): string {
  return `${STORAGE_KEY}-${category}`
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function buildInitialProgress(azkar: Zekr[]): ProgressMap {
  return azkar.reduce<ProgressMap>((acc, zekr) => {
    acc[zekr.id] = zekr.count
    return acc
  }, {})
}

function loadProgress(category: Category, azkar: Zekr[]): ProgressMap {
  if (typeof window === 'undefined') return buildInitialProgress(azkar)
  try {
    const storedDate = localStorage.getItem(DATE_KEY)
    const today = getTodayString()
    if (storedDate !== today) {
      localStorage.setItem(DATE_KEY, today)
      localStorage.removeItem(getStorageKey('morning'))
      localStorage.removeItem(getStorageKey('evening'))
      return buildInitialProgress(azkar)
    }
    const stored = localStorage.getItem(getStorageKey(category))
    if (!stored) return buildInitialProgress(azkar)
    return JSON.parse(stored) as ProgressMap
  } catch {
    return buildInitialProgress(azkar)
  }
}

function saveProgress(category: Category, progress: ProgressMap): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getStorageKey(category), JSON.stringify(progress))
  } catch {
    // localStorage not available
  }
}

export function useAzkar() {
  const [category, setCategory] = useState<Category>('morning')
  const [progress, setProgress] = useState<ProgressMap>({})
  const [mounted, setMounted] = useState(false)
  const [azkarData, setAzkarData] = useState<Zekr[]>([])

  const azkar = azkarData.filter((z) => z.category === category)

  const reloadAzkarData = useCallback(() => {
    setAzkarData(getActiveAzkars())
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => reloadAzkarData(), 0);
    const handleUpdate = () => reloadAzkarData();
    
    window.addEventListener('azkar-updated', handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('azkar-updated', handleUpdate);
    };
  }, [reloadAzkarData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
      setProgress(loadProgress(category, azkar))
    }, 0);
    return () => clearTimeout(timer);
  }, [category, azkar]);

  useEffect(() => {
    if (mounted) {
      saveProgress(category, progress)
    }
  }, [progress, category, mounted])

  const decrement = useCallback((id: number, defaultCount: number) => {
    setProgress((prev) => {
      const current = prev[id] ?? defaultCount
      if (current <= 0) return prev
      return { ...prev, [id]: current - 1 }
    })
  }, [])

  const reset = useCallback(() => {
    const fresh = buildInitialProgress(azkar)
    setProgress(fresh)
    saveProgress(category, fresh)
  }, [category, azkar])

  const switchCategory = useCallback((next: Category) => {
    setCategory(next)
  }, [])

  const totalCount = azkar.reduce((sum, z) => sum + z.count, 0)
  const completedCount = azkar.reduce((sum, z) => {
    const original = z.count
    const remaining = progress[z.id] ?? original
    return sum + (original - remaining)
  }, 0)

  const isComplete = azkar.every((z) => (progress[z.id] ?? z.count) === 0)

  return {
    azkar,
    category,
    progress,
    mounted,
    decrement,
    reset,
    switchCategory,
    totalCount,
    completedCount,
    isComplete,
  }
}
