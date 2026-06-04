import type { Metadata } from "next";
import "./globals.css";
import { Cairo, Amiri } from "next/font/google";
import { cn } from "@/lib/utils";
import { DirectionProvider } from "@/components/ui/direction";
import { TooltipProvider } from "@/components/ui/tooltip";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var path = window.location.pathname;
                var localeMatch = path.match(/^\\/(ar|en|fr|tr)(\\/|$)/);
                var locale = localeMatch ? localeMatch[1] : 'ar';
                document.documentElement.lang = locale;
                document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
                if (window.__TAURI_INTERNALS__ && path === '/') {
                  var saved = localStorage.getItem('azkar-locale');
                  if (!/^(ar|en|fr|tr)$/.test(saved || '')) saved = 'ar';
                  window.location.replace('/' + saved + '/azkar/');
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
