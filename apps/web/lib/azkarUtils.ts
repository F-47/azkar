export const calculateZekrDuration = (t: string, factor: number = 1.0) =>
  Math.max(
    5,
    Math.min(30, Math.ceil(t.trim().split(/\s+/).length * 0.8 * factor)),
  );
