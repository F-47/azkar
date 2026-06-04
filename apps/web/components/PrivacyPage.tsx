"use client";

import { GitHubIcon } from "@/components/icons";
import {
  ArrowRight,
  ArrowLeft,
  Baby,
  BarChart2,
  HardDrive,
  Link2,
  Mail,
  MapPin,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { localizedPath } from "@/lib/i18n/routes";
import Link from "next/link";

const sections: Array<{ id: string; icon: LucideIcon; key: string }> = [
  { id: "collection", icon: ShieldCheck, key: "collection" },
  { id: "location", icon: MapPin, key: "location" },
  { id: "storage", icon: HardDrive, key: "storage" },
  { id: "third-party", icon: Link2, key: "thirdParty" },
  { id: "analytics", icon: BarChart2, key: "analytics" },
  { id: "children", icon: Baby, key: "children" },
  { id: "changes", icon: ScrollText, key: "changes" },
  { id: "contact", icon: Mail, key: "contact" },
];

export default function PrivacyPage() {
  const t = useTranslations("privacy");
  const common = useTranslations("common");
  const locale = useLocale();
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const homeHref = localizedPath(locale, "/");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pattern-islamic opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.18),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
          >
            <BackIcon className="w-4 h-4" />
            <span>{common("backHome")}</span>
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            {t("updated")}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 text-center">
          <p className="text-lg font-semibold text-accent mb-1">
            {t("summaryTitle")}
          </p>
          <p className="text-muted-foreground">{t("summary")}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-4">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const sectionText = t.raw(`sections.${section.key}`) as [
            string,
            string,
          ];
          return (
            <section
              key={section.id}
              id={section.id}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {sectionText[0]}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {sectionText[1]}
                  </p>
                </div>
              </div>
            </section>
          );
        })}

        <div className="bg-card border border-border rounded-2xl p-6 text-center mt-8">
          <p className="text-muted-foreground mb-4">{t("openSource")}</p>
          <a
            href="https://github.com/F-47/azkar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <GitHubIcon className="w-5 h-5" />
            {common("github")}
          </a>
        </div>
      </div>
    </main>
  );
}
