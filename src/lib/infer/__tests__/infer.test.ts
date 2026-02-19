/**
 * Unit tests for the type inference engine.
 * Tests cover: primitives, nulls, objects, arrays, optionals, unions,
 * empty arrays, nested naming, date detection, and deduplication.
 */

import { describe, it, expect } from "vitest";
import { inferType } from "@/lib/infer/infer";
import type { InferSettings, InferredType, ObjectType } from "@/lib/infer/types";

const DEFAULT_SETTINGS: InferSettings = {
  rootTypeName: "Root",
  detectDates: false,
};

function infer(value: unknown, settings?: Partial<InferSettings>) {
  return inferType(value, { ...DEFAULT_SETTINGS, ...settings });
}

describe("inferType", () => {
  // --- Primitives ---

  it("infers primitive string", () => {
    const result = infer({ name: "Alice" });
    expect(result.type.kind).toBe("object");
    const obj = result.type as ObjectType;
    expect(obj.properties.name.type).toEqual({
      kind: "primitive",
      type: "string",
    });
  });

  it("infers primitive number", () => {
    const result = infer({ age: 30 });
    const obj = result.type as ObjectType;
    expect(obj.properties.age.type).toEqual({
      kind: "primitive",
      type: "number",
    });
  });

  it("infers primitive boolean", () => {
    const result = infer({ active: true });
    const obj = result.type as ObjectType;
    expect(obj.properties.active.type).toEqual({
      kind: "primitive",
      type: "boolean",
    });
  });

  // --- Null handling ---

  it("handles null values as nullable", () => {
    const result = infer({ deletedAt: null });
    const obj = result.type as ObjectType;
    expect(obj.properties.deletedAt.nullable).toBe(true);
  });

  // --- Simple object ---

  it("infers simple object with all primitive types", () => {
    const result = infer({
      name: "Alice",
      age: 30,
      active: true,
    });
    expect(result.type.kind).toBe("object");
    const obj = result.type as ObjectType;
    expect(Object.keys(obj.properties)).toEqual(["name", "age", "active"]);
    expect(result.fieldCount).toBe(3);
  });

  // --- Nested objects ---

  it("infers nested objects with correct path names", () => {
    const result = infer({
      user: {
        address: {
          city: "Portland",
        },
      },
    });
    const root = result.type as ObjectType;
    expect(root.typeName).toBe("Root");

    const userProp = root.properties.user.type as ObjectType;
    expect(userProp.kind).toBe("object");

    const addressProp = userProp.properties.address.type as ObjectType;
    expect(addressProp.kind).toBe("object");
    expect(addressProp.properties.city.type).toEqual({
      kind: "primitive",
      type: "string",
    });
  });

  // --- Array of same-type objects ---

  it("infers array of objects with correct element type", () => {
    const result = infer([
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ]);
    expect(result.type.kind).toBe("array");
    const arr = result.type as { kind: "array"; elementType: InferredType };
    expect(arr.elementType.kind).toBe("object");
  });

  // --- Optional detection ---

  it("detects optional fields in array of objects with inconsistent keys", () => {
    const result = infer([
      { id: 1, name: "Alice", phone: "555-0100" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie", phone: "555-0300" },
    ]);
    const arr = result.type as { kind: "array"; elementType: InferredType };
    const obj = arr.elementType as ObjectType;

    // "id" and "name" present in all → not optional
    expect(obj.properties.id.optional).toBe(false);
    expect(obj.properties.name.optional).toBe(false);

    // "phone" missing from one → optional
    expect(obj.properties.phone.optional).toBe(true);
  });

  // --- Empty array ---

  it("handles empty array with unknown element type and warning", () => {
    const result = infer({ items: [] });
    const obj = result.type as ObjectType;
    const itemsProp = obj.properties.items.type;

    expect(itemsProp.kind).toBe("array");
    const arr = itemsProp as { kind: "array"; elementType: InferredType };
    expect(arr.elementType.kind).toBe("unknown");

    // Should have a warning diagnostic
    const warnings = result.diagnostics.filter((d) => d.level === "warning");
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].message).toContain("Empty array");
  });

  // --- Mixed array types (union) ---

  it("infers union type for mixed array elements", () => {
    const result = infer({ values: [1, "two", true] });
    const obj = result.type as ObjectType;
    const valuesProp = obj.properties.values.type;

    expect(valuesProp.kind).toBe("array");
    const arr = valuesProp as { kind: "array"; elementType: InferredType };
    expect(arr.elementType.kind).toBe("union");

    if (arr.elementType.kind === "union") {
      expect(arr.elementType.variants.length).toBe(3);
    }
  });

  // --- Date detection ---

  it("detects ISO date strings when enabled", () => {
    const result = infer(
      { createdAt: "2025-01-15T09:30:00.000Z" },
      { detectDates: true }
    );
    const obj = result.type as ObjectType;
    expect(obj.properties.createdAt.type.kind).toBe("date-string");
  });

  it("treats ISO date strings as plain strings when detection disabled", () => {
    const result = infer(
      { createdAt: "2025-01-15T09:30:00.000Z" },
      { detectDates: false }
    );
    const obj = result.type as ObjectType;
    expect(obj.properties.createdAt.type).toEqual({
      kind: "primitive",
      type: "string",
    });
  });

  // --- Union deduplication ---

  it("deduplicates same types in mixed arrays", () => {
    const result = infer({ tags: ["a", "b", "c"] });
    const obj = result.type as ObjectType;
    const tagsProp = obj.properties.tags.type;

    expect(tagsProp.kind).toBe("array");
    const arr = tagsProp as { kind: "array"; elementType: InferredType };
    // All strings → should be a single string type, not a union
    expect(arr.elementType.kind).toBe("primitive");
    expect(arr.elementType).toEqual({ kind: "primitive", type: "string" });
  });

  // --- Root type name ---

  it("uses custom root type name", () => {
    const result = infer({ x: 1 }, { rootTypeName: "MyType" });
    const obj = result.type as ObjectType;
    expect(obj.typeName).toBe("MyType");
  });

  // --- Root array ---

  it("handles root-level array", () => {
    const result = infer([1, 2, 3]);
    expect(result.type.kind).toBe("array");
  });

  // --- Field count ---

  it("counts fields correctly for nested objects", () => {
    const result = infer({
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    });
    // a, b, c, d → infer counts each key traversed in inferObject
    // "a" = 1, "b" = 1, "c" = 1, "d" = 1 → 4
    expect(result.fieldCount).toBe(4);
  });
});
