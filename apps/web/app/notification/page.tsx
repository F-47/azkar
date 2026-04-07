"use client";

import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { calculateZekrDuration } from "@/lib/azkarUtils";

interface NotificationData {
  title: string;
  body: string;
  duration: number;
}

export default function NotificationPage() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  async function hideWindow() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      await invoke("hide_notification");
    } catch {}
  }

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.documentElement.setAttribute("dir", "rtl");

    function trigger(title: string, body: string, duration?: number) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const effectiveDuration =
        !duration || duration === 6000
          ? calculateZekrDuration(body) * 1000
          : duration;

      setData({ title, body, duration: effectiveDuration });
      setProgress(100);

      const start = Date.now();
      function tick() {
        const elapsed = Date.now() - start;
        setProgress(Math.max(0, 100 - (elapsed / effectiveDuration) * 100));
        if (elapsed < effectiveDuration) {
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
      trigger(pending.title, pending.body, pending.duration);
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

  if (!data) return null;

  return (
    <div
      ref={cardRef}
      className="flex flex-col rounded-xl cursor-pointer overflow-hidden border border-[#15803d20] transition-all duration-200 active:scale-[0.98] ring-1 ring-white/10"
      onClick={hideWindow}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-linear-to-r from-[#064e3b] to-[#15803d]">
        <span className="text-sm font-bold pointer-events-none text-white">
          {data.title}
        </span>

        <CircularProgress
          progress={progress}
          color="#ffffff"
          duration={data.duration}
        />
      </div>

      <p
        className="p-4 arabic-text w-full whitespace-pre-line text-start text-base bg-white text-[#1a1a1a]"
        style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
        dangerouslySetInnerHTML={{
          __html: data.body.replace(
            /۝([\u0660-\u0669]+)/g,
            `<span class="inline-flex items-center justify-center text-sm font-bold rounded-full w-6 h-6 align-middle font-serif border bg-[#064e3b20] text-[#064e3b] border-[#064e3b20]">$1</span>`,
          ),
        }}
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
        className="absolute top-0 inset-0 size-full flex items-center justify-center text-[0.6rem] font-bold"
        style={{ color }}
      >
        {Math.ceil((progress / 100) * (duration / 1000))}
      </div>
    </div>
  );
}
