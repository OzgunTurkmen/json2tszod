/**
 * Internal Intermediate Representation (IR) types for the type inference engine.
 * These types describe the shape of inferred JSON structures and are consumed
 * by the TypeScript, Zod, and Example generators.
 */

// --- Inferred Type IR ---

export type InferredType =
  | PrimitiveType
  | ArrayType
  | ObjectType
  | UnionType
  | UnknownType
  | DateStringType;

export interface PrimitiveType {
  kind: "primitive";
  type: "string" | "number" | "boolean" | "null";
}

export interface ArrayType {
  kind: "array";
  elementType: InferredType;
}

export interface ObjectType {
  kind: "object";
  properties: PropertyMap;
  /** Stable generated name for this object type (e.g. "Root", "RootUser") */
  typeName: string;
}

export interface UnionType {
  kind: "union";
  variants: InferredType[];
}

export interface UnknownType {
  kind: "unknown";
}

export interface DateStringType {
  kind: "date-string";
}

// --- Property Info ---

export interface PropertyInfo {
  type: InferredType;
  optional: boolean;
  nullable: boolean;
}

export type PropertyMap = Record<string, PropertyInfo>;

// --- Diagnostics ---

export type DiagnosticLevel = "error" | "warning" | "info";

export interface Diagnostic {
  level: DiagnosticLevel;
  message: string;
  path: string;
}

// --- Inference Settings ---

export interface InferSettings {
  /** Root type name, default "Root" */
  rootTypeName: string;
  /** Whether to detect ISO-8601 date strings */
  detectDates: boolean;
}

// --- Inference Result ---

export interface InferResult {
  type: InferredType;
  diagnostics: Diagnostic[];
  /** Total number of fields (properties) across all objects */
  fieldCount: number;
}

// --- Generation Settings ---

export interface GenerateSettings {
  rootTypeName: string;
  /** Whether to emit "type" or "interface" for TypeScript objects */
  outputStyle: "type" | "interface";
  /** Whether to add .strict() to Zod objects */
  strictObjects: boolean;
  /** Whether to detect ISO date strings in Zod output */
  detectDates: boolean;
  /** Convert snake_case JSON keys to camelCase in TS output */
  snakeToCamel: boolean;
}
