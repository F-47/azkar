export type Category = "morning" | "evening";

export interface Zekr {
  id: number;
  text: string;
  count: number;
  category: Category;
  note?: string;
  isCustom?: boolean;
}

export interface ZekrProgress {
  id: number;
  remaining: number;
}

export type ProgressMap = Record<number, number>;
