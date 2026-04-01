'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isTauri } from '@/lib/tauri'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    if (isTauri()) router.replace('/azkar')
  }, [router])
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-yellow-800/20">
        <span className="text-green-800 font-bold text-xl arabic-text">أذكار</span>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Ornament */}
        <div className="mb-6 text-5xl select-none">☽</div>

        <h1 className="arabic-text text-5xl font-bold text-green-900 mb-4 leading-tight">
          أذكار الصباح والمساء
        </h1>

        <div
          className="w-24 h-0.5 mx-auto mb-6"
          style={{ background: 'var(--gold)' }}
        />

        <p className="arabic-text text-lg text-green-800/80 max-w-md leading-relaxed mb-3">
          حصنِ نفسك بأذكار الصباح والمساء المأثورة عن النبي ﷺ
        </p>
        <p className="arabic-text text-base text-green-700/70 max-w-sm leading-relaxed mb-10">
          تطبيق بسيط وخفيف يساعدك على المداومة على الأذكار اليومية مع تتبع التقدم وإشعارات التذكير
        </p>

        {/* Download buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* TODO: replace href with real release URL */}
          <a
            href="#"
            className="flex items-center gap-3 arabic-text px-7 py-3 rounded-lg text-white font-semibold text-base shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--green-primary)' }}
          >
            <span className="text-xl">🐧</span>
            <span>تحميل للـ Ubuntu</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 arabic-text px-7 py-3 rounded-lg font-semibold text-base border-2 transition-all hover:-translate-y-0.5"
            style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
          >
            <span className="text-xl">🪟</span>
            <span>تحميل للـ Windows</span>
          </a>
        </div>

        <p className="mt-4 text-sm text-green-700/50 arabic-text">
          متاح على Windows · Linux
        </p>
      </section>

      {/* Features */}
      <section className="w-full max-w-3xl mx-auto px-6 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl p-5 text-center shadow-sm border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="arabic-text font-bold text-green-900 mb-2">{f.title}</h3>
            <p className="arabic-text text-sm text-green-800/70 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="w-full py-4 text-center border-t border-yellow-800/10">
        <p className="arabic-text text-sm text-green-800/50">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      </footer>
    </main>
  )
}

const features = [
  {
    icon: '🌅',
    title: 'أذكار الصباح والمساء',
    desc: 'مجموعة كاملة من الأذكار المأثورة مرتبة ومنظمة',
  },
  {
    icon: '📿',
    title: 'عداد تفاعلي',
    desc: 'اضغط على الذكر لتسجيل العدد مع حفظ تقدمك تلقائياً',
  },
  {
    icon: '🔔',
    title: 'إشعارات تذكير',
    desc: 'تذكير بأذكار الصباح والمساء في أوقاتها المناسبة',
  },
]
