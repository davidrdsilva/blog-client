---
name: decouple-code
description: Untangle a file that mixes concerns in this Next.js blog-client repo. Use when the user asks to "decouple", "separate concerns", "clean up", "extract logic", "move API calls out", or when reviewing a component that does fetching, formatting, types, and rendering all together. Pulls API calls into app/lib/, helpers into app/utils/, types into app/types/, and context into app/providers/ per CLAUDE.local.md.
---

# decouple-code

Move mixed responsibilities out of one file into the layer they belong to: `app/lib/`, `app/utils/`, `app/types/`, or `app/providers/`. Run when a single file is doing too many things or when concerns leak across layer boundaries.

## When to invoke

Apply when at least one of these is true in the target file:

- Calls `fetch` directly (must move to `app/lib/`).
- Defines TypeScript shapes used in 2+ files (must move to `app/types/`).
- Has pure helpers (formatters, predicates, parsers) used elsewhere (must move to `app/utils/`).
- Holds React Context creation alongside unrelated UI (must move to `app/providers/`).
- A `utils/` file imports from `lib/`, `components/`, or `providers/` (a violation — invert the dependency).
- A component imports a private helper from another component file.

## Layer rules (from CLAUDE.local.md §2)

- `app/lib/` — side-effectful (HTTP, third-party SDKs). Returns domain types from `app/types/`. Hides API-level shapes (`APIPost`, `APICategory`, etc.).
- `app/utils/` — pure, sync, no I/O, no React. Cannot import from `lib/`, `components/`, or `providers/`.
- `app/types/` — domain shapes consumed by UI. The single source of truth.
- `app/providers/` — one React Context per file with its custom `useXxx` hook that throws outside the provider.
- `app/components/` — render UI from props. No `fetch`. No private cross-component imports.

## Procedure

1. **Inventory the target file.** List every concern in it: HTTP calls, type declarations, helper functions, React state, JSX. Group them by destination layer.
2. **Plan the moves.** For each concern decide:
   - Move to which folder under what filename (kebab-case)?
   - Is there already a file there it should join (e.g. extend `app/lib/api.ts` instead of creating a sibling)?
   - What's the public symbol after the move (named export)?
3. **Confirm with the user** if the plan adds 3+ new files or renames public symbols. Otherwise proceed.
4. **Make moves smallest-blast-radius first**, in this order:
   1. Types → `app/types/<feature>.ts`. Update imports across the repo.
   2. Pure helpers → `app/utils/<verb-noun>.ts` (one helper per file when possible). Update imports.
   3. API calls → add functions to `app/lib/api.ts` (or a sibling like `app/lib/stocks.ts`). Map API shapes to domain types inside `lib/`. Update callers to use the new function.
   4. Context → `app/providers/<thing>-provider.tsx` with a `use<Thing>()` hook that throws when used outside.
5. **Trim the original file** to just rendering/orchestration. It should now import what it uses and own nothing else.
6. **Re-check layer boundaries:**
   - Grep `app/utils/` for imports from `@/app/lib`, `@/app/components`, `@/app/providers` — none allowed.
   - Grep components for `fetch(` — none allowed.
   - Grep components for ad-hoc API response interfaces — none; consume `app/types/`.
7. **Validate.** Run `npm run lint`, `npm run lint:biome`, and `npm run build`. Fix any breakage from the moves.

## Decoupling patterns

### Pattern: API call inside a component

Before:
```typescript
"use client";
const res = await fetch(`/api/posts/${id}`);
const post = await res.json();
```

After:
```typescript
// app/lib/api.ts
export async function getPost(id: string): Promise<Post | null> { /* ... */ }

// component
const post = await getPost(id);
```

### Pattern: ad-hoc helper used twice

Before: `formatDate` defined in `post-card.tsx` and copy-pasted into `comments.tsx`.

After: `app/utils/format-date.ts` with a single named export, both files import it.

### Pattern: API shape leaking into UI

Before: the component imports `APIPost` (snake_case fields like `category_id`, `total_views`).

After: `lib/api.ts` maps `APIPost → Post` (camelCase, domain type). The component only sees `Post` from `app/types/`.

### Pattern: a "god" component file

The file holds: a Context, a hook, the provider component, the consumer UI, and helpers. Split into:

- `app/providers/<thing>-provider.tsx` — Context + Provider + `use<Thing>()` hook.
- `app/utils/<helper>.ts` — pure helpers.
- `app/components/<thing>-panel.tsx` — UI.

## Anti-patterns to avoid while decoupling

- Don't introduce a barrel file (`index.ts` re-exports). The repo uses direct imports.
- Don't add interface inheritance hierarchies; keep types flat.
- Don't generalize on the way out. Move first, abstract only when a second concrete caller appears.
- Don't leave `// moved to ...` comments or `// @deprecated` shims. Delete the old code.

## Definition of done

- Each concern lives in the layer named in §2 of CLAUDE.local.md.
- No layer-violation imports remain.
- The original file is shorter and reads as orchestration/render-only.
- All lints and `npm run build` pass.
- Report: list of files added/modified/deleted, and a one-line summary of what each move clarified.
