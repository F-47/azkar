import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans_Arabic } from "next/font/google";
import { cn } from "@/lib/utils";
import { DirectionProvider } from "@/components/ui/direction";
import { TooltipProvider } from "@/components/ui/tooltip";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-sans",
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
      className={cn("font-sans", notoSansArabic.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (window.__TAURI_INTERNALS__ && window.location.pathname === '/') {
                  window.location.replace('/azkar/');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <DirectionProvider dir="rtl">
          <TooltipProvider>{children}</TooltipProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
