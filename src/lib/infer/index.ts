export { inferType } from "./infer";
export { parseJSON } from "./parse";
export { mergeTypes, mergeObjectTypes } from "./merge";
export { NameGenerator, snakeToCamel, isSnakeCase } from "./naming";
export type {
  InferredType,
  PrimitiveType,
  ArrayType,
  ObjectType,
  UnionType,
  UnknownType,
  DateStringType,
  PropertyInfo,
  PropertyMap,
  Diagnostic,
  DiagnosticLevel,
  InferSettings,
  InferResult,
  GenerateSettings,
} from "./types";
