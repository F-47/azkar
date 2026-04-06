"use client";

import { checkForUpdate } from "@/lib/updater";
import { PartyPopper, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function UpdateNotifier() {
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasChecked = sessionStorage.getItem("startup-update-check");
    if (!hasChecked) {
      checkForUpdate().then((version) => {
        if (version) setUpdateVersion(version);
        sessionStorage.setItem("startup-update-check", "true");
      });
    }
  }, []);

  if (!mounted || !updateVersion || dismissed) return null;

  return (
    <div className="fixed top-5 left-4 right-4 z-50 animate-in slide-in-from-top-8 duration-700 ease-out pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="relative group overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-2xl p-4">
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
              <PartyPopper className="w-6 h-6 animate-bounce" />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-amber-200 uppercase tracking-widest">
                  تحديث جديد متاح
                </h4>
                <button
                  onClick={() => setDismissed(true)}
                  className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-bold text-white/80 leading-relaxed">
                الإصدار v{updateVersion} متوفر الآن مع تحسينات جديدة وميزات
                رائعة.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  asChild
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Link href="/azkar/settings">
                    <Zap className="w-3 h-3 ml-1.5 fill-current" />
                    تحديث الآن
                  </Link>
                </Button>

                <button
                  onClick={() => setDismissed(true)}
                  className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
                >
                  تخطي
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
