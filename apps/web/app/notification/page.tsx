'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    __NOTIFICATION__?: { title: string; body: string }
  }
}

const DURATION = 6000

export default function NotificationPage() {
  const [data, setData] = useState<{ title: string; body: string } | null>(null)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
    document.documentElement.setAttribute('dir', 'rtl')

    const notif = window.__NOTIFICATION__
    if (notif) setData(notif)

    const start = Date.now()
    let raf: number

    function tick() {
      const elapsed = Date.now() - start
      setProgress(Math.max(0, 100 - (elapsed / DURATION) * 100))
      if (elapsed < DURATION) {
        raf = requestAnimationFrame(tick)
      } else {
        closeWindow()
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  async function closeWindow() {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().close()
    } catch {
      window.close()
    }
  }

  if (!data) return null

  return (
    <div dir="rtl" style={{ padding: 8, height: '100vh', boxSizing: 'border-box' }}>
      <div style={{
        height: '100%',
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
        border: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header — draggable */}
        <div
          data-tauri-drag-region
          dir="rtl"
          style={{
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          <span style={{
            color: '#fff',
            fontSize: 13,
            fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
            fontWeight: 700,
            pointerEvents: 'none',
          }}>
            📿 {data.title}
          </span>
          <button
            onClick={closeWindow}
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              color: '#fff',
              width: 22,
              height: 22,
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div dir="rtl" style={{
          flex: 1,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
          <p style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.75,
            color: '#1a1a1a',
            fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
            textAlign: 'right',
            direction: 'rtl',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            width: '100%',
          }}>
            {data.body}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#e8f5e9', flexShrink: 0 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#2E7D32' }} />
        </div>

      </div>
    </div>
  )
}
