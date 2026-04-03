"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ListChecks,
  Bell,
  BellOff,
} from "lucide-react";
import {
  getAllAzkars,
  getDisabledIds,
  getNotifDisabledIds,
  addCustomZekr,
  deleteCustomZekr,
  toggleZekrStatus,
  toggleZekrNotifStatus,
  toggleAllZekrStatus,
  toggleAllZekrNotifStatus,
} from "@/lib/azkarStore";
import type { Zekr } from "@/types";

const cardStyle = {
  background: "var(--bg-card)",
  borderColor: "var(--border-color)",
};

const inputStyle = {
  background: "var(--input-bg)",
  borderColor: "var(--border-color)",
  color: "var(--text-primary)",
};

export default function ManageAzkarPage() {
  const [azkars, setAzkars] = useState<Zekr[]>([]);
  const [disabledIds, setDisabledIds] = useState<number[]>([]);
  const [notifDisabledIds, setNotifDisabledIds] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  const [text, setText] = useState("");
  const [count, setCount] = useState(1);
  const [category, setCategory] = useState<"morning" | "evening">("morning");
  const [note, setNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [tab, setTab] = useState<"morning" | "evening">("morning");

  const reload = useCallback(() => {
    setAzkars(getAllAzkars());
    setDisabledIds(getDisabledIds());
    setNotifDisabledIds(getNotifDisabledIds());
  }, []);

  useEffect(() => {
    setMounted(true);
    reload();

    const handleUpdate = () => reload();
    window.addEventListener("azkar-updated", handleUpdate);
    return () => window.removeEventListener("azkar-updated", handleUpdate);
  }, [reload]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addCustomZekr({
      text: text.trim(),
      count: Math.max(1, count),
      category,
      note: note.trim() || undefined,
    });
    setText("");
    setCount(1);
    setNote("");
    setIsAdding(false);
  };

  const visibleAzkars = azkars.filter((z) => z.category === tab);

  const handleToggleAllStatus = (enabled: boolean) => {
    toggleAllZekrStatus(
      visibleAzkars.map((z) => z.id),
      enabled,
    );
  };

  const handleToggleAllNotif = (enabled: boolean) => {
    toggleAllZekrNotifStatus(
      visibleAzkars.map((z) => z.id),
      enabled,
    );
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen flex flex-col pb-10"
      dir="rtl"
      style={{ background: "var(--bg-primary)" }}
    >
      <header
        className="sticky top-0 z-10 px-4 pt-5 pb-4 shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)",
        }}
      >
        <div className="flex items-center justify-between" dir="ltr">
          <Link
            href="/azkar"
            className="text-white/70 hover:text-white transition-colors text-xl w-8 flex items-center"
          >
            <ArrowLeft />
          </Link>
          <h1 className="text-white text-xl font-bold flex items-center gap-2">
            إدارة الأذكار
            <ListChecks />
          </h1>
          <span className="w-8" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6 max-w-2xl w-full mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex bg-[var(--input-bg)] p-1 rounded-xl">
            <button
              onClick={() => setTab("morning")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                tab === "morning"
                  ? "bg-green-800 text-white shadow"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              الصباح
            </button>
            <button
              onClick={() => setTab("evening")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                tab === "evening"
                  ? "bg-green-800 text-white shadow"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              المساء
            </button>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ background: "var(--green-primary)" }}
          >
            {isAdding ? "إلغاء" : "إضافة ذكر"}
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs font-medium px-2 py-1 mb-2">
          <div className="flex items-center gap-3">
            <span style={{ color: "var(--text-muted)" }}>القائمة:</span>
            <button
              onClick={() => handleToggleAllStatus(true)}
              className="text-green-600 hover:text-green-700 transition"
            >
              تفعيل
            </button>
            <button
              onClick={() => handleToggleAllStatus(false)}
              className="text-gray-400 hover:text-red-500 transition"
            >
              إخفاء
            </button>
          </div>
          <div className="w-4 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-3">
            <span style={{ color: "var(--text-muted)" }}>الإشعارات:</span>
            <button
              onClick={() => handleToggleAllNotif(true)}
              className="text-green-600 hover:text-green-700 transition"
            >
              تفعيل
            </button>
            <button
              onClick={() => handleToggleAllNotif(false)}
              className="text-gray-400 hover:text-red-500 transition"
            >
              صامت
            </button>
          </div>
        </div>

        {isAdding && (
          <form
            onSubmit={handleAdd}
            className="rounded-2xl p-5 shadow-sm border space-y-4"
            style={cardStyle}
          >
            <div>
              <label
                className="text-sm block mb-1 font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                الذكر
              </label>
              <textarea
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border text-sm focus:outline-none transition-colors"
                style={inputStyle}
                rows={3}
                placeholder="اكتب الذكر هنا..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="text-sm block mb-1 font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  العدد
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl border text-sm focus:outline-none transition-colors"
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  className="text-sm block mb-1 font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  الفئة
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl border text-sm focus:outline-none transition-colors"
                  style={inputStyle}
                >
                  <option value="morning">الصباح</option>
                  <option value="evening">المساء</option>
                </select>
              </div>
            </div>

            <div>
              <label
                className="text-sm block mb-1 font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                ملاحظة فضل الذكر (اختياري)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border text-sm focus:outline-none transition-colors"
                style={inputStyle}
                placeholder="مثال: من قالها حين يصبح..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 mt-2"
              style={{ background: "var(--green-primary)" }}
            >
              حفظ الذكر
            </button>
          </form>
        )}

        <div className="space-y-3">
          {visibleAzkars.map((zekr) => {
            const isEnabled = !disabledIds.includes(zekr.id);
            const isNotifEnabled = !notifDisabledIds.includes(zekr.id);
            return (
              <div
                key={zekr.id}
                className="rounded-2xl p-4 shadow-sm border flex flex-col gap-3 transition-opacity"
                style={{
                  ...cardStyle,
                  opacity: isEnabled ? 1 : 0.5,
                }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p
                      className="arabic-text text-base leading-relaxed"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {zekr.text}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                          background: "var(--input-bg)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        العدد: {zekr.count}
                      </span>
                      {zekr.note && (
                        <span
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{
                            background: "var(--input-bg)",
                            color: "var(--green-primary)",
                          }}
                        >
                          {zekr.note}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          toggleZekrNotifStatus(zekr.id, !isNotifEnabled)
                        }
                        className="relative p-1 rounded-full transition-colors duration-300 focus:outline-none"
                        title={isNotifEnabled ? "يظهر في الإشعارات" : "صامت"}
                        style={{
                          background: isNotifEnabled
                            ? "var(--green-800, #1B5E20)"
                            : "var(--gray-400, #9ca3af)",
                          color: "white",
                        }}
                      >
                        {isNotifEnabled ? (
                          <Bell className="w-4 h-4 m-0.5" />
                        ) : (
                          <BellOff className="w-4 h-4 m-0.5" />
                        )}
                      </button>

                      <button
                        onClick={() => toggleZekrStatus(zekr.id, !isEnabled)}
                        className={`relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
                          isEnabled ? "bg-green-800" : "bg-gray-400"
                        }`}
                      >
                        <span
                          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                          style={{
                            left: isEnabled
                              ? "0.125rem"
                              : "calc(100% - 1.375rem)",
                          }}
                        />
                      </button>
                    </div>

                    {zekr.isCustom && (
                      <button
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا الذكر؟")) {
                            deleteCustomZekr(zekr.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 transition"
                        title="حذف الذكر المخصص"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {visibleAzkars.length === 0 && (
            <p
              className="text-center py-6"
              style={{ color: "var(--text-muted)" }}
            >
              لا توجد أذكار
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
