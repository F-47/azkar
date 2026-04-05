"use client";

import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { loadSettings } from "@/lib/notificationScheduler";

const DURATION = 6000;

interface NotificationData {
  title: string;
  body: string;
}

export default function NotificationPage() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [settings, setSettings] = useState(() => loadSettings());
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  async function hideWindow() {
    try {
      await invoke("hide_notification");
    } catch {}
  }

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.documentElement.setAttribute("dir", "rtl");

    function trigger(title: string, body: string) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setSettings(loadSettings());
      setData({ title, body });
      setProgress(100);

      const start = Date.now();
      function tick() {
        const elapsed = Date.now() - start;
        setProgress(Math.max(0, 100 - (elapsed / DURATION) * 100));
        if (elapsed < DURATION) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = null;
          hideWindow();
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    const win = window as unknown as {
      __showNotification?: typeof trigger;
      __pendingNotif?: NotificationData;
    };

    win.__showNotification = trigger;

    const pending = win.__pendingNotif;
    if (pending) {
      delete win.__pendingNotif;
      trigger(pending.title, pending.body);
    }

    return () => {
      delete win.__showNotification;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!data || !cardRef.current) return;
    const height = cardRef.current.scrollHeight + 16;
    invoke("resize_notification", { height }).catch(() => {});
  }, [data]);

  const theme = settings.theme;

  if (!data) return null;

  return (
    <div
      dir="rtl"
      ref={cardRef}
      className="flex flex-col rounded-xl cursor-pointer overflow-hidden border"
      style={{ borderColor: theme.borderColor }}
      onClick={hideWindow}
    >
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`,
        }}
      >
        <span
          className="text-sm font-bold pointer-events-none"
          style={{ color: theme.titleColor }}
        >
          {data.title}
        </span>

        <CircularProgress
          progress={progress}
          color={theme.titleColor}
        />
      </div>

      <p
        className="p-4 arabic-text w-full whitespace-pre-line text-start text-base"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          fontFamily: theme.fontFamily,
        }}
        dangerouslySetInnerHTML={{
          __html: data.body.replace(
            /۝([\u0660-\u0669]+)/g,
            `<span class="inline-flex items-center justify-center text-sm font-bold rounded-full w-6 h-6 align-middle font-serif border" style="background-color: ${theme.primaryColor}20; color: ${theme.primaryColor}; border-color: ${theme.primaryColor}20">$1</span>`,
          ),
        }}
      />
    </div>
  );
}

function CircularProgress({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) {
  const size = 28;
  const stroke = 3;

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const offset = (1 - progress / 100) * circumference;
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size}>
        {/* background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeOpacity={0.2}
          fill="none"
        />

        {/* progress */}
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
        className="absolute top-0 inset-s-0 size-full flex items-center justify-center text-[0.6rem] font-bold"
        style={{ color }}
      >
        {Math.ceil((progress / 100) * (DURATION / 1000))}
      </div>
    </div>
  );
}
