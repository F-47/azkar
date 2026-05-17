import type { Metadata } from "next";
import "./globals.css";
import { Cairo, Amiri } from "next/font/google";
import { cn } from "@/lib/utils";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-sans",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "أذكار",
  description: "تطبيق أذكار الصباح والمساء",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={cn("font-sans", cairo.variable, amiri.variable)}
    >
      <body
        className="min-h-screen"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
