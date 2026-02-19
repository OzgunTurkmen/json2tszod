# JSON2TSZod

**Paste JSON. Get TypeScript types, Zod schemas, and typed examples — instantly.**

A free, open-source, privacy-first tool that converts JSON into production-ready TypeScript types and Zod validation schemas. Runs entirely in your browser — no server, no API calls, no data leaves your machine.

## Features

- **TypeScript Generation** — `export type` or `export interface` declarations with full nesting support
- **Zod Schema Generation** — Complete Zod schemas with `.nullable()`, `.optional()`, `.strict()`, and `z.infer<>` type exports
- **Example Objects** — Typed example objects with representative default values
- **Smart Inference** — Detects optional fields, nullable values, union types, nested objects, and empty arrays
- **ISO Date Detection** — Optionally map ISO-8601 date strings to `z.string().datetime()`
- **Snake → Camel** — Convert `snake_case` JSON keys to `camelCase` in TypeScript output
- **Diagnostics Panel** — Structured parse errors, type warnings, and inference info
- **5 Built-in Samples** — Quick-start with common JSON patterns
- **Premium Editor** — CodeMirror 6 with syntax highlighting, line numbers, and bracket matching
- **Prettier Formatting** — In-browser code formatting via Prettier (lazy-loaded)
- **Copy & Download** — Copy to clipboard or download as `.ts` files
- **Keyboard Shortcuts** — `Ctrl+Enter` generate, `Ctrl+Shift+C` copy, `Ctrl+K` focus input
- **Fully Responsive** — Works on desktop and mobile
- **Dark Theme** — Sleek dark UI with indigo accents
- **Zero Backend** — Static export, deployable anywhere

## Tech Stack

- [Next.js](https://nextjs.org/) — App Router, static export
- [TypeScript](https://www.typescriptlang.org/) — 100% typed
- [Tailwind CSS v4](https://tailwindcss.com/) — Utility-first styling
- [CodeMirror 6](https://codemirror.net/) — Lightweight code editor
- [Prettier](https://prettier.io/) — Client-side code formatting
- [Vitest](https://vitest.dev/) — Unit testing
- [sonner](https://sonner.emilkowal.dev/) — Toast notifications
- [Lucide](https://lucide.dev/) — Icons

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
open http://localhost:3000
```

## Build

```bash
# Production build (static export to out/)
npm run build
```

The static site is output to the `out/` directory and can be served by any static file server.

## Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Vercel auto-detects Next.js and deploys

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with Toaster
│   ├── page.tsx            # Main converter page
│   └── globals.css         # Tailwind + theme variables
├── components/             # React UI components
│   ├── Header.tsx          # Top bar with branding & actions
│   ├── JsonEditor.tsx      # CodeMirror JSON input editor
│   ├── OutputPanel.tsx     # Tabbed output with copy/download
│   ├── DiagnosticsView.tsx # Structured diagnostic messages
│   ├── SettingsDrawer.tsx  # Settings slide-out panel
│   ├── StatusBar.tsx       # Bottom status bar
│   └── ErrorBoundary.tsx   # Error boundary wrapper
├── hooks/                  # Custom React hooks
│   ├── useConverter.ts     # Orchestrates parse → infer → generate
│   ├── useDebounce.ts      # Input debouncing
│   └── useSettings.ts      # Settings with localStorage
├── lib/
│   ├── infer/              # Type inference engine
│   │   ├── types.ts        # IR types (InferredType, Diagnostic, etc.)
│   │   ├── infer.ts        # Main inference function
│   │   ├── merge.ts        # Type merging & deduplication
│   │   ├── naming.ts       # PascalCase name generation
│   │   ├── parse.ts        # JSON parser with diagnostics
│   │   └── __tests__/      # Inference unit tests
│   ├── generate/           # Code generators
│   │   ├── typescript.ts   # TypeScript type/interface generator
│   │   ├── zod.ts          # Zod schema generator
│   │   ├── example.ts      # Example object generator
│   │   ├── formatter.ts    # Prettier wrapper (lazy-loaded)
│   │   └── __tests__/      # Generator unit tests
│   ├── settings.ts         # Settings type & localStorage
│   ├── samples.ts          # 5 built-in JSON samples
│   ├── clipboard.ts        # Clipboard API with fallback
│   └── download.ts         # Blob download utility
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Trigger generation |
| `Ctrl/Cmd + Shift + C` | Copy current tab output |
| `Ctrl/Cmd + K` | Focus JSON input editor |

## Limitations

- No support for recursive/circular JSON structures
- Large JSON inputs (>1MB) may slow the browser — a warning is shown
- Prettier formatting is best-effort; complex edge cases may not format perfectly
- Type names are generated from paths and may not always match your preferred naming

## Roadmap

- [ ] Web Worker for processing large JSON without blocking UI
- [ ] Dark/light theme toggle
- [ ] Custom tab size and formatting options
- [ ] Export as npm package scaffold
- [ ] Schema validation testing in-browser
- [ ] Import from URL / file upload
- [ ] Share via URL (encoded JSON in hash)

## License

MIT
