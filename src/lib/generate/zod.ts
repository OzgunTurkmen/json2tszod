/**
 * Zod schema generator.
 * Converts InferredType IR into Zod schema declarations.
 */

import type {
  InferredType,
  ObjectType,
  GenerateSettings,
} from "@/lib/infer/types";
import { formatTypeScript } from "./formatter";

/**
 * Convert a type name to a schema variable name (camelCase + "Schema").
 * e.g. "RootUser" → "rootUserSchema"
 */
function toSchemaName(typeName: string): string {
  return typeName.charAt(0).toLowerCase() + typeName.slice(1) + "Schema";
}

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
 * Convert an InferredType to its Zod schema expression string.
 */
function typeToZod(
  type: InferredType,
  settings: GenerateSettings
): string {
  switch (type.kind) {
    case "primitive":
      switch (type.type) {
        case "string":
          return "z.string()";
        case "number":
          return "z.number()";
        case "boolean":
          return "z.boolean()";
        case "null":
          return "z.null()";
      }
      break;
    case "unknown":
      return "z.unknown()";
    case "date-string":
      return settings.detectDates
        ? "z.string().datetime()"
        : "z.string()";
    case "array":
      return `z.array(${typeToZod(type.elementType, settings)})`;
    case "union": {
      const variants = type.variants.map((v) => typeToZod(v, settings));
      if (variants.length === 2) {
        return `z.union([${variants.join(", ")}])`;
      }
      return `z.union([${variants.join(", ")}])`;
    }
    case "object":
      return toSchemaName(type.typeName);
  }
  return "z.unknown()";
}

/**
 * Generate a Zod schema declaration for an ObjectType.
 */
function generateObjectSchema(
  obj: ObjectType,
  settings: GenerateSettings
): string {
  const entries = Object.entries(obj.properties);

  const fields = entries.map(([key, prop]) => {
    let zodType = typeToZod(prop.type, settings);

    if (prop.nullable) {
      zodType = `${zodType}.nullable()`;
    }
    if (prop.optional) {
      zodType = `${zodType}.optional()`;
    }

    return `  ${key}: ${zodType},`;
  });

  const strict = settings.strictObjects ? ".strict()" : "";
  const schemaName = toSchemaName(obj.typeName);

  return `export const ${schemaName} = z.object({\n${fields.join("\n")}\n})${strict};`;
}

/**
 * Generate Zod schema declarations from an InferredType.
 *
 * @param type - The inferred type tree
 * @param settings - Generation settings
 * @returns Formatted TypeScript source code with Zod schemas
 */
export async function generateZod(
  type: InferredType,
  settings: GenerateSettings
): Promise<string> {
  const lines: string[] = [];

  lines.push('import { z } from "zod";');
  lines.push("");

  if (type.kind === "object") {
    const objects = collectObjects(type);

    // Emit in reverse order (deepest first)
    const reversed = [...objects].reverse();
    for (const obj of reversed) {
      lines.push(generateObjectSchema(obj, settings));
      lines.push("");
    }

    // Inferred type export
    const rootSchemaName = toSchemaName(settings.rootTypeName);
    lines.push(
      `export type ${settings.rootTypeName} = z.infer<typeof ${rootSchemaName}>;`
    );
    lines.push("");
  } else if (type.kind === "array") {
    const objects = collectObjects(type);
    const reversed = [...objects].reverse();
    for (const obj of reversed) {
      lines.push(generateObjectSchema(obj, settings));
      lines.push("");
    }

    const elementZod = typeToZod(type.elementType, settings);
    const rootSchemaName = toSchemaName(settings.rootTypeName);
    lines.push(
      `export const ${rootSchemaName} = z.array(${elementZod});`
    );
    lines.push("");
    lines.push(
      `export type ${settings.rootTypeName} = z.infer<typeof ${rootSchemaName}>;`
    );
    lines.push("");
  } else {
    const zodType = typeToZod(type, settings);
    const rootSchemaName = toSchemaName(settings.rootTypeName);
    lines.push(`export const ${rootSchemaName} = ${zodType};`);
    lines.push("");
    lines.push(
      `export type ${settings.rootTypeName} = z.infer<typeof ${rootSchemaName}>;`
    );
    lines.push("");
  }

  const raw = lines.join("\n");
  return formatTypeScript(raw);
}
