"use client";

/**
 * Settings drawer (slide-out panel).
 * Configures root type name, output style, strict objects, date detection,
 * and snake_case to camelCase conversion.
 */

import { useEffect, useRef } from "react";
import { X, RotateCcw } from "lucide-react";
import type { AppSettings } from "@/lib/settings";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
  onReset: () => void;
}

export function SettingsDrawer({
  open,
  onClose,
  settings,
  onUpdate,
  onReset,
}: SettingsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (open && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        tabIndex={-1}
        className="fixed right-0 top-0 z-50 h-full w-80 max-w-[90vw] bg-surface border-l border-border shadow-2xl shadow-black/30 overflow-y-auto outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Settings</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onReset}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-lg w-7 h-7 text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Settings body */}
        <div className="p-4 space-y-5">
          {/* Root Type Name */}
          <SettingGroup label="Root Type Name" description="Name for the root type/schema">
            <input
              type="text"
              value={settings.rootTypeName}
              onChange={(e) => onUpdate({ rootTypeName: e.target.value || "Root" })}
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground font-mono focus:outline-none focus:border-accent transition-colors"
              placeholder="Root"
              spellCheck={false}
            />
          </SettingGroup>

          {/* Output Style */}
          <SettingGroup label="TypeScript Output" description="How to declare object types">
            <div className="flex gap-2">
              <RadioButton
                selected={settings.outputStyle === "type"}
                onClick={() => onUpdate({ outputStyle: "type" })}
                label="export type"
              />
              <RadioButton
                selected={settings.outputStyle === "interface"}
                onClick={() => onUpdate({ outputStyle: "interface" })}
                label="export interface"
              />
            </div>
          </SettingGroup>

          {/* Strict Objects */}
          <SettingGroup label="Strict Objects" description="Add .strict() to Zod object schemas">
            <Toggle
              checked={settings.strictObjects}
              onChange={(v) => onUpdate({ strictObjects: v })}
            />
          </SettingGroup>

          {/* Detect ISO Dates */}
          <SettingGroup
            label="Detect ISO Dates"
            description="Map ISO-8601 date strings to z.string().datetime()"
          >
            <Toggle
              checked={settings.detectDates}
              onChange={(v) => onUpdate({ detectDates: v })}
            />
          </SettingGroup>

          {/* Snake to Camel */}
          <SettingGroup
            label="Snake → Camel"
            description="Convert snake_case keys to camelCase in TypeScript output"
          >
            <Toggle
              checked={settings.snakeToCamel}
              onChange={(v) => onUpdate({ snakeToCamel: v })}
            />
          </SettingGroup>
        </div>
      </div>
    </>
  );
}

// --- Sub-components ---

function SettingGroup({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground">{label}</label>
      <p className="text-[10px] text-muted mt-0.5 mb-2">{description}</p>
      {children}
    </div>
  );
}

function RadioButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-mono transition-colors ${
        selected
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-background text-muted hover:text-foreground hover:border-border-active"
      }`}
    >
      {label}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
