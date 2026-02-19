/**
 * Example typed object generator.
 * Creates a typed example object with representative default values,
 * plus a z.infer type usage example.
 */

import type {
  InferredType,
  GenerateSettings,
} from "@/lib/infer/types";
import { snakeToCamel, isSnakeCase } from "@/lib/infer/naming";
import { formatTypeScript } from "./formatter";

/**
 * Convert a type name to a schema variable name (camelCase + "Schema").
 */
function toSchemaName(typeName: string): string {
  return typeName.charAt(0).toLowerCase() + typeName.slice(1) + "Schema";
}

/**
 * Generate a representative default value expression for a type.
 */
function generateValue(
  type: InferredType,
  settings: GenerateSettings,
  indent: number
): string {
  const pad = "  ".repeat(indent);
  const innerPad = "  ".repeat(indent + 1);

  switch (type.kind) {
    case "primitive":
      switch (type.type) {
        case "string":
          return '""';
        case "number":
          return "0";
        case "boolean":
          return "false";
        case "null":
          return "null";
      }
      break;
    case "unknown":
      return "undefined";
    case "date-string":
      return '"2025-01-01T00:00:00.000Z"';
    case "array":
      return `[${generateValue(type.elementType, settings, indent)}]`;
    case "union":
      // Use the first non-null variant as default
      const nonNull = type.variants.find(
        (v) => !(v.kind === "primitive" && v.type === "null")
      );
      return generateValue(nonNull ?? type.variants[0], settings, indent);
    case "object": {
      const entries = Object.entries(type.properties);
      if (entries.length === 0) return "{}";

      const fields = entries.map(([key, prop]) => {
        let tsKey = key;
        if (settings.snakeToCamel && isSnakeCase(key)) {
          tsKey = snakeToCamel(key);
        }

        const val = prop.nullable
          ? "null"
          : generateValue(prop.type, settings, indent + 1);
        return `${innerPad}${tsKey}: ${val},`;
      });

      return `{\n${fields.join("\n")}\n${pad}}`;
    }
  }
  return "undefined";
}

/**
 * Generate example code from an InferredType.
 *
 * @param type - The inferred type tree
 * @param settings - Generation settings
 * @returns Formatted TypeScript source code with example objects
 */
export async function generateExample(
  type: InferredType,
  settings: GenerateSettings
): Promise<string> {
  const lines: string[] = [];
  const rootName = settings.rootTypeName;
  const rootSchemaName = toSchemaName(rootName);

  lines.push(`// Import your generated types and schemas:`);
  lines.push(`// import type { ${rootName} } from "./types";`);
  lines.push(`// import { ${rootSchemaName} } from "./schema";`);
  lines.push("");
  lines.push(`// Using TypeScript type directly:`);

  if (type.kind === "array") {
    const exampleValue = generateValue(type, settings, 0);
    lines.push(`const example: ${rootName} = ${exampleValue};`);
  } else {
    const exampleValue = generateValue(type, settings, 0);
    lines.push(`const example: ${rootName} = ${exampleValue};`);
  }

  lines.push("");
  lines.push(`// Using Zod inferred type (equivalent):`);
  lines.push(`// type ${rootName}Inferred = z.infer<typeof ${rootSchemaName}>;`);
  lines.push("");
  lines.push(`// Validating at runtime:`);
  lines.push(`// const parsed = ${rootSchemaName}.parse(example);`);
  lines.push(`// const safeParsed = ${rootSchemaName}.safeParse(example);`);
  lines.push("");

  const raw = lines.join("\n");
  return formatTypeScript(raw);
}
