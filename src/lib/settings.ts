/**
 * Application settings type and defaults.
 * Settings are persisted to localStorage for user convenience.
 */

export interface AppSettings {
  /** Root type name for generated code */
  rootTypeName: string;
  /** Whether to generate "type" or "interface" for TypeScript */
  outputStyle: "type" | "interface";
  /** Whether to add .strict() to Zod object schemas */
  strictObjects: boolean;
  /** Whether to detect ISO-8601 date strings */
  detectDates: boolean;
  /** Convert snake_case JSON keys to camelCase in TS output */
  snakeToCamel: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  rootTypeName: "Root",
  outputStyle: "type",
  strictObjects: false,
  detectDates: false,
  snakeToCamel: false,
};

const STORAGE_KEY = "json2tszod_settings";

/**
 * Load settings from localStorage, merging with defaults.
 */
export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage.
 */
export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}
