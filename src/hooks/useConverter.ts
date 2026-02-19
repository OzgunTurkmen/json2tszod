/**
 * Converter hook: orchestrates JSON parsing, type inference, and code generation.
 * Debounces input, runs all generators, and returns results + diagnostics.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { parseJSON } from "@/lib/infer/parse";
import { inferType } from "@/lib/infer/infer";
import { generateTypeScript } from "@/lib/generate/typescript";
import { generateZod } from "@/lib/generate/zod";
import { generateExample } from "@/lib/generate/example";
import type { Diagnostic, GenerateSettings } from "@/lib/infer/types";
import type { AppSettings } from "@/lib/settings";
import { useDebounce } from "./useDebounce";

export interface ConvertResult {
  typescript: string;
  zod: string;
  example: string;
  diagnostics: Diagnostic[];
  isValid: boolean;
  fieldCount: number;
  rootTypeName: string;
  isProcessing: boolean;
}

const EMPTY_RESULT: ConvertResult = {
  typescript: "",
  zod: "",
  example: "",
  diagnostics: [],
  isValid: false,
  fieldCount: 0,
  rootTypeName: "Root",
  isProcessing: false,
};

export function useConverter(jsonInput: string, settings: AppSettings) {
  const [result, setResult] = useState<ConvertResult>(EMPTY_RESULT);
  const debouncedInput = useDebounce(jsonInput, 300);
  const abortRef = useRef(0);

  const convert = useCallback(
    async (input: string, currentSettings: AppSettings) => {
      const runId = ++abortRef.current;

      if (!input.trim()) {
        setResult(EMPTY_RESULT);
        return;
      }

      setResult((prev) => ({ ...prev, isProcessing: true }));

      // Parse JSON
      const parseResult = parseJSON(input);

      if (parseResult.value === null) {
        setResult({
          ...EMPTY_RESULT,
          diagnostics: parseResult.diagnostics,
          isValid: false,
        });
        return;
      }

      // Infer types
      const inferResult = inferType(parseResult.value, {
        rootTypeName: currentSettings.rootTypeName,
        detectDates: currentSettings.detectDates,
      });

      const allDiagnostics = [
        ...parseResult.diagnostics,
        ...inferResult.diagnostics,
      ];

      const genSettings: GenerateSettings = {
        rootTypeName: currentSettings.rootTypeName,
        outputStyle: currentSettings.outputStyle,
        strictObjects: currentSettings.strictObjects,
        detectDates: currentSettings.detectDates,
        snakeToCamel: currentSettings.snakeToCamel,
      };

      // Generate code (async due to Prettier)
      try {
        const [typescript, zod, example] = await Promise.all([
          generateTypeScript(inferResult.type, genSettings),
          generateZod(inferResult.type, genSettings),
          generateExample(inferResult.type, genSettings),
        ]);

        // Only update if this is still the latest run
        if (runId !== abortRef.current) return;

        setResult({
          typescript,
          zod,
          example,
          diagnostics: allDiagnostics,
          isValid: true,
          fieldCount: inferResult.fieldCount,
          rootTypeName: currentSettings.rootTypeName,
          isProcessing: false,
        });
      } catch (err) {
        if (runId !== abortRef.current) return;

        allDiagnostics.push({
          level: "error",
          message: `Code generation error: ${err instanceof Error ? err.message : "Unknown error"}`,
          path: "",
        });

        setResult({
          ...EMPTY_RESULT,
          diagnostics: allDiagnostics,
          isValid: false,
        });
      }
    },
    []
  );

  useEffect(() => {
    convert(debouncedInput, settings);
  }, [debouncedInput, settings, convert]);

  return result;
}
