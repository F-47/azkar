"use client";

import LandingPage from "@/components/landingPage";
import { Card } from "@/components/ui/card";
import { Bell, Book, GlobeOff, Lock, LucideIcon, Star } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen text-foreground">
      <LandingPage />

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-accent/8 via-transparent to-accent/8" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Star className="w-12 h-12 text-primary mx-auto mb-6 animate-glow" />

            <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-6 italic">
              &quot;سبحان الله والحمد لله ولا إله إلا الله والله أكبر&quot;
            </blockquote>

            <p className="text-muted-foreground text-lg leading-relaxed">
              كلمات خفيفة على اللسان، ثقيلة في الميزان، تُغرس بها الحسنات في
              لحظات، وترتفع بها الدرجات عند الله بغير جهد ولا تعب.
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
              تجربة <span className="text-primary">سلسة</span> و{" "}
              <span className="text-primary">هادئة</span>
            </h2>

            <p className="text-lg text-muted-foreground/80 leading-relaxed">
              مميزات مصممة لتجعل الذكر جزءًا طبيعيًا من يومك بدون ضوضاء أو تشتيت
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <FeatureCard
              icon={Bell}
              title="تذكيرات ذكية"
              description="تنبيهات خفيفة في الوقت المناسب بدون إزعاج أو ضغط"
            />
            <FeatureCard
              icon={Book}
              title="قراءة مريحة"
              description="واجهة هادئة تساعدك على التركيز والخشوع بدون عناصر مشتتة"
            />
            <FeatureCard
              icon={GlobeOff}
              title="يعمل بدون إنترنت"
              description="كل شيء متاح لك حتى بدون اتصال، في أي مكان"
            />
            <FeatureCard
              icon={Lock}
              title="تخصيص كامل"
              description="غيّر المظهر والخطوط بما يناسب ذوقك الشخصي"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border/30 bg-card/30 backdrop-blur py-12 flex-col flex items-center">
        <div className="absolute inset-0 bg-linear-to-r from-accent/8 via-transparent to-accent/8" />
        <div className="relative w-20 h-20 mb-6">
          <Image src="/logo.png" alt="icon" fill className="object-contain" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed text-center">
          نسعى لتذكيرك بما يعينك على الثبات في الذكر والقرب من الله في كل يوم.
        </p>
        <div className="w-24 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent my-6" />

        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} أذكار. جميع الحقوق محفوظة.
        </p>

        <div className="absolute bottom-6 right-10 opacity-10 hidden md:block">
          <Star className="w-10 h-10" />
        </div>
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
