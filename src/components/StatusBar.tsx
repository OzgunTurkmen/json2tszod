"use client";

/**
 * Status bar at the bottom: shows validation status, root type name,
 * field count, and quick copy buttons.
 */

import { CheckCircle2, XCircle, Hash, Type, Loader2 } from "lucide-react";

interface StatusBarProps {
  isValid: boolean;
  isEmpty: boolean;
  isProcessing: boolean;
  rootTypeName: string;
  fieldCount: number;
}

export function StatusBar({
  isValid,
  isEmpty,
  isProcessing,
  rootTypeName,
  fieldCount,
}: StatusBarProps) {
  return (
    <footer className="flex items-center justify-between border-t border-border bg-background/95 px-4 py-1.5">
      {/* Left: Status */}
      <div className="flex items-center gap-3">
        {isProcessing ? (
          <span className="flex items-center gap-1.5 text-[11px] text-accent">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing...
          </span>
        ) : isEmpty ? (
          <span className="text-[11px] text-muted">Waiting for input...</span>
        ) : isValid ? (
          <span className="flex items-center gap-1.5 text-[11px] text-success">
            <CheckCircle2 className="h-3 w-3" />
            Valid JSON
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] text-error">
            <XCircle className="h-3 w-3" />
            Invalid JSON
          </span>
        )}
      </div>

      {/* Right: Metadata */}
      <div className="flex items-center gap-4">
        {isValid && (
          <>
            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Type className="h-3 w-3" />
              {rootTypeName}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Hash className="h-3 w-3" />
              {fieldCount} field{fieldCount !== 1 ? "s" : ""}
            </span>
          </>
        )}
      </div>
    </footer>
  );
}
