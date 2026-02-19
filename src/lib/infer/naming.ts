/**
 * Stable type name generation from JSON paths.
 * Produces PascalCase names like "Root", "RootUser", "RootUserAddress".
 * Handles collisions by appending numeric suffixes.
 */

/**
 * Convert a string segment to PascalCase.
 * Handles snake_case, camelCase, and plain strings.
 */
function toPascalCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2") // camelCase → camel_Case
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Name generator that tracks used names and resolves collisions.
 */
export class NameGenerator {
  private usedNames = new Map<string, number>();

  /**
   * Generate a unique type name from a path array.
   * @param pathSegments - e.g. ["root", "user", "address"]
   * @returns PascalCase name like "RootUserAddress"
   */
  generate(pathSegments: string[]): string {
    const base = pathSegments.map(toPascalCase).join("");
    const candidateName = base || "Root";

    const count = this.usedNames.get(candidateName) ?? 0;
    this.usedNames.set(candidateName, count + 1);

    if (count === 0) {
      return candidateName;
    }

    // Append numeric suffix for duplicates
    return `${candidateName}${count + 1}`;
  }

  /**
   * Reset the name tracker (useful for re-runs).
   */
  reset(): void {
    this.usedNames.clear();
  }
}

/**
 * Convert a snake_case string to camelCase.
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Check if a string is snake_case (contains underscores, no uppercase).
 */
export function isSnakeCase(str: string): boolean {
  return /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(str);
}
