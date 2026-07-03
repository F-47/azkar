"use client";

import { relaunchApp } from "@/lib/tauri";
import { checkForUpdate, installUpdate } from "@/lib/updater";
import { Check, Loader2, PartyPopper, RefreshCw, X, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

type UpdateState = "available" | "downloading" | "ready" | "failed";

export default function UpdateNotifier() {
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [updateState, setUpdateState] = useState<UpdateState>("available");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const t = useTranslations("updates");

  useEffect(() => {
    const hasChecked = sessionStorage.getItem("startup-update-check");
    if (!hasChecked) {
      checkForUpdate().then((version) => {
        if (version) setUpdateVersion(version);
        sessionStorage.setItem("startup-update-check", "true");
      });
    }
  }, []);

  async function handleInstallUpdate() {
    setUpdateState("downloading");
    setDownloadProgress(0);
    try {
      await installUpdate((pct) => setDownloadProgress(pct));
      setUpdateState("ready");
    } catch (error) {
      console.error("Failed to install update:", error);
      setUpdateState("failed");
    }
  }

  if (!updateVersion || dismissed) return null;

  return (
    <div className="fixed top-5 left-4 right-4 z-50 animate-in slide-in-from-top-8 duration-700 ease-out pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="relative group overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/12 p-4 shadow-lg shadow-amber-500/10">
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
              <PartyPopper className="w-6 h-6 animate-bounce" />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-amber-200 uppercase">
                  {t("toastTitle")}
                </h4>
                {updateState === "available" && (
                  <button
                    onClick={() => setDismissed(true)}
                    className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs font-bold text-white/80 leading-relaxed">
                {updateState === "failed"
                  ? t("failed")
                  : updateState === "ready"
                    ? t("prepared")
                    : t("toastText", { version: updateVersion })}
              </p>

              {updateState === "downloading" && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white/80">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t("downloading")}
                    </span>
                    <span className="tabular-nums">{downloadProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {updateState !== "downloading" && (
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={
                      updateState === "ready"
                        ? relaunchApp
                        : handleInstallUpdate
                    }
                    className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs uppercase shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    {updateState === "ready" ? (
                      <RefreshCw className="w-3 h-3 ml-1.5" />
                    ) : updateState === "failed" ? (
                      <RefreshCw className="w-3 h-3 ml-1.5" />
                    ) : (
                      <Zap className="w-3 h-3 ml-1.5 fill-current" />
                    )}
                    {updateState === "ready"
                      ? t("restart")
                      : updateState === "failed"
                        ? t("retry")
                        : t("updateNow")}
                  </Button>

                  {updateState === "available" && (
                    <button
                      onClick={() => setDismissed(true)}
                      className="h-9 px-4 rounded-xl text-xs uppercase text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
                    >
                      {t("skip")}
                    </button>
                  )}

                  {updateState === "ready" && (
                    <Check className="h-4 w-4 text-green-400" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
