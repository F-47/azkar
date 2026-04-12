"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAppVersion, isTauri } from "@/lib/tauri";
import { checkForUpdate, installUpdate } from "@/lib/updater";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCircle2,
  Loader2,
  PartyPopper,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export function AppUpdateCard() {
  const [updateState, setUpdateState] = useState<
    "idle" | "checking" | "available" | "downloading" | "done" | "latest"
  >("idle");
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [appVersion, setAppVersion] = useState<string>("...");

  useEffect(() => {
    if (isTauri()) {
      getAppVersion().then(setAppVersion);
    }
  }, []);

  async function handleCheckUpdate() {
    setUpdateState("checking");
    const version = await checkForUpdate();
    if (version) {
      setUpdateVersion(version);
      setUpdateState("available");
    } else {
      setUpdateState("latest");
      setTimeout(() => setUpdateState("idle"), 3000);
    }
  }

  async function handleInstallUpdate() {
    setUpdateState("downloading");
    setDownloadProgress(0);
    await installUpdate((pct) => setDownloadProgress(pct));
    setUpdateState("done");
  }

  if (!isTauri()) return null;

  return (
    <Card className="rounded-xl p-5 border-white/10 bg-white/5 backdrop-blur-xl group overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
            <RefreshCw
              className={cn(
                "w-5 h-5",
                updateState === "checking" && "animate-spin",
              )}
            />
          </div>
          <div>
            <h3 className="font-bold text-base">تحديثات التطبيق</h3>
            <p className="text-xs text-muted-foreground/60">
              الإصدار الحالي: {appVersion}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
            تلقائي
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-6">
        {updateState === "latest" && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold leading-none">
              أنت تستخدم أحدث إصدار بالفعل!
            </span>
          </div>
        )}

        {updateState === "idle" && (
          <Button
            onClick={handleCheckUpdate}
            variant="ghost"
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 hover:border-primary/30 hover:text-primary transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 ml-2 opacity-50" />
            التحقق من التحديثات
          </Button>
        )}

        {updateState === "checking" && (
          <Button
            disabled
            variant="ghost"
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-sm font-bold opacity-70 transition-all duration-300"
          >
            جار التحقق من وجود تحديثات
            <RefreshCw className="w-4 h-4 ml-2 opacity-50 animate-spin" />
          </Button>
        )}

        {updateState === "available" && (
          <div className="space-y-4 animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <PartyPopper className="w-6 h-6 shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-widest opacity-80">
                  يتوفر تحديث جديد
                </span>
                <span className="text-xs font-bold">
                  الإصدار v{updateVersion} متاح الآن
                </span>
              </div>
            </div>
            <Button
              onClick={handleInstallUpdate}
              className="w-full h-14 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-[0.98] transition-all"
            >
              <Zap className="w-5 h-5 ml-2 fill-current" />
              تثبيت التحديث الآن
            </Button>
          </div>
        )}

        {updateState === "downloading" && (
          <div className="space-y-5 py-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  جار تحميل التحديث
                </span>
              </div>
              <span className="text-xs font-black text-primary tabular-nums tracking-tighter">
                {downloadProgress}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/5 p-1 border border-white/10 ring-4 ring-primary/5">
              <div
                className="h-full rounded-full bg-primary shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-500 ease-out"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {updateState === "done" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                <Check className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-widest opacity-80">
                  اكتمل التحميل
                </span>
                <span className="text-xs font-bold">
                  تم تجهيز التحديث بنجاح!
                </span>
              </div>
            </div>
            <Button
              onClick={() => {
                import("@/lib/tauri").then((m) => m.relaunchApp());
              }}
              className="w-full h-14 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-sm shadow-[0_10px_20px_rgba(34,197,94,0.2)] active:scale-[0.98] transition-all"
            >
              <RefreshCw className="w-5 h-5 ml-2" />
              إعادة التشغيل والتثبيت
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
