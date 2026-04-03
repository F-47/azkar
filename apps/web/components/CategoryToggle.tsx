"use client";

import type { Category } from "@/types";
import { Moon, Sun } from "lucide-react";

interface Props {
  active: Category;
  onChange: (category: Category) => void;
}

export default function CategoryToggle({ active, onChange }: Props) {
  return (
    <div className="flex rounded-xl p-1 gap-1 bg-white/10">
      <button
        onClick={() => onChange("morning")}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          active === "morning"
            ? "text-white shadow-md bg-white/20"
            : "text-white/70 hover:text-white/90"
        }`}
      >
        <Sun />
        <span>الصباح</span>
      </button>
      <button
        onClick={() => onChange("evening")}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          active === "evening"
            ? "text-white shadow-md bg-white/20"
            : "text-white/70 hover:text-white/90"
        }`}
      >
        <Moon />
        <span>المساء</span>
      </button>
    </div>
  );
}
