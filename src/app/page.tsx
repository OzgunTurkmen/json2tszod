"use client";

/**
 * Main page: single-page converter experience.
 * Orchestrates JSON input, settings, code generation, and keyboard shortcuts.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { EditorView } from "@codemirror/view";

import { Header } from "@/components/Header";
import { OutputPanel, type TabId } from "@/components/OutputPanel";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { StatusBar } from "@/components/StatusBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useSettings } from "@/hooks/useSettings";
import { useConverter } from "@/hooks/useConverter";
import { copyToClipboard } from "@/lib/clipboard";

// Dynamically import JsonEditor (requires browser APIs)
const JsonEditor = dynamic(
  () => import("@/components/JsonEditor").then((mod) => mod.JsonEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center text-muted text-sm">
        Loading editor...
      </div>
    ),
  }
);

export default function HomePage() {
  const [jsonInput, setJsonInput] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("typescript");
  const editorRef = useRef<EditorView | null>(null);

  const { settings, updateSettings, resetSettings, loaded } = useSettings();
  const result = useConverter(jsonInput, settings);

  // --- Handlers ---

  const handleSelectSample = useCallback((json: string) => {
    setJsonInput(json);
    toast.success("Sample loaded");
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (!result.typescript && !result.zod && !result.example) {
      toast.error("No output to copy");
      return;
    }

    const combined = [
      "// ============ TypeScript Types ============",
      result.typescript,
      "",
      "// ============ Zod Schemas ============",
      result.zod,
      "",
      "// ============ Example ============",
      result.example,
    ].join("\n");

    const ok = await copyToClipboard(combined);
    if (ok) {
      toast.success("All output copied to clipboard");
    } else {
      toast.error("Failed to copy");
    }
  }, [result.typescript, result.zod, result.example]);

  const handleCopyCurrentTab = useCallback(async () => {
    const codeMap: Record<string, string> = {
      typescript: result.typescript,
      zod: result.zod,
      example: result.example,
    };
    const code = codeMap[activeTab];
    if (!code) {
      toast.error("Nothing to copy");
      return;
    }
    const ok = await copyToClipboard(code);
    if (ok) {
      toast.success("Copied to clipboard");
    } else {
      toast.error("Failed to copy");
    }
  }, [activeTab, result.typescript, result.zod, result.example]);

  const focusEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // --- Keyboard Shortcuts ---

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd + Enter => trigger generate (already auto, but force immediate)
      if (mod && e.key === "Enter") {
        e.preventDefault();
        toast.info("Generating...");
      }

      // Ctrl/Cmd + Shift + C => copy current tab
      if (mod && e.shiftKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
        handleCopyCurrentTab();
      }

      // Ctrl/Cmd + K => focus JSON input
      if (mod && (e.key === "K" || e.key === "k") && !e.shiftKey) {
        e.preventDefault();
        focusEditor();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleCopyCurrentTab, focusEditor]);

  // Don't render until settings are loaded from localStorage
  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen text-muted text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <Header
        onSelectSample={handleSelectSample}
        onOpenSettings={() => setSettingsOpen(true)}
        onCopyAll={handleCopyAll}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: JSON Input */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-border overflow-hidden">
          <ErrorBoundary fallbackMessage="Editor failed to load">
            <JsonEditor
              value={jsonInput}
              onChange={setJsonInput}
              editorRef={editorRef}
            />
          </ErrorBoundary>
        </div>

        {/* Right: Output */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-hidden">
          <ErrorBoundary fallbackMessage="Output panel failed to render">
            <OutputPanel
              typescript={result.typescript}
              zod={result.zod}
              example={result.example}
              diagnostics={result.diagnostics}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </ErrorBoundary>
        </div>
      </main>

      {/* Status Bar */}
      <StatusBar
        isValid={result.isValid}
        isEmpty={!jsonInput.trim()}
        isProcessing={result.isProcessing}
        rootTypeName={result.rootTypeName}
        fieldCount={result.fieldCount}
      />

      {/* Settings Drawer */}
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
        onReset={resetSettings}
      />
    </div>
  );
}
