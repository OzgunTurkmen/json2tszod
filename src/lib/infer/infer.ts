/**
 * Main type inference engine.
 * Takes a parsed JSON value and produces an InferredType IR tree
 * along with diagnostics and metadata.
 */

import type {
  InferredType,
  ObjectType,
  Diagnostic,
  InferResult,
  InferSettings,
  PropertyMap,
} from "./types";
import { mergeTypes, mergeObjectTypes } from "./merge";
import { NameGenerator } from "./naming";

/** ISO-8601 datetime regex (common formats) */
const ISO_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * Infer the type of a JSON value.
 *
 * @param value - The parsed JSON value
 * @param settings - Inference settings
 * @returns InferResult with type tree, diagnostics, and field count
 */
export function inferType(
  value: unknown,
  settings: InferSettings
): InferResult {
  const diagnostics: Diagnostic[] = [];
  const nameGen = new NameGenerator();
  let fieldCount = 0;

  function infer(val: unknown, path: string[]): InferredType {
    if (val === null) {
      return { kind: "primitive", type: "null" };
    }

    switch (typeof val) {
      case "string":
        if (settings.detectDates && ISO_DATE_REGEX.test(val)) {
          diagnostics.push({
            level: "info",
            message: `Detected ISO date string at "${path.join(".")}"`,
            path: path.join("."),
          });
          return { kind: "date-string" };
        }
        return { kind: "primitive", type: "string" };

      case "number":
        return { kind: "primitive", type: "number" };

      case "boolean":
        return { kind: "primitive", type: "boolean" };

      default:
        break;
    }

    // Array
    if (Array.isArray(val)) {
      return inferArray(val, path);
    }

    // Object
    if (typeof val === "object" && val !== null) {
      return inferObject(val as Record<string, unknown>, path);
    }

    return { kind: "unknown" };
  }

  function inferArray(arr: unknown[], path: string[]): InferredType {
    if (arr.length === 0) {
      diagnostics.push({
        level: "warning",
        message: `Empty array at "${path.join(".") || "root"}". Defaulting to unknown[].`,
        path: path.join("."),
      });
      return { kind: "array", elementType: { kind: "unknown" } };
    }

    // Check if all elements are objects → merge object types
    const objectElements: ObjectType[] = [];
    const otherElements: InferredType[] = [];

    for (let i = 0; i < arr.length; i++) {
      const elemType = infer(arr[i], [...path, `[${i}]`]);
      if (elemType.kind === "object") {
        objectElements.push(elemType);
      } else {
        otherElements.push(elemType);
      }
    }

    // All objects → merge them (detecting optional fields)
    if (objectElements.length === arr.length) {
      const itemName = nameGen.generate([
        ...path.filter((p) => !p.startsWith("[")),
        "item",
      ]);
      const mergedObj = mergeObjectTypes(objectElements, itemName);
      return { kind: "array", elementType: mergedObj };
    }

    // All non-objects → merge types
    if (objectElements.length === 0) {
      const merged = mergeTypes(otherElements);

      // Check for mixed types
      if (merged.kind === "union") {
        diagnostics.push({
          level: "warning",
          message: `Mixed element types in array at "${path.join(".") || "root"}".`,
          path: path.join("."),
        });
      }

      return { kind: "array", elementType: merged };
    }

    // Mix of objects and non-objects
    diagnostics.push({
      level: "warning",
      message: `Mixed element types (objects and primitives) in array at "${path.join(".") || "root"}".`,
      path: path.join("."),
    });

    const allTypes: InferredType[] = [
      ...otherElements,
      ...(objectElements.length > 0
        ? [
            mergeObjectTypes(
              objectElements,
              nameGen.generate([
                ...path.filter((p) => !p.startsWith("[")),
                "item",
              ])
            ),
          ]
        : []),
    ];

    return { kind: "array", elementType: mergeTypes(allTypes) };
  }

  function inferObject(
    obj: Record<string, unknown>,
    path: string[]
  ): ObjectType {
    const properties: PropertyMap = {};
    const keys = Object.keys(obj);

    for (const key of keys) {
      fieldCount++;
      const val = obj[key];
      const childPath = [...path, key];
      const childType = infer(val, childPath);

      // Separate null from the type
      if (childType.kind === "primitive" && childType.type === "null") {
        properties[key] = {
          type: { kind: "unknown" },
          optional: false,
          nullable: true,
        };
      } else {
        properties[key] = {
          type: childType,
          optional: false,
          nullable: false,
        };
      }
    }

    const typeName = nameGen.generate(
      path.length === 0
        ? [settings.rootTypeName]
        : path.filter((p) => !p.startsWith("["))
    );

    return { kind: "object", properties, typeName };
  }

  // Root must be an object or array
  if (typeof value !== "object" || value === null) {
    diagnostics.push({
      level: "error",
      message: "Root value must be an object or array.",
      path: "",
    });
    return {
      type: infer(value, []),
      diagnostics,
      fieldCount,
    };
  }

  const rootType = infer(value, []);

  // If root is an object, ensure it uses the configured root name
  if (rootType.kind === "object") {
    rootType.typeName = settings.rootTypeName;
  }

  return {
    type: rootType,
    diagnostics,
    fieldCount,
  };
}
