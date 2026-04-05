"use client";

import { MosqueIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import useOrbitRadius from "@/hooks/useOrbitRadius";
import { useLatestRelease } from "@/hooks/useLatestRelease";
import { Download, Loader2, Moon, Star } from "lucide-react";

function LandingPage() {
  const radius = useOrbitRadius();
  const { data, loading } = useLatestRelease();

  const handleDownload = (platform: "windows" | "linux") => {
    const url = platform === "windows" ? data?.windowsUrl : data?.linuxUrl;

    if (url) {
      window.location.href = url;
    } else {
      window.open("https://github.com/F-47/azkar/releases/latest", "_blank");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0">
        <div className="absolute hidden sm:flex inset-0 items-center justify-center -z-10 pointer-events-none">
          <OrbitingCircles iconSize={48} radius={radius} duration={50}>
            <Zikr text="سُبْحَانَ اللَّهِ وَبِحَمْدِهِ" />
            <Zikr text="لَا إِلَهَ إِلَّا اللَّهُ" />
            <Zikr text="الْحَمْدُ لِلَّهِ" />
            <Zikr text="اللَّهُ أَكْبَرُ" />
          </OrbitingCircles>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />
        <div className="absolute inset-0 pattern-islamic opacity-25 mask-[radial-gradient(circle_at_center,black,transparent_75%)]" />
      </div>

      <div className="absolute top-32 left-16 opacity-15">
        <Star className="w-12 h-12" />
      </div>
      <div className="absolute bottom-40 right-20 opacity-15 ">
        <Moon className="w-12 h-12" />
      </div>

      <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center text-center z-10">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
          اجعل الذكر جزءًا من <span className="text-primary">يومك</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10">
          تجربة هادئة تساعدك على المواظبة على الذكر
        </p>

        <div className="flex gap-4">
          <Button
            size="xl"
            onClick={() => handleDownload("windows")}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 ml-2" />
            )}
            تحميل {data?.version ? `(${data.version})` : ""}
          </Button>
          <Button
            size="xl"
            variant="outline"
            onClick={() => handleDownload("linux")}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            نسخة لينكس
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-10 pointer-events-none z-10">
        <MosqueIcon />
      </div>
    </section>
  );
}

export default LandingPage;

function Zikr({ text }: { text: string }) {
  return (
    <div className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-muted-foreground/80 text-sm shadow-[0_0_12px_rgba(255,255,255,0.05)] whitespace-nowrap">
      {text}
    </div>
  );
}
