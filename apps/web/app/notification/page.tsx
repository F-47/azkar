"use client";

import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateZekrDuration } from "@/lib/azkarUtils";
import { HtmlContent } from "@/components/HtmlContent";
import { loadSettings, DEFAULT_SETTINGS } from "@/lib/notificationScheduler";
import { cn } from "@/lib/utils";

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

const DEFAULT_DURATION = 6000;

export default function NotificationPage() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [progress, setProgress] = useState(100);
  const [appearance, setAppearance] = useState(() => {
    if (typeof window !== "undefined") {
      return loadSettings().appearance || DEFAULT_SETTINGS.appearance;
    }
    return DEFAULT_SETTINGS.appearance;
  });

  const rafRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef(0);
  const isHoveredRef = useRef(false);

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
        ? calculateZekrDuration(body) * 1000
        : duration;

      setData({ title, body, duration: effectiveDuration });
      setProgress(100);

      let lastTime = 0;
      let totalElapsed = 0;
      lastUpdateRef.current = 0;
      isHoveredRef.current = false; // Reset hover state for the new notification

      const tick = (now: number) => {
        if (lastTime === 0) lastTime = now;
        const delta = now - lastTime;
        lastTime = now;

        if (!isHoveredRef.current) {
          totalElapsed += delta;
        }

        if (totalElapsed - lastUpdateRef.current > 50) {
          setProgress(
            Math.max(0, 100 - (totalElapsed / effectiveDuration) * 100),
          );
          lastUpdateRef.current = totalElapsed;
        }

        if (totalElapsed < effectiveDuration) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = null;
          hideWindow();
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [hideWindow],
  );

  useEffect(() => {
    const win = window as WindowWithNotif;

    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.documentElement.setAttribute("dir", "rtl");

    // expose safely (no spread nonsense)
    if (!win.__showNotification) {
      win.__showNotification = (title, body, duration) => {
        trigger(title, body, duration);
      };
    }

    // handle pending notification
    const pending = win.__pendingNotif;
    if (pending) {
      delete win.__pendingNotif;
      setTimeout(
        () => trigger(pending.title, pending.body, pending.duration),
        0,
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
      setAppearance(loadSettings().appearance || DEFAULT_SETTINGS.appearance);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!data) return null;

  const bgColor =
    appearance.backgroundColor +
    Math.round((appearance.opacity ?? 100) * 2.55)
      .toString(16)
      .padStart(2, "0");

  return (
    <div
      ref={cardRef}
      className={`flex flex-col z-10 pointer-events-auto select-none rounded-xl cursor-pointer overflow-hidden transition-all duration-200 active:scale-[0.98]`}
      onClick={hideWindow}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
    >
      <header
        className="flex items-center rounded-t-xl justify-between px-4 py-2"
        style={{ backgroundColor: appearance.headerBgColor }}
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
        style={{ color: appearance.textColor, background: bgColor }}
        badgeStyle={{
          backgroundColor: appearance.headerBgColor + "30",
          borderColor: appearance.headerBgColor + "30",
          color: appearance.headerBgColor,
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
