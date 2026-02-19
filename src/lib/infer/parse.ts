/**
 * JSON parser with enhanced diagnostics.
 * Wraps JSON.parse to extract line/column on errors and check size limits.
 */

import type { Diagnostic } from "./types";

/** 1MB size limit for performance warning */
const SIZE_LIMIT = 1024 * 1024;

export interface ParseResult {
  value: unknown | null;
  diagnostics: Diagnostic[];
}

/**
 * Parse a JSON string with diagnostics.
 * Returns the parsed value (or null on error) plus an array of diagnostics.
 */
export function parseJSON(input: string): ParseResult {
  const diagnostics: Diagnostic[] = [];

  if (!input.trim()) {
    return { value: null, diagnostics: [] };
  }

  // Size check
  if (input.length > SIZE_LIMIT) {
    diagnostics.push({
      level: "warning",
      message: `Input is ${(input.length / 1024 / 1024).toFixed(1)}MB. Large inputs may slow down the browser.`,
      path: "",
    });
  }

  try {
    const value = JSON.parse(input);
    diagnostics.push({
      level: "info",
      message: "JSON parsed successfully.",
      path: "",
    });
    return { value, diagnostics };
  } catch (err) {
    const errorMessage =
      err instanceof SyntaxError ? err.message : "Unknown parse error";

    // Try to extract position info from error message
    // Common formats: "at position 42", "at line 3 column 5"
    const posMatch = errorMessage.match(/position\s+(\d+)/i);
    const lineColMatch = errorMessage.match(
      /line\s+(\d+)\s+column\s+(\d+)/i
    );

    let locationInfo = "";
    if (lineColMatch) {
      locationInfo = ` (line ${lineColMatch[1]}, column ${lineColMatch[2]})`;
    } else if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const { line, column } = positionToLineCol(input, pos);
      locationInfo = ` (line ${line}, column ${column})`;
    }

    diagnostics.push({
      level: "error",
      message: `JSON parse error${locationInfo}: ${errorMessage}`,
      path: "",
    });

    return { value: null, diagnostics };
  }
}

/**
 * Convert a character position to line and column numbers.
 */
function positionToLineCol(
  input: string,
  pos: number
): { line: number; column: number } {
  let line = 1;
  let column = 1;
  for (let i = 0; i < pos && i < input.length; i++) {
    if (input[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}
