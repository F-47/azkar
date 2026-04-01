'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  loadSettings,
  saveSettings,
  restartScheduler,
  stopScheduler,
  pickRandomZekrForTest,
  type NotificationSettings,
} from '@/lib/notificationScheduler'
import { sendAzkarNotification } from '@/lib/tauri'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function formatHour(h: number): string {
  const period = h < 12 ? 'ص' : 'م'
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${display}:00 ${period}`
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)

  async function handleTest() {
    if (!settings) return
    setTesting(true)
    const zekr = pickRandomZekrForTest(settings.category)
    if (zekr) await sendAzkarNotification(zekr)
    setTimeout(() => setTesting(false), 2000)
  }

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  function update(patch: Partial<NotificationSettings>) {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  function handleSave() {
    if (!settings) return
    saveSettings(settings)
    if (settings.enabled) restartScheduler()
    else stopScheduler()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!settings) return null

  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 pt-5 pb-4 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)' }}
      >
        <div className="flex items-center justify-between">
          <Link href="/azkar" className="text-white/70 hover:text-white transition-colors text-xl">
            ←
          </Link>
          <h1 className="arabic-text text-white text-xl font-bold">⚙️ إعدادات الإشعارات</h1>
          <span className="w-8" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">
        {/* Enable toggle */}
        <div
          className="rounded-2xl p-5 shadow-sm border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="arabic-text font-bold text-gray-800">تفعيل الإشعارات</p>
              <p className="arabic-text text-sm text-gray-500 mt-0.5">
                تظهر أذكار عشوائية على سطح المكتب
              </p>
            </div>
            <button
              onClick={() => update({ enabled: !settings.enabled })}
              className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0"
              style={{ background: settings.enabled ? 'var(--green-primary)' : '#ccc' }}
            >
              <span
                className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-300"
                style={{ left: settings.enabled ? 'calc(100% - 1.625rem)' : '0.125rem' }}
              />
            </button>
          </div>
        </div>

        {settings.enabled && (
          <>
            {/* Interval */}
            <div
              className="rounded-2xl p-5 shadow-sm border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <p className="arabic-text font-bold text-gray-800 mb-3">تكرار الإشعار</p>
              <div className="flex items-center gap-3" dir="ltr">
                <input
                  type="number"
                  min={1}
                  value={settings.intervalMinutes}
                  onChange={e => {
                    const val = Math.max(1, Number(e.target.value))
                    update({ intervalMinutes: val })
                  }}
                  className="w-24 py-2 px-3 rounded-xl border text-center text-lg font-bold tabular-nums focus:outline-none"
                  style={{
                    background: '#f0f0e8',
                    borderColor: 'var(--green-primary)',
                    color: 'var(--green-primary)',
                  }}
                />
                <span className="arabic-text text-gray-600 text-sm">دقيقة</span>
              </div>
            </div>

            {/* Category */}
            <div
              className="rounded-2xl p-5 shadow-sm border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <p className="arabic-text font-bold text-gray-800 mb-3">نوع الأذكار</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '🌅 الصباح', value: 'morning' },
                  { label: '🌙 المساء', value: 'evening' },
                  { label: '📿 الكل', value: 'both' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update({ category: opt.value as NotificationSettings['category'] })}
                    className="arabic-text py-2.5 px-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: settings.category === opt.value ? 'var(--green-primary)' : '#f0f0e8',
                      color: settings.category === opt.value ? '#fff' : '#444',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active hours */}
            <div
              className="rounded-2xl p-5 shadow-sm border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <p className="arabic-text font-bold text-gray-800 mb-3">ساعات التفعيل</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="arabic-text text-sm text-gray-500 block mb-1">من</label>
                  <select
                    value={settings.activeStart}
                    onChange={(e) => update({ activeStart: Number(e.target.value) })}
                    className="arabic-text w-full py-2 px-3 rounded-xl border text-sm"
                    style={{ background: '#f0f0e8', borderColor: 'var(--border-color)' }}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>{formatHour(h)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="arabic-text text-sm text-gray-500 block mb-1">إلى</label>
                  <select
                    value={settings.activeEnd}
                    onChange={(e) => update({ activeEnd: Number(e.target.value) })}
                    className="arabic-text w-full py-2 px-3 rounded-xl border text-sm"
                    style={{ background: '#f0f0e8', borderColor: 'var(--border-color)' }}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>{formatHour(h)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="arabic-text text-xs text-gray-400 mt-2">
                لن تظهر إشعارات خارج هذا النطاق الزمني
              </p>
            </div>
          </>
        )}

        {/* Test notification */}
        <button
          onClick={handleTest}
          disabled={testing}
          className="w-full arabic-text py-3 rounded-2xl font-medium text-base transition-all border-2"
          style={{
            background: 'transparent',
            borderColor: 'var(--green-primary)',
            color: testing ? '#aaa' : 'var(--green-primary)',
          }}
        >
          {testing ? '✓ تم الإرسال' : '🔔 اختبار إشعار الآن'}
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full arabic-text py-3.5 rounded-2xl font-bold text-white text-base transition-all"
          style={{ background: saved ? '#4CAF50' : 'var(--green-primary)' }}
        >
          {saved ? '✓ تم الحفظ' : 'حفظ الإعدادات'}
        </button>
      </main>
    </div>
  )
}
