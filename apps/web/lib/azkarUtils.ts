export const calculateZekrDuration = (t: string) =>
  Math.max(5, Math.min(15, Math.ceil(t.trim().split(/\s+/).length * 0.7)));
