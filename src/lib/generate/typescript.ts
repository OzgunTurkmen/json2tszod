/**
 * TypeScript type/interface generator.
 * Converts InferredType IR into TypeScript declarations.
 */

import type {
  InferredType,
  ObjectType,
  GenerateSettings,
} from "@/lib/infer/types";
import { snakeToCamel, isSnakeCase } from "@/lib/infer/naming";
import { formatTypeScript } from "./formatter";

/**
 * Collect all named object types from the IR tree (depth-first).
 */
function collectObjects(type: InferredType): ObjectType[] {
  const objects: ObjectType[] = [];

  function walk(t: InferredType) {
    switch (t.kind) {
      case "object":
        objects.push(t);
        for (const prop of Object.values(t.properties)) {
          walk(prop.type);
        }
        break;
      case "array":
        walk(t.elementType);
        break;
      case "union":
        for (const v of t.variants) {
          walk(v);
        }
        break;
    }
  }

  walk(type);
  return objects;
}

/**
 * Convert an InferredType to its TypeScript type string.
 */
function typeToTS(type: InferredType, settings: GenerateSettings): string {
  switch (type.kind) {
    case "primitive":
      return type.type;
    case "unknown":
      return "unknown";
    case "date-string":
      return "string";
    case "array": {
      const inner = typeToTS(type.elementType, settings);
      // Wrap unions in parens for array notation
      if (type.elementType.kind === "union") {
        return `(${inner})[]`;
      }
      return `${inner}[]`;
    }
    case "union":
      return type.variants.map((v) => typeToTS(v, settings)).join(" | ");
    case "object":
      return type.typeName;
  }
}

/**
 * Generate a TypeScript type/interface declaration for an ObjectType.
 */
function generateObjectDeclaration(
  obj: ObjectType,
  settings: GenerateSettings
): string {
  const entries = Object.entries(obj.properties);
  const snakeConversions: string[] = [];

  const fields = entries.map(([key, prop]) => {
    let tsKey = key;
    if (settings.snakeToCamel && isSnakeCase(key)) {
      tsKey = snakeToCamel(key);
      snakeConversions.push(`  // "${tsKey}" maps to JSON key "${key}"`);
    }

    const tsType = typeToTS(prop.type, settings);
    const nullable = prop.nullable ? ` | null` : "";
    const optional = prop.optional ? "?" : "";

    return `  ${tsKey}${optional}: ${tsType}${nullable};`;
  });

  const comment =
    snakeConversions.length > 0
      ? `/**\n${snakeConversions.join("\n")}\n */\n`
      : "";

  if (settings.outputStyle === "interface") {
    return `${comment}export interface ${obj.typeName} {\n${fields.join("\n")}\n}`;
  }

  return `${comment}export type ${obj.typeName} = {\n${fields.join("\n")}\n};`;
}

/**
 * Generate TypeScript declarations from an InferredType.
 *
 * @param type - The inferred type tree
 * @param settings - Generation settings
 * @returns Formatted TypeScript source code
 */
export async function generateTypeScript(
  type: InferredType,
  settings: GenerateSettings
): Promise<string> {
  const lines: string[] = [];

  if (type.kind === "object") {
    // Collect all nested object types
    const objects = collectObjects(type);

    // Emit in reverse order (deepest first) so dependencies come before usage
    const reversed = [...objects].reverse();
    for (const obj of reversed) {
      lines.push(generateObjectDeclaration(obj, settings));
      lines.push("");
    }
  } else if (type.kind === "array") {
    // Root is an array
    const objects = collectObjects(type);
    const reversed = [...objects].reverse();
    for (const obj of reversed) {
      lines.push(generateObjectDeclaration(obj, settings));
      lines.push("");
    }

    const elementTS = typeToTS(type.elementType, settings);
    lines.push(
      `export type ${settings.rootTypeName} = ${elementTS}[];`
    );
    lines.push("");
  } else {
    // Primitive or union root
    const tsType = typeToTS(type, settings);
    lines.push(
      `export type ${settings.rootTypeName} = ${tsType};`
    );
    lines.push("");
  }

  const raw = lines.join("\n");
  return formatTypeScript(raw);
}
