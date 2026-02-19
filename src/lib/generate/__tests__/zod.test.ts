/**
 * Unit tests for the Zod schema generator.
 */

import { describe, it, expect } from "vitest";
import { inferType } from "@/lib/infer/infer";
import { generateZod } from "@/lib/generate/zod";
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
  return generateZod(result.type, { ...DEFAULT_GEN_SETTINGS, ...settings });
}

describe("generateZod", () => {
  it("generates z.object with z.string and z.number", async () => {
    const output = await generate({ name: "Alice", age: 30 });
    expect(output).toContain("z.object");
    expect(output).toContain("z.string()");
    expect(output).toContain("z.number()");
  });

  it("generates .nullable() for null fields", async () => {
    const output = await generate({ bio: null });
    expect(output).toContain(".nullable()");
  });

  it("generates .strict() when enabled", async () => {
    const output = await generate({ x: 1 }, { strictObjects: true });
    expect(output).toContain(".strict()");
  });

  it("generates z.string().datetime() for date strings when enabled", async () => {
    const output = await generate(
      { createdAt: "2025-01-15T09:30:00.000Z" },
      { detectDates: true }
    );
    expect(output).toContain("z.string().datetime()");
  });

  it("generates z.infer type export", async () => {
    const output = await generate({ x: 1 });
    expect(output).toContain("z.infer<typeof rootSchema>");
  });

  it("generates z.array for arrays", async () => {
    const output = await generate({ items: [1, 2, 3] });
    expect(output).toContain("z.array");
  });

  it("generates zod import statement", async () => {
    const output = await generate({ x: 1 });
    expect(output).toContain('import { z } from "zod"');
  });
});
