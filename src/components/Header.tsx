"use client";

/**
 * Header component with app branding, Samples dropdown, Settings, and Copy All.
 */

import { useState, useRef, useEffect } from "react";
import {
  Braces,
  ChevronDown,
  Settings,
  Copy,
  Keyboard,
} from "lucide-react";
import { SAMPLES, type Sample } from "@/lib/samples";

interface HeaderProps {
  onSelectSample: (json: string) => void;
  onOpenSettings: () => void;
  onCopyAll: () => void;
}

export function Header({
  onSelectSample,
  onOpenSettings,
  onCopyAll,
}: HeaderProps) {
  const [samplesOpen, setSamplesOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const samplesRef = useRef<HTMLDivElement>(null);
  const shortcutsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        samplesRef.current &&
        !samplesRef.current.contains(e.target as Node)
      ) {
        setSamplesOpen(false);
      }
      if (
        shortcutsRef.current &&
        !shortcutsRef.current.contains(e.target as Node)
      ) {
        setShortcutsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectSample(sample: Sample) {
    onSelectSample(sample.json);
    setSamplesOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4 py-2.5">
      {/* Left: Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
          <Braces className="h-4.5 w-4.5 text-accent" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            JSON2TSZod
          </h1>
          <p className="text-[10px] text-muted leading-none">
            Paste JSON. Get Types.
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Samples Dropdown */}
        <div ref={samplesRef} className="relative">
          <button
            onClick={() => setSamplesOpen(!samplesOpen)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface transition-colors"
            aria-expanded={samplesOpen}
            aria-haspopup="true"
          >
            Samples
            <ChevronDown className="h-3 w-3" />
          </button>
          {samplesOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 rounded-xl border border-border bg-surface shadow-xl shadow-black/20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-1.5">
                {SAMPLES.map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSample(sample)}
                    className="w-full text-left rounded-lg px-3 py-2 hover:bg-surface-hover transition-colors"
                  >
                    <div className="text-xs font-medium text-foreground">
                      {sample.name}
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">
                      {sample.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        <div ref={shortcutsRef} className="relative">
          <button
            onClick={() => setShortcutsOpen(!shortcutsOpen)}
            className="flex items-center justify-center rounded-lg w-8 h-8 text-muted hover:text-foreground hover:bg-surface transition-colors"
            aria-label="Keyboard shortcuts"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </button>
          {shortcutsOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 rounded-xl border border-border bg-surface shadow-xl shadow-black/20 overflow-hidden">
              <div className="p-3 space-y-2">
                <h3 className="text-xs font-semibold text-foreground mb-2">
                  Keyboard Shortcuts
                </h3>
                <Shortcut keys="Ctrl+Enter" action="Generate" />
                <Shortcut keys="Ctrl+Shift+C" action="Copy current tab" />
                <Shortcut keys="Ctrl+K" action="Focus JSON input" />
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center rounded-lg w-8 h-8 text-muted hover:text-foreground hover:bg-surface transition-colors"
          aria-label="Open settings"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* Copy All */}
        <button
          onClick={onCopyAll}
          className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
          title="Copy TypeScript + Zod + Example"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy All
        </button>
      </div>
    </header>
  );
}

function Shortcut({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-muted">{action}</span>
      <kbd className="rounded bg-background px-1.5 py-0.5 text-[10px] font-mono text-foreground border border-border">
        {keys}
      </kbd>
    </div>
  );
}
