"use client";

import { HtmlContent } from "@/components/HtmlContent";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Zekr } from "@/types";
import { Check, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

interface Props {
  zekr: Zekr;
  remaining: number;
  showTransliteration: boolean;
  onDecrement: (id: number, defaultCount: number) => void;
}

function ZekrCard({
  zekr,
  remaining,
  showTransliteration,
  onDecrement,
}: Props) {
  const isDone = remaining === 0;
  const progress =
    zekr.count > 0 ? ((zekr.count - remaining) / zekr.count) * 100 : 100;
  const t = useTranslations("azkar");
  const common = useTranslations("common");

  return (
    <Card
      className={cn(
        "group relative border border-white/10 bg-white/5 transition-colors duration-200 p-6 overflow-hidden shadow-sm rounded-2xl",
        isDone
          ? "opacity-60 grayscale-[0.3]"
          : "hover:bg-white/10",
      )}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "24rem",
        contain: "content",
      }}
    >
      <div className="relative z-10 flex flex-col gap-4">
        <HtmlContent
          content={zekr.text}
          className={cn(
            "arabic-text text-xl leading-[2.2] mb-2 text-right whitespace-pre-line text-foreground/90 transition-all duration-500",
            isDone && "text-muted-foreground/50",
          )}
          badgeClassName="inline-flex items-center justify-center bg-primary/20 text-primary text-sm font-bold rounded-full w-7 h-7 mx-1.5 align-middle font-serif border border-primary/20"
        />
        {showTransliteration && zekr.transliteration && (
          <p
            lang="en"
            dir="ltr"
            className={cn(
              "whitespace-pre-line text-left text-sm leading-7 text-muted-foreground/80",
              isDone && "text-muted-foreground/40",
            )}
          >
            {zekr.transliteration}
          </p>
        )}

        <div className="space-y-4 pt-2 border-t border-white/5">
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/10">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out bg-primary",
                isDone && "bg-green-500",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => !isDone && onDecrement(zekr.id, zekr.count)}
              disabled={isDone}
              className={cn(
                "relative h-11 px-6 rounded-2xl font-bold text-sm transition-all duration-300 select-none flex items-center justify-center gap-2 min-w-25",
                isDone
                  ? "bg-green-500/20 text-green-400 cursor-not-allowed border border-green-500/20"
                  : "bg-primary text-primary-foreground active:scale-95 group-hover:scale-105",
              )}
            >
              {isDone ? (
                <>
                  <span>{t("done")}</span>
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{t("count")}</span>
                  <Star className="w-4 h-4 transition-transform group-hover:rotate-45" />
                </>
              )}
            </button>

            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={cn(
                    "text-2xl font-bold tabular-nums tracking-tighter",
                    isDone
                      ? "text-green-400"
                      : "text-primary hover:text-blue-400 transition-colors",
                  )}
                >
                  {zekr.count - remaining}
                </span>
                <span className="text-xs text-muted-foreground/60 font-medium whitespace-nowrap">
                  / {zekr.count}
                </span>
              </div>
              <span className="text-xs uppercase text-muted-foreground/40 font-bold">
                {common("times")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(ZekrCard);
