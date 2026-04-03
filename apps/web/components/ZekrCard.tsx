"use client";

import type { Zekr } from "@/types";

interface Props {
  zekr: Zekr;
  index: number;
  remaining: number;
  onDecrement: (id: number) => void;
}

export default function ZekrCard({
  zekr,
  index,
  remaining,
  onDecrement,
}: Props) {
  const isDone = remaining === 0;
  const progress =
    zekr.count > 0 ? ((zekr.count - remaining) / zekr.count) * 100 : 100;

  return (
    <div
      className={`rounded-2xl p-5 shadow-sm border transition-all duration-300 ${
        isDone ? "opacity-60" : "hover:shadow-md"
      }`}
      style={{
        background: isDone ? "var(--done-bg)" : "var(--bg-card)",
        borderColor: isDone ? "var(--done-border)" : "var(--border-color)",
      }}
    >
      <div className="flex items-center justify-between mb-3" dir="ltr">
        <span
          className="text-sm font-bold tabular-nums flex items-center justify-center rounded-full"
          style={{
            background: isDone ? "var(--done-badge)" : "var(--green-primary)",
            color: isDone ? "var(--text-muted)" : "#fff",
            width: "1.75rem",
            height: "1.75rem",
            flexShrink: 0,
          }}
        >
          {index}
        </span>
        {zekr.note && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: isDone ? "var(--done-badge)" : "var(--note-bg)",
              color: isDone ? "var(--text-muted)" : "var(--note-text)",
            }}
          >
            {zekr.note}
          </span>
        )}
      </div>

      <p
        className={`arabic-text text-lg leading-loose mb-4 text-right ${
          isDone ? "line-through" : ""
        }`}
        style={{
          whiteSpace: "pre-line",
          color: isDone ? "var(--text-muted)" : "var(--text-primary)",
        }}
        dangerouslySetInnerHTML={{
          __html: zekr.text.replace(
            /۝([\u0660-\u0669]+)/g,
            `<span style="display:inline-flex;align-items:center;justify-content:center;background:${isDone ? "var(--done-badge)" : "var(--gold)"};color:${isDone ? "var(--text-muted)" : "#3b2000"};font-size:0.7rem;font-weight:700;border-radius:50%;width:1.4rem;height:1.4rem;margin:0 0.2rem;vertical-align:middle;font-family:serif;">$1</span>`,
          ),
        }}
      />

      <div
        className="w-full h-1 rounded-full mb-4 overflow-hidden"
        style={{ background: "var(--progress-track)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: isDone ? "var(--done-badge)" : "var(--green-medium)",
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => !isDone && onDecrement(zekr.id)}
          disabled={isDone}
          className={`px-5 py-2 rounded-xl font-bold text-sm transition-all duration-150 select-none ${
            isDone
              ? "cursor-not-allowed bg-green-900"
              : "text-white hover:scale-105 active:scale-95 shadow-sm hover:shadow-md bg-green-700"
          }`}
        >
          {isDone ? "✓ تمّ" : "سبّح"}
        </button>

        <div className="flex items-center gap-1">
          <span
            className="text-xl font-bold tabular-nums"
            style={{
              color: isDone ? "var(--text-muted)" : "var(--green-primary)",
            }}
          >
            {zekr.count - remaining}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            / {zekr.count}
          </span>
        </div>
      </div>
    </div>
  );
}
