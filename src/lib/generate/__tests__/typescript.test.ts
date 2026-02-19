/**
 * Unit tests for the TypeScript code generator.
 */

import { describe, it, expect } from "vitest";
import { inferType } from "@/lib/infer/infer";
import { generateTypeScript } from "@/lib/generate/typescript";
import type { GenerateSettings } from "@/lib/infer/types";

const DEFAULT_GEN_SETTINGS: GenerateSettings = {
  rootTypeName: "Root",
  outputStyle: "type",
  strictObjects: false,
  detectDates: false,
  snakeToCamel: false,
};

async function generate(value: unknown, settings?: Partial<GenerateSettings>) {
  const result = inferType(value, {
    rootTypeName: settings?.rootTypeName ?? "Root",
    detectDates: settings?.detectDates ?? false,
  });
  return generateTypeScript(result.type, { ...DEFAULT_GEN_SETTINGS, ...settings });
}

describe("generateTypeScript", () => {
  it("generates export type for simple object", async () => {
    const output = await generate({ name: "Alice", age: 30 });
    expect(output).toContain("export type Root");
    expect(output).toContain("name: string");
    expect(output).toContain("age: number");
  });

  it("generates export interface when configured", async () => {
    const output = await generate(
      { name: "Alice" },
      { outputStyle: "interface" }
    );
    expect(output).toContain("export interface Root");
  });

  it("generates nullable types", async () => {
    const output = await generate({ deletedAt: null });
    expect(output).toContain("| null");
  });

  it("generates optional fields for arrays with inconsistent keys", async () => {
    const output = await generate([
      { id: 1, name: "A" },
      { id: 2 },
    ]);
    expect(output).toContain("name?:");
  });

  it("generates array types", async () => {
    const output = await generate({ tags: ["a", "b"] });
    expect(output).toContain("string[]");
  });

  it("converts snake_case to camelCase when enabled", async () => {
    const output = await generate(
      { user_name: "Alice" },
      { snakeToCamel: true }
    );
    expect(output).toContain("userName");
  });
});
