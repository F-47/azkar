"use client";

import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateZekrDuration } from "@/lib/azkarUtils";
import { HtmlContent } from "@/components/HtmlContent";
import { loadSettings, DEFAULT_SETTINGS } from "@/lib/notificationScheduler";

interface NotificationData {
  title: string;
  body: string;
  duration: number;
}

type TriggerFn = (title: string, body: string, duration?: number) => void;

type WindowWithNotif = Window & {
  __showNotification?: TriggerFn;
  __pendingNotif?: NotificationData;
};

const DEFAULT_DURATION = 3000;

export default function NotificationPage() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [progress, setProgress] = useState(100);
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const s = loadSettings();
      return {
        appearance: s.appearance || DEFAULT_SETTINGS.appearance,
        durationFactor: s.durationFactor ?? DEFAULT_SETTINGS.durationFactor,
      };
    }
    return {
      appearance: DEFAULT_SETTINGS.appearance,
      durationFactor: DEFAULT_SETTINGS.durationFactor,
    };
  });

  const rafRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const pausedElapsedRef = useRef(0);
  const hoverStartRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const hideWindow = useCallback(async () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      await invoke<void>("hide_notification");
    } catch {}
  }, []);

  const trigger = useCallback<TriggerFn>(
    (title, body, duration) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const isDefault = duration == null || duration === DEFAULT_DURATION;
      const effectiveDuration = isDefault
        ? calculateZekrDuration(body, settings.durationFactor) * 1000
        : duration;
      isHoveredRef.current = false;
      pausedElapsedRef.current = 0;
      hoverStartRef.current = null;
      startTimeRef.current = performance.now();

      setData({ title, body, duration: effectiveDuration });
      setProgress(100);

      const tick = () => {
        const now = performance.now();

        if (isHoveredRef.current) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const activeElapsed =
          now - startTimeRef.current - pausedElapsedRef.current;
        const remaining = effectiveDuration - activeElapsed;

        if (remaining <= 0) {
          setProgress(0);
          rafRef.current = null;
          hideWindow();
          return;
        }

        setProgress((remaining / effectiveDuration) * 100);
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [hideWindow, settings.durationFactor],
  );

  useEffect(() => {
    const win = window as WindowWithNotif;

    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.documentElement.setAttribute("dir", "rtl");
    win.__showNotification = (title, body, duration) => {
      trigger(title, body, duration);
    };

    const pending = win.__pendingNotif;
    if (pending) {
      delete win.__pendingNotif;
      setTimeout(
        () => trigger(pending.title, pending.body, pending.duration),
        32,
      );
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      delete win.__showNotification;
    };
  }, [trigger]);

  useEffect(() => {
    if (!data || !cardRef.current) return;
    const height = cardRef.current.scrollHeight + 16;
    invoke<void>("resize_notification", { height }).catch(() => {});
  }, [data]);

  useEffect(() => {
    const handleStorage = () => {
      const s = loadSettings();
      setSettings({
        appearance: s.appearance || DEFAULT_SETTINGS.appearance,
        durationFactor: s.durationFactor ?? DEFAULT_SETTINGS.durationFactor,
      });
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!isHoveredRef.current) {
      isHoveredRef.current = true;
      hoverStartRef.current = performance.now();
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isHoveredRef.current) {
      isHoveredRef.current = false;
      if (hoverStartRef.current !== null) {
        pausedElapsedRef.current += performance.now() - hoverStartRef.current;
        hoverStartRef.current = null;
      }
    }
  }, []);

  if (!data) return null;

  const bgColor =
    settings.appearance.backgroundColor +
    Math.round((settings.appearance.opacity ?? 100) * 2.55)
      .toString(16)
      .padStart(2, "0");

  return (
    <div
      ref={cardRef}
      className={`flex flex-col z-10 pointer-events-auto select-none rounded-xl cursor-pointer overflow-hidden transition-all duration-200 active:scale-[0.98]`}
      onClick={hideWindow}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <header
        className="flex items-center rounded-t-xl justify-between px-4 py-2"
        style={{ backgroundColor: settings.appearance.headerBgColor }}
      >
        <span className="text-sm font-bold pointer-events-none">
          {data.title}
        </span>

        <CircularProgress
          progress={progress}
          color="#ffffff"
          duration={data.duration}
        />
      </header>

      <HtmlContent
        content={data.body}
        className="p-4 pointer-events-none arabic-text leading-8! w-full whitespace-pre-line text-base flex-1"
        style={{ color: settings.appearance.textColor, background: bgColor }}
        badgeStyle={{
          backgroundColor: settings.appearance.headerBgColor + "30",
          borderColor: settings.appearance.headerBgColor + "30",
          color: settings.appearance.headerBgColor,
        }}
        badgeClassName="inline-flex items-center justify-center text-sm font-bold rounded-full w-6 h-6 align-middle font-serif border"
      />
    </div>
  );
}

function CircularProgress({
  progress,
  color,
  duration,
}: {
  progress: number;
  color: string;
  duration: number;
}) {
  const size = 28;
  const stroke = 3;

  const { radius, circumference } = useMemo(() => {
    const radius = (size - stroke) / 2;
    return {
      radius,
      circumference: 2 * Math.PI * radius,
    };
  }, []);

  const offset = (1 - progress / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeOpacity={0.2}
          fill="none"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div
        className="absolute top-0 inset-0 size-full flex items-center justify-center text-[0.6rem] font-bold"
        style={{ color }}
      >
        {Math.ceil((progress / 100) * (duration / 1000))}
      </div>
    </div>
  );
}
