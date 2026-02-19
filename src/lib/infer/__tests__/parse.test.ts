/**
 * Unit tests for JSON parser with diagnostics.
 */

import { describe, it, expect } from "vitest";
import { parseJSON } from "@/lib/infer/parse";

describe("parseJSON", () => {
  it("parses valid JSON object", () => {
    const result = parseJSON('{"name": "Alice"}');
    expect(result.value).toEqual({ name: "Alice" });
    expect(result.diagnostics.some((d) => d.level === "info")).toBe(true);
  });

  it("parses valid JSON array", () => {
    const result = parseJSON("[1, 2, 3]");
    expect(result.value).toEqual([1, 2, 3]);
  });

  it("returns error diagnostic for invalid JSON", () => {
    const result = parseJSON("{invalid}");
    expect(result.value).toBeNull();
    expect(result.diagnostics.some((d) => d.level === "error")).toBe(true);
    expect(result.diagnostics[0].message).toContain("parse error");
  });

  it("returns empty result for empty input", () => {
    const result = parseJSON("");
    expect(result.value).toBeNull();
    expect(result.diagnostics.length).toBe(0);
  });

  it("returns empty result for whitespace-only input", () => {
    const result = parseJSON("   \n  ");
    expect(result.value).toBeNull();
    expect(result.diagnostics.length).toBe(0);
  });
});
