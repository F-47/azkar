import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'أذكار',
  description: 'تطبيق أذكار الصباح والمساء',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-cream-100 min-h-screen">{children}</body>
    </html>
  )
}
