'use client'

import type { Category } from '@/types'

interface Props {
  active: Category
  onChange: (category: Category) => void
}

export default function CategoryToggle({ active, onChange }: Props) {
  return (
    <div
      className="flex rounded-xl p-1 gap-1"
      style={{ background: 'rgba(0,0,0,0.08)' }}
    >
      <button
        onClick={() => onChange('morning')}
        className={`flex-1 arabic-text py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          active === 'morning'
            ? 'text-white shadow-md'
            : 'text-white/70 hover:text-white/90'
        }`}
        style={
          active === 'morning'
            ? { background: 'rgba(255,255,255,0.22)' }
            : {}
        }
      >
        <span>🌅</span>
        <span>الصباح</span>
      </button>
      <button
        onClick={() => onChange('evening')}
        className={`flex-1 arabic-text py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          active === 'evening'
            ? 'text-white shadow-md'
            : 'text-white/70 hover:text-white/90'
        }`}
        style={
          active === 'evening'
            ? { background: 'rgba(255,255,255,0.22)' }
            : {}
        }
      >
        <span>🌙</span>
        <span>المساء</span>
      </button>
    </div>
  )
}
