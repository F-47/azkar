"use client";

import { HtmlContent } from "@/components/HtmlContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  addCustomZekr,
  deleteCustomZekr,
  getAllAzkars,
  getDisabledIds,
  getNotifDisabledIds,
  toggleAllZekrNotifStatus,
  toggleAllZekrStatus,
  toggleZekrNotifStatus,
  toggleZekrStatus,
} from "@/lib/azkarStore";
import { cn } from "@/lib/utils";
import { localizedPath } from "@/lib/i18n/routes";
import type { Zekr } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  ListChecks,
  Plus,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function ManageAzkarPage() {
  const locale = useLocale();
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const t = useTranslations("manage");
  const common = useTranslations("common");
  const [azkars, setAzkars] = useState<Zekr[]>(() => getAllAzkars());
  const [disabledIds, setDisabledIds] = useState<number[]>(() =>
    getDisabledIds(),
  );
  const [notifDisabledIds, setNotifDisabledIds] = useState<number[]>(() =>
    getNotifDisabledIds(),
  );
  const [text, setText] = useState("");
  const [transliteration, setTransliteration] = useState("");
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
    const timer = setTimeout(() => reload(), 0);
    const handleUpdate = () => reload();
    window.addEventListener("azkar-updated", handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("azkar-updated", handleUpdate);
    };
  }, [reload]);

  const visibleAzkars = azkars.filter((z) => z.category === tab);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addCustomZekr({
      text: text.trim(),
      transliteration: transliteration.trim() || undefined,
      count: Math.max(1, count),
      category,
      note: note.trim() || undefined,
    });
    setText("");
    setTransliteration("");
    setCount(1);
    setNote("");
    setIsAdding(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_60%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-yellow-500">
            <ListChecks className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">{t("title")}</h1>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-xl bg-white/5 border border-yellow-500/20 focus-visible:ring-yellow-500/20 focus-visible:border-yellow-500 text-muted-foreground hover:text-yellow-500 transition-all"
          asChild
        >
          <Link href={localizedPath(locale, "/azkar/")}>
            <BackIcon className="w-5 h-5" />
          </Link>
        </Button>
      </header>

      <main className="flex-1 w-full px-4 py-8 relative z-10 max-w-2xl mx-auto space-y-8">
        <div className="flex w-full flex-col gap-6 md:flex-row md:items-center md:justify-between bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-sm">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 gap-2">
            <TabButton
              active={tab === "morning"}
              onClick={() => setTab("morning")}
            >
              {t("morningTitle")}
            </TabButton>
            <TabButton
              active={tab === "evening"}
              onClick={() => setTab("evening")}
            >
              {t("eveningTitle")}
            </TabButton>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            className={cn(
              "rounded-lg h-11 px-6 font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2",
              isAdding
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                : "bg-primary text-primary-foreground",
            )}
          >
            {isAdding ? t("cancelAdd") : t("add")}
            {isAdding ? (
              <X className="w-4 h-4" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
          </Button>
        </div>

        {!isAdding && (
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 rounded-xl border border-white/5 shadow-inner">
            <BulkActions
              label={t("visibleSection")}
              primary={t("enableAll")}
              secondary={t("hideAll")}
              onPrimary={() =>
                toggleAllZekrStatus(
                  visibleAzkars.map((z) => z.id),
                  true,
                )
              }
              onSecondary={() =>
                toggleAllZekrStatus(
                  visibleAzkars.map((z) => z.id),
                  false,
                )
              }
            />
            <div className="w-px h-8 bg-white/5 hidden md:block" />
            <BulkActions
              alignEnd
              label={t("desktopNotifications")}
              primary={t("enable")}
              secondary={t("silent")}
              onPrimary={() =>
                toggleAllZekrNotifStatus(
                  visibleAzkars.map((z) => z.id),
                  true,
                )
              }
              onSecondary={() =>
                toggleAllZekrNotifStatus(
                  visibleAzkars.map((z) => z.id),
                  false,
                )
              }
            />
          </div>
        )}

        {isAdding && (
          <Card className="rounded-xl p-8 border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-300">
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold">{t("add")}</h3>
              </div>

              <div className="space-y-4">
                <Field label={t("zekr")}>
                  <Textarea
                    required
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full text-base min-h-30"
                    placeholder={t("zekrPlaceholder")}
                  />
                </Field>
                <Field label={t("transliteration")}>
                  <Textarea
                    value={transliteration}
                    onChange={(e) => setTransliteration(e.target.value)}
                    dir="ltr"
                    className="w-full min-h-24 text-left text-base"
                    placeholder={t("transliterationPlaceholder")}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t("defaultCount")}>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="py-3 px-5 text-lg"
                    />
                  </Field>
                  <Field label={t("categoryType")}>
                    <Select
                      value={category}
                      onValueChange={(value: "morning" | "evening") =>
                        setCategory(value)
                      }
                    >
                      <SelectTrigger className="w-full h-12 px-5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all">
                        <SelectValue placeholder={t("selectType")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-white/10">
                        <SelectItem value="morning">
                          {common("morning")}
                        </SelectItem>
                        <SelectItem value="evening">
                          {common("evening")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label={t("note")}>
                  <Input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="py-3 px-5 placeholder:text-muted-foreground/30 font-medium"
                    placeholder={t("notePlaceholder")}
                  />
                </Field>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-lg active:scale-[0.98] transition-all"
              >
                {t("saveZekr")}
              </Button>
            </form>
          </Card>
        )}

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {visibleAzkars.map((zekr) => {
            const isEnabled = !disabledIds.includes(zekr.id);
            const isNotifEnabled = !notifDisabledIds.includes(zekr.id);
            return (
              <Card
                key={zekr.id}
                className={cn(
                  "group relative rounded-xl p-6 border transition-all duration-500 overflow-hidden",
                  isEnabled
                    ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    : "bg-white/2 border-white/5 opacity-50 grayscale shadow-none",
                )}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex-1 space-y-3">
                    <HtmlContent
                      content={zekr.text}
                      className="arabic-text text-lg leading-[2.1] mb-2 text-right whitespace-pre-line text-foreground/90 transition-all duration-500"
                      badgeClassName="inline-flex items-center justify-center bg-primary/20 text-primary text-sm font-bold rounded-full w-7 h-7 mx-1.5 align-middle font-serif border border-primary/20"
                    />
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-muted-foreground">
                        {t("countLabel", { count: zekr.count })}
                      </span>
                      {zekr.note && (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-primary/10 border border-primary/10 text-primary">
                          {zekr.note}
                        </span>
                      )}
                      {zekr.isCustom && (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/10 text-amber-500">
                          {t("custom")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="flex items-center gap-2 flex-1 md:flex-none">
                      <Button
                        onClick={() =>
                          toggleZekrNotifStatus(zekr.id, !isNotifEnabled)
                        }
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                          isNotifEnabled
                            ? "bg-accent/10 text-accent border border-accent/20 hover:bg-accent/10"
                            : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10",
                        )}
                        title={
                          isNotifEnabled
                            ? t("shownInNotifications")
                            : t("hiddenFromNotifications")
                        }
                      >
                        {isNotifEnabled ? (
                          <Bell className="w-4 h-4" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        onClick={() => toggleZekrStatus(zekr.id, !isEnabled)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative px-1",
                          isEnabled
                            ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10"
                            : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10",
                        )}
                        title={
                          isEnabled ? t("shownInList") : t("hiddenFromList")
                        }
                      >
                        {isEnabled ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {zekr.isCustom && (
                      <button
                        onClick={() => {
                          if (confirm(t("deleteConfirm"))) {
                            deleteCustomZekr(zekr.id);
                          }
                        }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                        title={t("deleteCustom")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {visibleAzkars.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
              <p className="text-lg font-bold text-muted-foreground/50">
                {t("emptyCategory")}
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 px-4 text-center text-muted-foreground/20 relative z-10 border-t border-white/5 mt-auto">
        <p className="text-xs uppercase tracking-[0.3em]">{t("footer")}</p>
      </footer>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-2 text-sm font-bold transition-all duration-300 w-full md:w-fit rounded-md",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function BulkActions({
  label,
  primary,
  secondary,
  onPrimary,
  onSecondary,
  alignEnd = false,
}: {
  label: string;
  primary: string;
  secondary: string;
  onPrimary: () => void;
  onSecondary: () => void;
  alignEnd?: boolean;
}) {
  return (
    <div className="flex items-center gap-6">
      <div className={cn("flex flex-col gap-1.5", alignEnd && "items-end")}>
        <span className="text-xs uppercase text-muted-foreground/50">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onPrimary}
            className="text-xs font-bold text-primary hover:text-green-400 transition-colors"
          >
            {primary}
          </button>
          <div className="w-px h-3 bg-white/10" />
          <button
            onClick={onSecondary}
            className="text-xs font-bold text-muted-foreground hover:text-red-400 transition-colors"
          >
            {secondary}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase text-muted-foreground px-1">
        {label}
      </label>
      {children}
    </div>
  );
}
