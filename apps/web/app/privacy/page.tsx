import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  HardDrive,
  Link2,
  BarChart2,
  Baby,
  ScrollText,
  Mail,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | أذكار",
  description:
    "سياسة الخصوصية لتطبيق أذكار — تعرف على كيفية تعاملنا مع بياناتك.",
};

const sections: {
  id: string;
  icon: LucideIcon;
  title: string;
  content: string;
}[] = [
  {
    id: "collection",
    icon: ShieldCheck,
    title: "المعلومات التي نجمعها",
    content:
      "لا يجمع تطبيق أذكار أي بيانات شخصية عنك. التطبيق يعمل بالكامل على جهازك دون الحاجة إلى إنشاء حساب أو تسجيل دخول. جميع إعداداتك وأذكارك المخصصة تُحفظ محلياً على جهازك فقط.",
  },
  {
    id: "location",
    icon: MapPin,
    title: "بيانات الموقع",
    content:
      "إذا اخترت تفعيل ميزة أوقات الصلاة، يطلب التطبيق إذناً للوصول إلى موقعك الجغرافي تقريباً (خط العرض وخط الطول) لحساب أوقات الصلاة المحلية. هذه البيانات لا تُرسل إلى أي خادم خارجي وتُستخدم فقط محلياً داخل التطبيق.",
  },
  {
    id: "storage",
    icon: HardDrive,
    title: "التخزين المحلي",
    content:
      "يستخدم التطبيق التخزين المحلي (localStorage) لحفظ إعداداتك مثل الفئات المفضلة، وإعدادات الإشعارات، وموضع قائمة الأذكار. هذه البيانات لا تغادر جهازك أبداً.",
  },
  {
    id: "third-party",
    icon: Link2,
    title: "الخدمات الخارجية",
    content:
      "يتحقق التطبيق من GitHub Releases للكشف عن التحديثات الجديدة. هذا الطلب لا يحتوي على أي بيانات شخصية ويُستخدم فقط لمقارنة رقم الإصدار الحالي بأحدث إصدار متاح.",
  },
  {
    id: "analytics",
    icon: BarChart2,
    title: "التتبع والإحصاءات",
    content:
      "لا يستخدم التطبيق أي أدوات تتبع أو تحليل بيانات. لا توجد ملفات تعريف ارتباط (cookies) للتتبع، ولا إعلانات، ولا مشاركة بيانات مع أطراف ثالثة.",
  },
  {
    id: "children",
    icon: Baby,
    title: "خصوصية الأطفال",
    content:
      "التطبيق مناسب لجميع الأعمار. بما أننا لا نجمع أي بيانات شخصية، فلا توجد مخاوف خاصة بخصوصية الأطفال.",
  },
  {
    id: "changes",
    icon: ScrollText,
    title: "التغييرات على هذه السياسة",
    content:
      "في حال تحديث سياسة الخصوصية، سنُعلن ذلك في صفحة إصدارات المشروع على GitHub. الاستمرار في استخدام التطبيق يعني قبولك للتغييرات.",
  },
  {
    id: "contact",
    icon: Mail,
    title: "التواصل معنا",
    content:
      "إذا كان لديك أي سؤال أو استفسار حول هذه السياسة، يمكنك التواصل معنا عبر فتح issue على مستودع GitHub الخاص بالمشروع.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pattern-islamic opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.18),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى الرئيسية</span>
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            سياسة الخصوصية
          </h1>
          <p className="text-muted-foreground text-lg">
            نحن نؤمن بأن خصوصيتك حق أساسي لا يُساوَم عليه
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            آخر تحديث: أبريل 2025
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 text-center">
          <p className="text-lg font-semibold text-accent mb-1">
            الخلاصة في جملة واحدة
          </p>
          <p className="text-muted-foreground">
            تطبيق أذكار لا يجمع ولا يشارك ولا يبيع أي بيانات شخصية. كل شيء يبقى
            على جهازك.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-4">
        {sections.map((section, index) => {
          const Icon = section.icon;
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
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </section>
          );
        })}

        <div className="bg-card border border-border rounded-2xl p-6 text-center mt-8">
          <p className="text-muted-foreground mb-4">
            التطبيق مفتوح المصدر بالكامل — يمكنك التحقق من الكود بنفسك
          </p>
          <a
            href="https://github.com/F-47/azkar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <GitHubIcon className="w-5 h-5" />
            عرض الكود على GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
