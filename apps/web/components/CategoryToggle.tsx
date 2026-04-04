"use client";

import type { Category } from "@/types";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  active: Category;
  onChange: (category: Category) => void;
}

export default function CategoryToggle({ active, onChange }: Props) {
  return (
    <div className="flex rounded-2xl p-1.5 gap-1.5 bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
      <button
        onClick={() => onChange("morning")}
        className={cn(
          "flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden group",
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
        <span className="relative z-10">الصباح</span>
      </button>
      <button
        onClick={() => onChange("evening")}
        className={cn(
          "flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden group",
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
        <span className="relative z-10">المساء</span>
      </button>
    </div>
  );
}
