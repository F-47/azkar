'use client'

import type { Zekr } from '@/types'

interface Props {
  zekr: Zekr
  index: number
  remaining: number
  onDecrement: (id: number) => void
}

export default function ZekrCard({ zekr, index, remaining, onDecrement }: Props) {
  const isDone = remaining === 0
  const progress = zekr.count > 0 ? ((zekr.count - remaining) / zekr.count) * 100 : 100

  return (
    <div
      className={`rounded-2xl p-5 shadow-sm border transition-all duration-300 ${
        isDone ? 'opacity-60' : 'hover:shadow-md'
      }`}
      style={{
        background: isDone ? '#f0f0e8' : 'var(--bg-card)',
        borderColor: isDone ? '#ccc8b0' : 'var(--border-color)',
      }}
    >
      {/* Top row: verse number + note badge */}
      <div className="flex items-center justify-between mb-3" dir="ltr">
        <span
          className="text-sm font-bold tabular-nums flex items-center justify-center rounded-full"
          style={{
            background: isDone ? '#d0cdb5' : 'var(--green-primary)',
            color: isDone ? '#666' : '#fff',
            width: '1.75rem',
            height: '1.75rem',
            flexShrink: 0,
          }}
        >
          {index}
        </span>
        {zekr.note && (
          <span
            className="arabic-text text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: isDone ? '#d0cdb5' : '#e8f5e9',
              color: isDone ? '#666' : '#2E7D32',
            }}
          >
            {zekr.note}
          </span>
        )}
      </div>

      {/* Arabic text */}
      <p
        className={`arabic-text text-lg leading-loose mb-4 text-right ${
          isDone ? 'line-through text-gray-400' : 'text-gray-800'
        }`}
        style={{ whiteSpace: 'pre-line' }}
        dangerouslySetInnerHTML={{
          __html: zekr.text.replace(
            /۝([\u0660-\u0669]+)/g,
            `<span style="display:inline-flex;align-items:center;justify-content:center;background:${isDone ? '#d0cdb5' : 'var(--gold)'};color:${isDone ? '#888' : '#3b2000'};font-size:0.7rem;font-weight:700;border-radius:50%;width:1.4rem;height:1.4rem;margin:0 0.2rem;vertical-align:middle;font-family:serif;">$1</span>`
          ),
        }}
      />

      {/* Progress bar */}
      <div
        className="w-full h-1 rounded-full mb-4 overflow-hidden"
        style={{ background: '#e8e4d0' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: isDone ? '#b0a878' : 'var(--green-medium)',
          }}
        />
      </div>

      {/* Counter button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => !isDone && onDecrement(zekr.id)}
          disabled={isDone}
          className={`arabic-text px-5 py-2 rounded-xl font-bold text-sm transition-all duration-150 select-none ${
            isDone
              ? 'cursor-not-allowed text-gray-400'
              : 'text-white hover:scale-105 active:scale-95 shadow-sm hover:shadow-md'
          }`}
          style={
            isDone
              ? { background: '#d0cdb5' }
              : { background: 'var(--green-primary)' }
          }
        >
          {isDone ? '✓ تمّ' : 'سبّح'}
        </button>

        <div className="flex items-center gap-2">
          <span
            className="arabic-text text-2xl font-bold tabular-nums"
            style={{ color: isDone ? '#aaa' : 'var(--green-primary)' }}
          >
            {zekr.count - remaining}
          </span>
          <span className="arabic-text text-xs text-gray-400">
            / {zekr.count}
          </span>
        </div>
      </div>
    </div>
  )
}
