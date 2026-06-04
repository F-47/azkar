"use client";

import LandingPage from "@/components/landingPage";
import { Card } from "@/components/ui/card";
import { Bell, Book, GlobeOff, Lock, LucideIcon, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { localizedPath } from "@/lib/i18n/routes";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const t = useTranslations("landing");
  const common = useTranslations("common");
  const locale = useLocale();
  const privacyHref = localizedPath(locale, "/privacy/");

  return (
    <div className="min-h-screen text-foreground">
      <LandingPage />
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-accent/8 via-transparent to-accent/8" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Star className="w-12 h-12 text-primary mx-auto mb-6 animate-glow" />

            <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-6 italic">
              &quot;{t("quote")}&quot;
            </blockquote>

            <p className="text-muted-foreground text-lg leading-relaxed">
              {t("quoteText")}
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.10),transparent_70%)]" />
        <div className="absolute inset-0 pattern-islamic opacity-[0.06] mask-[radial-gradient(circle_at_center,black,transparent_75%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              {t("featuresTitle1")}{" "}
              <span className="text-primary">{t("featuresTitle2")}</span>{" "}
              {t("featuresTitle3")}{" "}
              <span className="text-primary">{t("featuresTitle4")}</span>
            </h2>

            <p className="text-lg text-muted-foreground/80 leading-relaxed">
              {t("featuresSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <FeatureCard
              icon={Bell}
              title={t("featureSmartTitle")}
              description={t("featureSmartDesc")}
            />
            <FeatureCard
              icon={Book}
              title={t("featureReadTitle")}
              description={t("featureReadDesc")}
            />
            <FeatureCard
              icon={GlobeOff}
              title={t("featureOfflineTitle")}
              description={t("featureOfflineDesc")}
            />
            <FeatureCard
              icon={Lock}
              title={t("featureCustomTitle")}
              description={t("featureCustomDesc")}
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border/30 bg-card/30 backdrop-blur py-12 flex-col flex items-center px-4">
        <div className="absolute inset-0 bg-linear-to-r from-accent/8 via-transparent to-accent/8 -z-10" />
        <div className="relative w-20 h-20 mb-6">
          <Image src="/logo.png" alt="icon" fill className="object-contain" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed text-center">
          {t("footer")}
        </p>
        <div className="w-24 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent my-6" />

        <p className="text-xs text-muted-foreground/60">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
        <Link
          href={privacyHref}
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors mt-2"
        >
          {common("privacy")}
        </Link>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="group relative rounded-none border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 p-6 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.05)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl border border-primary/20 bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-primary" />
        </div>

        <h3 className="text-lg font-semibold mb-2 text-foreground/90">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
}
