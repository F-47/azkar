"use client";

import type { Category } from "@/types";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  active: Category;
  onChange: (category: Category) => void;
  className?: string;
}

export default function CategoryToggle({
  active,
  onChange,
  className,
}: Props) {
  const t = useTranslations("common");

  return (
    <div
      className={cn(
        "flex w-full max-w-md mx-auto rounded-2xl gap-1.5 bg-white/5 border border-white/10 p-1.5",
        className,
      )}
    >
      <button
        onClick={() => onChange("morning")}
        className={cn(
          "flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2.5 relative overflow-hidden",
          active === "morning"
            ? "text-white bg-primary"
            : "text-white/60 hover:text-white hover:bg-white/5",
        )}
      >
        <Sun
          className={cn(
            "w-4 h-4 transition-transform duration-500",
            active === "morning" && "rotate-90",
          )}
        />
        <span className="relative z-10">{t("morning")}</span>
      </button>
      <button
        onClick={() => onChange("evening")}
        className={cn(
          "flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2.5 relative overflow-hidden",
          active === "evening"
            ? "text-white bg-primary"
            : "text-white/60 hover:text-white hover:bg-white/5",
        )}
      >
        <Moon
          className={cn(
            "w-4 h-4 transition-transform duration-500",
            active === "evening" && "rotate-12",
          )}
        />
        <span className="relative z-10">{t("evening")}</span>
      </button>
    </div>
  );
}
