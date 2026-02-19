"use client";

/**
 * Diagnostics view showing structured messages from parsing and inference.
 * Displays errors, warnings, and info messages with appropriate icons.
 */

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { Diagnostic, DiagnosticLevel } from "@/lib/infer/types";

interface DiagnosticsViewProps {
  diagnostics: Diagnostic[];
}

const LEVEL_CONFIG: Record<
  DiagnosticLevel,
  { icon: typeof AlertCircle; color: string; bg: string; label: string }
> = {
  error: {
    icon: AlertCircle,
    color: "text-error",
    bg: "bg-error/10",
    label: "Error",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "Warning",
  },
  info: {
    icon: Info,
    color: "text-accent",
    bg: "bg-accent/10",
    label: "Info",
  },
};

export function DiagnosticsView({ diagnostics }: DiagnosticsViewProps) {
  if (diagnostics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted p-8">
        <Info className="h-8 w-8 mb-3 opacity-40" />
        <p className="text-sm">No diagnostics yet.</p>
        <p className="text-xs mt-1 opacity-60">
          Paste JSON to see parsing and inference results.
        </p>
      </div>
    );
  }

  const errorCount = diagnostics.filter((d) => d.level === "error").length;
  const warningCount = diagnostics.filter((d) => d.level === "warning").length;
  const infoCount = diagnostics.filter((d) => d.level === "info").length;

  return (
    <div className="h-full flex flex-col">
      {/* Summary bar */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border text-[11px]">
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-error">
            <AlertCircle className="h-3 w-3" />
            {errorCount} error{errorCount !== 1 ? "s" : ""}
          </span>
        )}
        {warningCount > 0 && (
          <span className="flex items-center gap-1 text-warning">
            <AlertTriangle className="h-3 w-3" />
            {warningCount} warning{warningCount !== 1 ? "s" : ""}
          </span>
        )}
        {infoCount > 0 && (
          <span className="flex items-center gap-1 text-accent">
            <Info className="h-3 w-3" />
            {infoCount} info
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {diagnostics.map((diag, i) => {
          const config = LEVEL_CONFIG[diag.level];
          const Icon = config.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-2.5 rounded-lg px-3 py-2 ${config.bg}`}
            >
              <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${config.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground leading-relaxed">
                  {diag.message}
                </p>
                {diag.path && (
                  <p className="text-[10px] text-muted mt-0.5 font-mono">
                    at {diag.path}
                  </p>
                )}
              </div>
              <span
                className={`text-[9px] uppercase font-semibold tracking-wider ${config.color} shrink-0`}
              >
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
