"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 6000;

export default function NotificationPage() {
  const [data, setData] = useState<{ title: string; body: string } | null>(
    null,
  );
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.documentElement.setAttribute("dir", "rtl");

    function trigger(title: string, body: string) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
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

    // Register global so Rust can call via eval()
    (window as any).__showNotification = trigger;

    // Pick up any notification that arrived before this effect ran
    const pending = (window as any).__pendingNotif;
    if (pending) {
      delete (window as any).__pendingNotif;
      trigger(pending.title, pending.body);
    }

    return () => {
      delete (window as any).__showNotification;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Resize window to fit content after each new notification
  useEffect(() => {
    if (!data || !cardRef.current) return;
    const height = cardRef.current.scrollHeight + 16; // 8px padding top + bottom
    import("@tauri-apps/api/core").then(({ invoke }) => {
      invoke("resize_notification", { height });
    });
  }, [data]);

  async function hideWindow() {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("hide_notification");
    } catch {
      // noop
    }
  }

  if (!data) return null;

  return (
    <div
      dir="rtl"
      ref={cardRef}
      className="flex flex-col rounded-xl cursor-pointer"
      onClick={hideWindow}
    >
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-4 py-2 bg-linear-to-r from-green-900 to-green-700 rounded-t-xl"
      >
        <span
          style={{
            fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
          }}
          className="text-sm font-bold pointer-events-none text-white"
        >
          {data.title}
        </span>

        <CircularProgress progress={progress} />
      </div>

      <p className="p-4 text-[#1a1a1a] arabic-text w-full text-start text-base bg-white rounded-b-xl">
        {data.body}
      </p>
    </div>
  );
}

function CircularProgress({ progress }: { progress: number }) {
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
          stroke="#c8e6c9"
          strokeWidth={stroke}
          fill="none"
        />

        {/* progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2E7D32"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div className="absolute top-0 inset-s-0 size-full flex items-center justify-center text-[0.6rem] font-bold text-white">
        {Math.ceil((progress / 100) * (DURATION / 1000))}
      </div>
    </div>
  );
}
