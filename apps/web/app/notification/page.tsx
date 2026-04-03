'use client'

import { useEffect, useRef, useState } from 'react'

const DURATION = 6000

export default function NotificationPage() {
  const [data, setData] = useState<{ title: string; body: string } | null>(null)
  const [progress, setProgress] = useState(100)
  const rafRef = useRef<number | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
    document.documentElement.setAttribute('dir', 'rtl')

    function trigger(title: string, body: string) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      setData({ title, body })
      setProgress(100)

      const start = Date.now()
      function tick() {
        const elapsed = Date.now() - start
        setProgress(Math.max(0, 100 - (elapsed / DURATION) * 100))
        if (elapsed < DURATION) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          rafRef.current = null
          hideWindow()
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    // Register global so Rust can call via eval()
    ;(window as any).__showNotification = trigger

    // Pick up any notification that arrived before this effect ran
    const pending = (window as any).__pendingNotif
    if (pending) {
      delete (window as any).__pendingNotif
      trigger(pending.title, pending.body)
    }

    return () => {
      delete (window as any).__showNotification
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Resize window to fit content after each new notification
  useEffect(() => {
    if (!data || !cardRef.current) return
    const height = cardRef.current.scrollHeight + 16 // 8px padding top + bottom
    import('@tauri-apps/api/core').then(({ invoke }) => {
      invoke('resize_notification', { height })
    })
  }, [data])

  async function hideWindow() {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('hide_notification')
    } catch {
      // noop
    }
  }

  if (!data) return null

  return (
    <div dir="rtl" style={{ padding: 8 }}>
      <div ref={cardRef} style={{
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
            onClick={hideWindow}
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
            width: '100%',
            whiteSpace: 'pre-wrap',
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
