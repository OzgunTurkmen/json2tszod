"use client";

/**
 * Tabbed output panel with TypeScript, Zod, Example, and Diagnostics tabs.
 * Each code tab has copy and download buttons.
 * Uses CodeMirror in read-only mode for syntax-highlighted output.
 */

import { useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import {
  Copy,
  Download,
  FileType,
  Shield,
  Code2,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import { downloadFile } from "@/lib/download";
import { DiagnosticsView } from "./DiagnosticsView";
import type { Diagnostic } from "@/lib/infer/types";

type TabId = "typescript" | "zod" | "example" | "diagnostics";

interface Tab {
  id: TabId;
  label: string;
  icon: typeof FileType;
  filename?: string;
}

const TABS: Tab[] = [
  { id: "typescript", label: "TypeScript", icon: FileType, filename: "types.ts" },
  { id: "zod", label: "Zod", icon: Shield, filename: "schema.ts" },
  { id: "example", label: "Example", icon: Code2, filename: "example.ts" },
  { id: "diagnostics", label: "Diagnostics", icon: Activity },
];

interface OutputPanelProps {
  typescript: string;
  zod: string;
  example: string;
  diagnostics: Diagnostic[];
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

/** Custom read-only theme */
const readOnlyTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    padding: "8px 0",
  },
  ".cm-content": {
    padding: "0 8px",
  },
  ".cm-line": {
    padding: "0 4px",
  },
});

export function OutputPanel({
  typescript,
  zod,
  example,
  diagnostics,
  activeTab: controlledTab,
  onTabChange,
}: OutputPanelProps) {
  const [internalTab, setInternalTab] = useState<TabId>("typescript");
  const activeTab = controlledTab ?? internalTab;

  const setActiveTab = useCallback(
    (tab: TabId) => {
      if (onTabChange) {
        onTabChange(tab);
      } else {
        setInternalTab(tab);
      }
    },
    [onTabChange]
  );

  const codeForTab: Record<string, string> = {
    typescript,
    zod,
    example,
  };

  const handleCopy = useCallback(
    async (tabId: TabId) => {
      const code = codeForTab[tabId];
      if (!code) return;
      const ok = await copyToClipboard(code);
      if (ok) {
        toast.success("Copied to clipboard");
      } else {
        toast.error("Failed to copy");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typescript, zod, example]
  );

  const handleDownload = useCallback(
    (tabId: TabId) => {
      const tab = TABS.find((t) => t.id === tabId);
      const code = codeForTab[tabId];
      if (!code || !tab?.filename) return;
      downloadFile(code, tab.filename, "text/typescript");
      toast.success(`Downloaded ${tab.filename}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typescript, zod, example]
  );

  const currentCode = codeForTab[activeTab] ?? "";
  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const isCodeTab = activeTab !== "diagnostics";
  const diagnosticErrors = diagnostics.filter((d) => d.level === "error").length;
  const diagnosticWarnings = diagnostics.filter((d) => d.level === "warning").length;

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-border">
        <div
          className="flex items-center"
          role="tablist"
          aria-label="Output tabs"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.id === "diagnostics" &&
                  (diagnosticErrors > 0 || diagnosticWarnings > 0) && (
                    <span
                      className={`ml-1 min-w-[16px] rounded-full px-1 py-0.5 text-[9px] font-semibold leading-none ${
                        diagnosticErrors > 0
                          ? "bg-error/20 text-error"
                          : "bg-warning/20 text-warning"
                      }`}
                    >
                      {diagnosticErrors + diagnosticWarnings}
                    </span>
                  )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab actions */}
        {isCodeTab && currentCode && (
          <div className="flex items-center gap-0.5 pr-2">
            <button
              onClick={() => handleCopy(activeTab)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted hover:text-foreground hover:bg-surface transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="h-3 w-3" />
              Copy
            </button>
            {currentTab.filename && (
              <button
                onClick={() => handleDownload(activeTab)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted hover:text-foreground hover:bg-surface transition-colors"
                title={`Download as ${currentTab.filename}`}
              >
                <Download className="h-3 w-3" />
                {currentTab.filename}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab content */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={activeTab}
        className="flex-1 overflow-hidden"
      >
        {activeTab === "diagnostics" ? (
          <DiagnosticsView diagnostics={diagnostics} />
        ) : currentCode ? (
          <CodeMirror
            value={currentCode}
            extensions={[
              javascript({ typescript: true }),
              readOnlyTheme,
            ]}
            theme={oneDark}
            height="100%"
            style={{ height: "100%" }}
            readOnly
            editable={false}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: false,
              highlightActiveLine: false,
              foldGutter: true,
              autocompletion: false,
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted p-8">
            <currentTab.icon className="h-8 w-8 mb-3 opacity-40" />
            <p className="text-sm">No output yet.</p>
            <p className="text-xs mt-1 opacity-60">
              Paste valid JSON on the left to generate code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export type { TabId };
