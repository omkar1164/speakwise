# Cursor AI Coding Rules

These rules apply to every file in this repository. Follow them consistently.

---

## Language & types

- **Always use TypeScript.** No `.js` source files in `apps/` or `packages/`.
- **No `any`.** Use `unknown` and narrow, or define a proper type.
- **Explicit return types** on all backend functions and React components.
- **Prefer `type` over `interface`** unless declaration merging is intentionally needed.
- **Use `import type`** for type-only imports (`import type { Foo } from './foo'`).

## React / Next.js

- **Prefer functional components.** No class components.
- **Server Components by default** in the Next.js App Router; add `'use client'` only when necessary.
- **No inline styles.** Use Tailwind utility classes exclusively.
- **Keep components small** — if a component exceeds ~150 lines, split it.

## Backend (Fastify)

- **Each route group lives in its own file** under `src/routes/`.
- **Validate all external input** with Zod schemas.
- **Never access `process.env` directly** outside of `src/env.ts`.
- **Async/await over callbacks.** No raw Promise chains.

## File & folder conventions

- **Follow the existing folder structure.** Do not create new top-level folders without discussion.
- **One concept per file.** Avoid barrel files that re-export everything.
- **File names:** `kebab-case` for files, `PascalCase` for React component files.

## Dependencies

- **Use npm** as the package manager. Do not introduce pnpm, yarn, or bun.
- **Do not add a new library without a clear reason.** Prefer the standard library or already-installed packages.
- **Pin major versions** in `package.json` (e.g. `"^4.0.0"`, not `"*"`).

## Code style

- **No commented-out code** in commits (use git stash or branches instead).
- **No console.log in production paths** — use the Fastify logger (`fastify.log.*`) on the backend.
- **Comments explain *why*, not *what*.** If the code needs a "what" comment, simplify it instead.

## Collaboration with AI

- **Ask before making architectural changes** (new packages, route restructuring, DB schema).
- **Implement the minimal change** that satisfies the requirement; do not refactor unrelated code.
- **Never skip config files** — always include `tsconfig.json`, `package.json`, and env examples.
