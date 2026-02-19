/**
 * Unit tests for naming utilities.
 */

import { describe, it, expect } from "vitest";
import { NameGenerator, snakeToCamel, isSnakeCase } from "@/lib/infer/naming";

describe("NameGenerator", () => {
  it("generates PascalCase name from path segments", () => {
    const gen = new NameGenerator();
    expect(gen.generate(["root"])).toBe("Root");
    expect(gen.generate(["root", "user"])).toBe("RootUser");
    expect(gen.generate(["root", "user", "address"])).toBe("RootUserAddress");
  });

  it("deduplicates names with numeric suffix", () => {
    const gen = new NameGenerator();
    expect(gen.generate(["item"])).toBe("Item");
    expect(gen.generate(["item"])).toBe("Item2");
    expect(gen.generate(["item"])).toBe("Item3");
  });

  it("resets tracked names", () => {
    const gen = new NameGenerator();
    gen.generate(["item"]);
    gen.reset();
    expect(gen.generate(["item"])).toBe("Item");
  });
});

describe("snakeToCamel", () => {
  it("converts snake_case to camelCase", () => {
    expect(snakeToCamel("user_name")).toBe("userName");
    expect(snakeToCamel("created_at")).toBe("createdAt");
    expect(snakeToCamel("is_active")).toBe("isActive");
  });

  it("leaves non-snake strings unchanged", () => {
    expect(snakeToCamel("name")).toBe("name");
    expect(snakeToCamel("userName")).toBe("userName");
  });
});

describe("isSnakeCase", () => {
  it("detects snake_case strings", () => {
    expect(isSnakeCase("user_name")).toBe(true);
    expect(isSnakeCase("created_at")).toBe(true);
    expect(isSnakeCase("a_b_c")).toBe(true);
  });

  it("rejects non-snake_case strings", () => {
    expect(isSnakeCase("name")).toBe(false);
    expect(isSnakeCase("userName")).toBe(false);
    expect(isSnakeCase("Name")).toBe(false);
    expect(isSnakeCase("_private")).toBe(false);
  });
});
