import { locales, type Locale } from "@/i18n/routing";
import { getLocaleDirection } from "@/lib/i18n/locale";
import { DirectionProvider } from "@/components/ui/direction";
import { LocaleSync } from "@/components/LocaleSync";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <DirectionProvider dir={getLocaleDirection(locale as Locale)}>
        <div lang={locale} dir={getLocaleDirection(locale as Locale)}>
          <LocaleSync locale={locale as Locale} />
          {children}
        </div>
      </DirectionProvider>
    </NextIntlClientProvider>
  );
}
