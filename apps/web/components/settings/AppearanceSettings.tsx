"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Palette, RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_SETTINGS,
  type NotificationSettings,
} from "@/lib/notificationScheduler";

function ColorPicker({
  value,
  onChange,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  className?: string;
}) {
  const [localColor, setLocalColor] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalColor(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalColor(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(val);
    }, 150);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-xs font-bold text-muted-foreground uppercase">
        {label}
      </label>
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-lg transition-colors focus-within:border-primary/50">
        <div className="relative w-8 h-8 rounded shrink-0 overflow-hidden ring-1 ring-white/20 shadow-inner">
          <input
            type="color"
            value={localColor}
            onChange={handleChange}
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-none bg-transparent"
          />
        </div>
        <span className="text-sm font-mono uppercase text-muted-foreground w-full">
          {localColor}
        </span>
      </div>
    </div>
  );
}

function OpacitySlider({
  value,
  onChange,
  label,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  className?: string;
}) {
  const [localVal, setLocalVal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalVal(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(val);
    }, 100);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
        <span>{label}</span>
        <span className="text-primary">{localVal}%</span>
      </label>
      <div className="flex items-center h-12 px-3 bg-white/5 border border-white/10 rounded-lg">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={localVal}
          onChange={handleChange}
          className="w-full accent-primary"
        />
      </div>
    </div>
  );
}

export function AppearanceSettings({
  settings,
  update,
}: {
  settings: NotificationSettings;
  update: (patch: Partial<NotificationSettings>) => void;
}) {
  const bgColor =
    (settings.appearance?.backgroundColor ?? "#ffffff") +
    Math.round((settings.appearance?.opacity ?? 100) * 2.55)
      .toString(16)
      .padStart(2, "0");

  return (
    <Card className="rounded-xl p-5 border-white/10 bg-white/5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-400">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">مظهر الإشعار</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              خصص ألوان نافذة الأذكار المنبثقة
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="rounded-xl bg-white/5 size-8 border border-white/10"
          size="sm"
          onClick={() => update({ appearance: DEFAULT_SETTINGS.appearance })}
        >
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </header>

      <div className="mb-6 p-6 md:p-8 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center relative overflow-hidden ring-1 ring-black/50 inset-shadow-sm">
        <div className="w-full max-w-90 flex flex-col z-10 pointer-events-auto select-none rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
          <div
            className="flex items-center rounded-t-xl justify-between px-4 py-2"
            style={{
              backgroundColor: settings.appearance?.headerBgColor ?? "#064e3b",
            }}
          >
            <span className="text-sm font-bold text-white">أذكار</span>
            <div className="relative w-7 h-7">
              <svg width="28" height="28" className="absolute top-0 left-0">
                <circle
                  cx="14"
                  cy="14"
                  r="12.5"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeOpacity="0.2"
                  fill="none"
                />
                <circle
                  cx="14"
                  cy="14"
                  r="12.5"
                  stroke="#ffffff"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="78.53"
                  strokeDashoffset="23.5"
                  strokeLinecap="round"
                  transform="rotate(-90 14 14)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[0.6rem] font-bold text-white mt-[1px]">
                6
              </div>
            </div>
          </div>

          <div
            className="p-4 arabic-text w-full text-base flex-1"
            style={{
              backgroundColor: bgColor,
              color: settings.appearance?.textColor ?? "#1a1a1a",
            }}
          >
            سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
          </div>
        </div>
      </div>

      {/* Controls  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ColorPicker
          label="لون خلفية العنوان"
          value={
            settings.appearance?.headerBgColor ??
            DEFAULT_SETTINGS.appearance.headerBgColor
          }
          onChange={(c) =>
            update({
              appearance: {
                ...(settings.appearance || DEFAULT_SETTINGS.appearance),
                headerBgColor: c,
              },
            })
          }
        />
        <ColorPicker
          label="لون الخلفية"
          value={
            settings.appearance?.backgroundColor ??
            DEFAULT_SETTINGS.appearance.backgroundColor
          }
          onChange={(c) =>
            update({
              appearance: {
                ...(settings.appearance || DEFAULT_SETTINGS.appearance),
                backgroundColor: c,
              },
            })
          }
        />
        <ColorPicker
          label="لون النص"
          value={
            settings.appearance?.textColor ??
            DEFAULT_SETTINGS.appearance.textColor
          }
          onChange={(c) =>
            update({
              appearance: {
                ...(settings.appearance || DEFAULT_SETTINGS.appearance),
                textColor: c,
              },
            })
          }
        />
        <OpacitySlider
          label="الشفافية"
          value={settings.appearance?.opacity ?? 100}
          onChange={(n) =>
            update({
              appearance: {
                ...(settings.appearance || DEFAULT_SETTINGS.appearance),
                opacity: n,
              },
            })
          }
        />
      </div>
    </Card>
  );
}
