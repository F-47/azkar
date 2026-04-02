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
import { sendAzkarNotification, isTauri } from '@/lib/tauri'
import { checkForUpdate, installUpdate } from '@/lib/updater'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function formatHour(h: number): string {
  const period = h < 12 ? 'ص' : 'م'
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${display}:00 ${period}`
}

const cardStyle = {
  background: 'var(--bg-card)',
  borderColor: 'var(--border-color)',
}

const inputStyle = {
  background: 'var(--input-bg)',
  borderColor: 'var(--border-color)',
  color: 'var(--text-primary)',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [updateState, setUpdateState] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'done'>('idle')
  const [updateVersion, setUpdateVersion] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }

  async function handleTest() {
    if (!settings) return
    setTesting(true)
    const zekr = pickRandomZekrForTest(settings.category)
    if (zekr) await sendAzkarNotification(zekr)
    setTimeout(() => setTesting(false), 2000)
  }

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

  async function handleCheckUpdate() {
    setUpdateState('checking')
    const version = await checkForUpdate()
    if (version) { setUpdateVersion(version); setUpdateState('available') }
    else setUpdateState('idle')
  }

  async function handleInstallUpdate() {
    setUpdateState('downloading')
    setDownloadProgress(0)
    await installUpdate((pct) => setDownloadProgress(pct))
    setUpdateState('done')
  }

  if (!settings) return null

  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: 'var(--bg-primary)' }}>

      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 pt-5 pb-4 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)' }}
      >
        {/* dir="ltr" keeps back button on physical left */}
        <div className="flex items-center justify-between" dir="ltr">
          <Link
            href="/azkar"
            className="text-white/70 hover:text-white transition-colors text-xl w-8 flex items-center"
          >
            ←
          </Link>
          <h1 className="text-white text-xl font-bold">⚙️ إعدادات الإشعارات</h1>
          <span className="w-8" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">

        {/* Enable toggle */}
        <div className="rounded-2xl p-5 shadow-sm border" style={cardStyle}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>تفعيل الإشعارات</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                تظهر أذكار عشوائية على سطح المكتب
              </p>
            </div>
            <button
              onClick={() => update({ enabled: !settings.enabled })}
              className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0"
              style={{ background: settings.enabled ? 'var(--green-primary)' : 'var(--done-badge)' }}
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
            <div className="rounded-2xl p-5 shadow-sm border" style={cardStyle}>
              <p className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>تكرار الإشعار</p>
              <div className="flex items-center gap-3" dir="ltr">
                <input
                  type="number"
                  min={1}
                  value={settings.intervalMinutes}
                  onChange={e => update({ intervalMinutes: Math.max(1, Number(e.target.value)) })}
                  className="w-24 py-2 px-3 rounded-xl border text-center text-lg font-bold tabular-nums focus:outline-none transition-colors"
                  style={{ ...inputStyle, borderColor: 'var(--green-primary)' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>دقيقة</span>
              </div>
            </div>

            {/* Category */}
            <div className="rounded-2xl p-5 shadow-sm border" style={cardStyle}>
              <p className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>نوع الأذكار</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '🌅 الصباح', value: 'morning' },
                  { label: '🌙 المساء', value: 'evening' },
                  { label: '📿 الكل', value: 'both' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update({ category: opt.value as NotificationSettings['category'] })}
                    className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                    style={{
                      background: settings.category === opt.value ? 'var(--green-primary)' : 'var(--input-bg)',
                      color: settings.category === opt.value ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active hours */}
            <div className="rounded-2xl p-5 shadow-sm border" style={cardStyle}>
              <p className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>ساعات التفعيل</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm block mb-1" style={{ color: 'var(--text-muted)' }}>من</label>
                  <select
                    value={settings.activeStart}
                    onChange={(e) => update({ activeStart: Number(e.target.value) })}
                    className="w-full py-2 px-3 rounded-xl border text-sm focus:outline-none transition-colors"
                    style={inputStyle}
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{formatHour(h)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm block mb-1" style={{ color: 'var(--text-muted)' }}>إلى</label>
                  <select
                    value={settings.activeEnd}
                    onChange={(e) => update({ activeEnd: Number(e.target.value) })}
                    className="w-full py-2 px-3 rounded-xl border text-sm focus:outline-none transition-colors"
                    style={inputStyle}
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{formatHour(h)}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                لن تظهر إشعارات خارج هذا النطاق الزمني
              </p>
            </div>
          </>
        )}

        {/* Test notification */}
        <button
          onClick={handleTest}
          disabled={testing}
          className="w-full py-3 rounded-2xl font-medium text-base transition-all border-2 active:scale-95"
          style={{
            background: 'transparent',
            borderColor: testing ? 'var(--text-muted)' : 'var(--green-primary)',
            color: testing ? 'var(--text-muted)' : 'var(--green-primary)',
          }}
        >
          {testing ? '✓ تم الإرسال' : '🔔 اختبار إشعار الآن'}
        </button>

        {/* Updates */}
        {isTauri() && (
          <div className="rounded-2xl p-5 shadow-sm border" style={cardStyle}>
            <p className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>التحديثات</p>

            {updateState === 'idle' && (
              <button
                onClick={handleCheckUpdate}
                className="w-full py-2.5 rounded-xl text-sm font-medium border-2 transition-all active:scale-95"
                style={{ borderColor: 'var(--green-primary)', color: 'var(--green-primary)', background: 'transparent' }}
              >
                التحقق من التحديثات
              </button>
            )}
            {updateState === 'checking' && (
              <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>جارٍ التحقق...</p>
            )}
            {updateState === 'available' && (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--note-text)' }}>
                  🎉 يتوفر إصدار جديد: <span dir="ltr" className="font-bold">{updateVersion}</span>
                </p>
                <button
                  onClick={handleInstallUpdate}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                  style={{ background: 'var(--green-primary)' }}
                >
                  تحميل وتثبيت التحديث
                </button>
              </div>
            )}
            {updateState === 'downloading' && (
              <div className="space-y-2">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>جارٍ التحميل... {downloadProgress}%</p>
                <div className="w-full h-2 rounded-full" style={{ background: 'var(--progress-track)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${downloadProgress}%`, background: 'var(--green-primary)' }}
                  />
                </div>
              </div>
            )}
            {updateState === 'done' && (
              <p className="text-sm" style={{ color: 'var(--note-text)' }}>
                ✓ تم التحديث. أعد تشغيل التطبيق لتطبيق التغييرات.
              </p>
            )}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
          style={{ background: saved ? '#4CAF50' : 'var(--green-primary)' }}
        >
          {saved ? '✓ تم الحفظ' : 'حفظ الإعدادات'}
        </button>

      </main>
    </div>
  )
}
