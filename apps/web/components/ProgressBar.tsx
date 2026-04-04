"use client";

import { cn } from "@/lib/utils";

interface Props {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: Props) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end px-1">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">التقدم الإجمالي</span>
          <span className="text-sm font-bold text-white tabular-nums">
            {completed} <span className="text-white/40 font-medium">/ {total}</span>
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">النسبة</span>
          <span className={cn(
            "text-sm font-black tabular-nums transition-colors duration-500",
            percentage === 100 ? "text-green-400 animate-pulse" : "text-primary"
          )}>
            {percentage}%
          </span>
        </div>
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden bg-white/10 p-0.5 border border-white/5">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]",
            percentage === 100 && "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
          )}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

