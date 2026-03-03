export const VIEW_SIZE_STORAGE_KEY = "app-view-size";
export const ACCENT_STORAGE_KEY = "app-accent-color";

export const DEFAULT_VIEW_SIZE = 80;
export const DEFAULT_ACCENT = "#111827";

export const AVAILABLE_VIEW_SIZES = [75, 80, 90, 100] as const;
export const ACCENT_COLORS = [
  "#111827",
  "#1d4ed8",
  "#0f766e",
  "#7c3aed",
  "#be123c",
  "#ea580c",
] as const;

export const SETTINGS_SECTION_LINKS = [
  { href: "#general", label: "General" },
  { href: "#security", label: "Security & Policy" },
  { href: "#appearance", label: "Appearance" },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
] as const;

export const TIME_ZONE_OPTIONS = [
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh (GMT+7)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (GMT+7)" },
  { value: "UTC", label: "UTC (GMT+0)" },
] as const;

export const SESSION_TIMEOUT_OPTIONS = [
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "60m", label: "60 minutes" },
  { value: "120m", label: "120 minutes" },
] as const;

export function resolveInitialViewSize() {
  if (typeof window === "undefined") {
    return DEFAULT_VIEW_SIZE;
  }

  const saved = window.localStorage.getItem(VIEW_SIZE_STORAGE_KEY);
  if (!saved) {
    return DEFAULT_VIEW_SIZE;
  }

  const numeric = Number(saved);
  return AVAILABLE_VIEW_SIZES.includes(
    numeric as (typeof AVAILABLE_VIEW_SIZES)[number],
  )
    ? numeric
    : DEFAULT_VIEW_SIZE;
}

export function resolveInitialAccent() {
  if (typeof window === "undefined") {
    return DEFAULT_ACCENT;
  }

  const saved = window.localStorage.getItem(ACCENT_STORAGE_KEY);
  return saved || DEFAULT_ACCENT;
}

export function nearestViewSize(value: number) {
  return AVAILABLE_VIEW_SIZES.reduce((closest, current) =>
    Math.abs(current - value) < Math.abs(closest - value) ? current : closest,
  );
}
