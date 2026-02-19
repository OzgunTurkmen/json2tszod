/**
 * Type merging utilities.
 * Used to combine multiple InferredTypes into a single type,
 * handling deduplication and union creation.
 */

import type { InferredType, ObjectType, PropertyInfo, PropertyMap } from "./types";

/**
 * Check if two inferred types are structurally equal.
 */
export function typesEqual(a: InferredType, b: InferredType): boolean {
  if (a.kind !== b.kind) return false;

  switch (a.kind) {
    case "primitive":
      return b.kind === "primitive" && a.type === b.type;
    case "unknown":
    case "date-string":
      return true;
    case "array":
      return b.kind === "array" && typesEqual(a.elementType, b.elementType);
    case "union":
      if (b.kind !== "union") return false;
      if (a.variants.length !== b.variants.length) return false;
      return a.variants.every((av, i) => typesEqual(av, b.variants[i]));
    case "object":
      if (b.kind !== "object") return false;
      const aKeys = Object.keys(a.properties).sort();
      const bKeys = Object.keys(b.properties).sort();
      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every(
        (k, i) =>
          k === bKeys[i] &&
          typesEqual(a.properties[k].type, b.properties[k].type)
      );
    default:
      return false;
  }
}

/**
 * Flatten nested unions into a single-level array of variants.
 */
function flattenUnions(types: InferredType[]): InferredType[] {
  const result: InferredType[] = [];
  for (const t of types) {
    if (t.kind === "union") {
      result.push(...flattenUnions(t.variants));
    } else {
      result.push(t);
    }
  }
  return result;
}

/**
 * Deduplicate types: remove structural duplicates from the array.
 */
function deduplicateTypes(types: InferredType[]): InferredType[] {
  const result: InferredType[] = [];
  for (const t of types) {
    if (!result.some((r) => typesEqual(r, t))) {
      result.push(t);
    }
  }
  return result;
}

/**
 * Merge multiple InferredTypes into a single type.
 * - If all types are the same → single type
 * - If mixed → union
 * - Flattens nested unions, deduplicates
 */
export function mergeTypes(types: InferredType[]): InferredType {
  if (types.length === 0) {
    return { kind: "unknown" };
  }

  const flat = flattenUnions(types);
  const deduped = deduplicateTypes(flat);

  // Filter out "unknown" if there are other types
  const meaningful = deduped.filter((t) => t.kind !== "unknown");
  const finalTypes = meaningful.length > 0 ? meaningful : deduped;

  if (finalTypes.length === 1) {
    return finalTypes[0];
  }

  return { kind: "union", variants: finalTypes };
}

/**
 * Merge multiple object types (from an array of objects) into a single object type.
 * Keys not present in every object are marked optional.
 */
export function mergeObjectTypes(
  objects: ObjectType[],
  typeName: string
): ObjectType {
  if (objects.length === 0) {
    return { kind: "object", properties: {}, typeName };
  }

  if (objects.length === 1) {
    return { ...objects[0], typeName };
  }

  // Collect all keys across all objects
  const allKeys = new Set<string>();
  for (const obj of objects) {
    for (const key of Object.keys(obj.properties)) {
      allKeys.add(key);
    }
  }

  const mergedProperties: PropertyMap = {};
  const totalObjects = objects.length;

  for (const key of allKeys) {
    const typesForKey: InferredType[] = [];
    let presentCount = 0;
    let nullableCount = 0;

    for (const obj of objects) {
      const prop = obj.properties[key];
      if (prop) {
        presentCount++;
        typesForKey.push(prop.type);
        if (prop.nullable) nullableCount++;
      }
    }

    const isOptional = presentCount < totalObjects;
    const isNullable = nullableCount > 0;
    const mergedType = mergeTypes(typesForKey);

    // If the merged type is a union containing null, separate it
    let finalType = mergedType;
    let finalNullable = isNullable;

    if (mergedType.kind === "union") {
      const nonNullVariants = mergedType.variants.filter(
        (v) => !(v.kind === "primitive" && v.type === "null")
      );
      const hasNullVariant = mergedType.variants.some(
        (v) => v.kind === "primitive" && v.type === "null"
      );

      if (hasNullVariant) {
        finalNullable = true;
        finalType =
          nonNullVariants.length === 1
            ? nonNullVariants[0]
            : nonNullVariants.length === 0
            ? { kind: "primitive" as const, type: "null" as const }
            : { kind: "union" as const, variants: nonNullVariants };
      }
    }

    mergedProperties[key] = {
      type: finalType,
      optional: isOptional,
      nullable: finalNullable,
    };
  }

  return { kind: "object", properties: mergedProperties, typeName };
}
