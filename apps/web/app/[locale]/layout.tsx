import { DirectionProvider } from "@/components/ui/direction";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = (await import(`../../messages/${locale}.json`)).default;

  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      now={new Date(0)}
      timeZone="UTC"
    >
      <DirectionProvider dir={direction}>{children}</DirectionProvider>
    </NextIntlClientProvider>
  );
}
