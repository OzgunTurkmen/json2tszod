/**
 * Settings hook: manages app settings state with localStorage persistence.
 */

import { useState, useCallback, useEffect } from "react";
import {
  type AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from "@/lib/settings";

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setSettingsState(loadSettings());
    setLoaded(true);
  }, []);

  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, ...updates };
        saveSettings(next);
        return next;
      });
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings, loaded };
}
