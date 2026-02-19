/**
 * Prettier-based code formatter for in-browser use.
 * Lazy-loads Prettier plugins on first use to reduce initial bundle size.
 */

type PrettierModule = typeof import("prettier/standalone");
type PrettierPlugin = import("prettier").Plugin;

let prettierPromise: Promise<{
  prettier: PrettierModule;
  tsPlugin: PrettierPlugin;
  estreePlugin: PrettierPlugin;
}> | null = null;

/**
 * Lazy-load Prettier and its TypeScript/estree plugins.
 */
async function loadPrettier() {
  if (!prettierPromise) {
    prettierPromise = Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/typescript"),
      import("prettier/plugins/estree"),
    ]).then(([prettier, tsPlugin, estreePlugin]) => ({
      prettier,
      tsPlugin: tsPlugin as unknown as PrettierPlugin,
      estreePlugin: estreePlugin as unknown as PrettierPlugin,
    }));
  }
  return prettierPromise;
}

/**
 * Format TypeScript code using Prettier.
 * Falls back to returning unformatted code if Prettier fails.
 */
export async function formatTypeScript(code: string): Promise<string> {
  try {
    const { prettier, tsPlugin, estreePlugin } = await loadPrettier();
    return await prettier.format(code, {
      parser: "typescript",
      plugins: [tsPlugin, estreePlugin],
      semi: true,
      singleQuote: false,
      trailingComma: "all",
      printWidth: 80,
      tabWidth: 2,
    });
  } catch {
    // If Prettier fails, return unformatted code
    return code;
  }
}
