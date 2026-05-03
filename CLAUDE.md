# AI Agent Guidelines for blog-client

Rules and conventions AI agents must follow when implementing or maintaining code in this project. These rules override generic defaults.

---

## 1. Stack Overview

| Concern | Choice |
|---|---|
| Framework | Next.js 16.x (App Router, Standalone output) |
| Language | TypeScript 5.x (`strict: true`) |
| UI runtime | React 19.x (Server Components by default) |
| Styling | Tailwind CSS 4.x (no component CSS files) |
| Lint / format | ESLint 9.x (`eslint-config-next`) + Biome 2.x |
| Editor | Editor.js 2.x (browser-only, dynamic-imported) |
| Image handling | `next/image` with `unoptimized: true` (MinIO source) |
| API transport | `fetch` against `NEXT_PUBLIC_API_URL` (proxied via `next.config.ts` rewrites) |

Backend: separate Go service. This repo is the consumer-facing client only — never embed business rules that belong on the server (auth, authorization, write-validation), only present and validate-for-UX.

---

## 2. Architecture

The app is a thin Next.js shell over a remote API. Keep the layers separated:

```
app/
  layout.tsx           Root server layout — wraps providers
  page.tsx             Home (server component)
  globals.css          Tailwind + CSS variables only
  providers/           Client-only React Context providers (theme, etc.)
  types/               Domain types (Post, Character, Whitenest...)
  lib/                 Side-effectful modules: API client, external services
  utils/               Pure, sync, side-effect-free helpers
  components/          Reusable UI components (cross-route)
  posts/               /posts/* routes (dynamic + nested)
  admin/               /admin/* routes (CRUD surfaces)
  whitenest/           /whitenest/* routes (serial content)
types/                 Ambient .d.ts for untyped 3rd-party modules
public/                Static assets
```

### Layer responsibilities (read top-down — each layer may depend on the ones below it, never above)

1. **Routes (`app/**/page.tsx`, `layout.tsx`)** — orchestrate; they fetch and pass props. Keep thin.
2. **Components (`app/components/`)** — render. Accept data via props. Avoid fetching inside; let routes own data.
3. **Providers (`app/providers/`)** — own cross-cutting client state (theme, modals). One context per file.
4. **Lib (`app/lib/`)** — talk to the outside world (HTTP, third-party SDKs). Return typed domain objects, not raw API shapes.
5. **Utils (`app/utils/`)** — pure functions: formatting, parsing, predicates. No I/O, no React.
6. **Types (`app/types/`)** — domain model. The single source of truth for shapes consumed by UI.

### Decoupling rules

- A component must not import from another component's internal helpers. If two components need the same helper, lift it to `app/utils/`.
- A component must not call `fetch` directly. All HTTP goes through `app/lib/api.ts` (or a sibling in `lib/`).
- API response shapes (e.g. `APIPost`) stay private to `app/lib/`. Routes/components consume the domain types from `app/types/`.
- `utils/` cannot import from `lib/`, `components/`, or `providers/`. If it needs to, it isn't a util.
- A page-specific component used by exactly one route should live next to that route, not in `app/components/`. Promote to `app/components/` only on the second consumer.

---

## 3. Design Principles

### KISS

- Prefer the shortest readable solution. Three near-identical lines beat a premature abstraction.
- Don't add config knobs, generic types, or strategy patterns for hypothetical needs. Wait for the second concrete caller.
- Don't wrap stable browser/Next APIs in custom hooks unless the wrapper adds real value (memoization, retries, project-specific defaults).

### SOLID (applied to React/TS, not OO ceremony)

- **S — Single responsibility**: one component renders one thing. If a `*-form.tsx` exceeds ~250 lines or holds >6 `useState`s, split it (see `/split-component` skill).
- **O — Open/closed**: extend via props/composition (`children`, render props, slots), not by editing a component to special-case a caller.
- **L — Liskov**: any component accepting `Post` must accept any `Post`. Don't gate on string-typed status fields the type doesn't enforce.
- **I — Interface segregation**: prop interfaces should expose only what a component needs. Don't accept the whole `Post` if you only use `title` and `id` — accept those two.
- **D — Dependency inversion**: components depend on `app/types/` (domain), not on `app/lib/api.ts` shapes. The lib maps API → domain.

### Comments

Default to **no comments**. Add one only when the *why* is non-obvious — a workaround, a constraint, an API quirk. Never restate *what* the code does.

```typescript
// Good: explains a non-obvious constraint
// Editor.js mutates the DOM after mount; recreating it on prop change loses cursor state.
const editorRef = useRef<EditorJS | null>(null);

// Bad: restates the code
// Set the editor ref to null
const editorRef = useRef<EditorJS | null>(null);
```

No JSDoc on internal components. Public-API utilities in `app/lib/` may have a one-line summary if the name isn't enough.

---

## 4. File & Symbol Naming

| Kind | Convention | Example |
|---|---|---|
| File names (all) | kebab-case | `post-card.tsx`, `format-date.ts` |
| React components | PascalCase | `PostCard`, `WhitenestHeader` |
| Hooks | camelCase, `use` prefix | `useTheme`, `useDebouncedValue` |
| Functions / vars | camelCase | `formatDate`, `isLocalUrl` |
| Constants | UPPER_SNAKE_CASE only for true module-level constants | `API_BASE_URL`, `MAX_TAGS` |
| Types / interfaces | PascalCase | `Post`, `PostCardProps` |
| Prop interface | Component name + `Props` | `PostCardProps` |
| Event handlers (props) | `on` prefix | `onDelete`, `onSubmit` |
| Event handlers (impl) | `handle` prefix | `handleDelete`, `handleSubmit` |
| Booleans | `is`/`has`/`can`/`should` | `isOpen`, `hasDraft` |
| Route folders | kebab-case or `[param]` | `manage-posts/`, `[id]/` |
| Test files (when added) | `<name>.test.tsx` colocated | `post-card.test.tsx` |

Rules:

- One default export per `page.tsx`/`layout.tsx`; everywhere else, named exports only.
- Component file name matches its primary export in kebab-case form (`post-card.tsx` ↔ `PostCard`).
- No abbreviations except widely understood ones (`id`, `url`, `api`, `ui`). Avoid `mgr`, `ctrl`, `tmp`.

---

## 5. TypeScript Conventions

### Imports

- Use `import type` for type-only imports.
- Use the `@/` path alias from project root. No `../../`.
- Group: 1) external, 2) `@/` internal, 3) relative (only within the same feature folder). One blank line between groups.

### Types vs interfaces

- `interface` for object shapes that may be extended.
- `type` for unions, intersections, mapped/conditional types.

### Banned in app code

- `any` — use `unknown` + a narrow type guard.
- Non-null assertion `!` — use a runtime check or `notFound()`.
- `as Foo` casts on values from `lib/`/network — model the API shape and map explicitly. The only acceptable cast pattern is `as unknown as ToolConstructable` for Editor.js plugins with broken upstream types.

### Type assertions for Editor.js

```typescript
class: Header as unknown as ToolConstructable
```

---

## 6. React & Next.js Patterns

### Server vs Client

- **Default to Server Components.** Only add `"use client"` when the file uses hooks, browser APIs, event handlers, or context consumers.
- Place the directive on line 1, before imports.
- Keep `"use client"` boundaries as narrow as possible — extract the interactive piece, leave the rest server.

### Page components

```typescript
// Server (default) — async, may fetch.
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPost(id);
    if (!post) notFound();
    return <PostShell post={post} />;
}

// Client — params is a Promise, unwrap with React.use.
"use client";
import { use } from "react";
export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    // ...
}
```

### Data fetching

- Fetch in Server Components (route segments) when possible — get caching and streaming for free.
- Use `notFound()` from `next/navigation` for missing entities (don't render a custom 404 by hand).
- Add `export const revalidate = N` or `{ next: { revalidate: N } }` on `fetch` for time-based caching when the API is read-mostly.
- Never expose server-only env vars to the client. Anything not prefixed `NEXT_PUBLIC_` is server-only and must stay server-side.

### Navigation & images

- Internal nav: `next/link`. Never `<a href="/...">`.
- Images: `next/image` with `alt`, plus `fill` + `sizes` or explicit `width`/`height`. Project currently runs `unoptimized: true` because of MinIO; still use `next/image` for layout consistency.

### Dynamic imports

Use `next/dynamic` (with `ssr: false`) or in-effect `import()` for browser-only libs like Editor.js. Never import them statically at module top.

```typescript
useEffect(() => {
    let editor: EditorJS | undefined;
    (async () => {
        const [{ default: EditorJS }, { default: Header }] = await Promise.all([
            import("@editorjs/editorjs"),
            import("@editorjs/header"),
        ]);
        editor = new EditorJS({ /* ... */ });
    })();
    return () => { editor?.destroy?.(); };
}, []);
```

### State

- Local UI state → `useState`.
- App-wide cross-cutting state → React Context in `app/providers/`. The custom hook (`useTheme`) must throw if used outside the provider.
- Derived/computed values → `useMemo` only when measurably hot or referentially-stable-required (e.g. dependency of another memo/effect).
- Don't reach for Redux/Zustand/Jotai. If you think you need one, propose it first.

### Forms & events

- Always `e.preventDefault()` on form submit.
- Stop propagation on nested clickables (e.g. menu button inside a card link).
- Suffix non-submit buttons with `type="button"` to prevent accidental form submission.

---

## 7. Styling

- Tailwind only. No `.module.css`, no inline `style={}` (exception: dynamic computed values like `style={{ width: \`${pct}%\` }}`).
- Use the zinc palette as the primary surface scheme. Always pair light tokens with `dark:` variants.
- Order classes loosely: layout → spacing → sizing → color → typography → state → motion. Biome doesn't enforce, but consistent ordering helps review.

### Palette reference

| Element | Light | Dark |
|---|---|---|
| Page bg | `bg-zinc-50` | `dark:bg-black` |
| Card bg | `bg-white` | `dark:bg-zinc-900` |
| Border | `border-zinc-200` | `dark:border-zinc-800` |
| Border (input) | `border-zinc-300` | `dark:border-zinc-700` |
| Text primary | `text-zinc-900` | `dark:text-zinc-100` |
| Text secondary | `text-zinc-600` | `dark:text-zinc-400` |
| Text muted | `text-zinc-500` | `dark:text-zinc-500` |

### Layout primitives

- Page container: `container mx-auto px-4`.
- Reading-width pages: `max-w-4xl`.
- Card grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
- Sticky header: `sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm`.

---

## 8. Icons

Inline SVG, Heroicons Outline (24x24 viewBox).

```tsx
<svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-zinc-900 dark:text-zinc-100"
    aria-hidden="true"
>
    <path strokeLinecap="round" strokeLinejoin="round" d="..." />
</svg>
```

Required: `aria-hidden="true"` for decorative icons, `strokeWidth={1.5}` (numeric), explicit size class.

---

## 9. Accessibility

1. `type="button"` on every non-submit button.
2. `aria-label` on icon-only buttons.
3. Semantic HTML: `article`, `header`, `main`, `nav`, `section`.
4. Keyboard: Escape closes modals; Enter/Space activates custom interactives.
5. Escape JSX text: `&ldquo;`, `&rdquo;`, `&apos;`, `&amp;` — Biome/ESLint will fail builds otherwise.
6. Visible focus rings (don't `outline-none` without a replacement).

---

## 10. Performance

Treat as guidelines; measure before optimizing further.

- **Default to Server Components.** They ship zero JS to the client. Only opt into `"use client"` for the interactive subtree.
- **Split the client bundle.** Use `next/dynamic` for heavy client-only dependencies (Editor.js, jimp, image-gallery viewers). Set `ssr: false` when the module touches `window`.
- **Cache HTTP at the route.** Prefer `fetch(url, { next: { revalidate: N } })` over client-side polling. Use `cache: "no-store"` only when data is truly per-request.
- **Stream where it helps.** Wrap below-the-fold data fetches in `<Suspense>` + a skeleton. Don't await everything in series in the page component.
- **Memoize sparingly.** `useMemo`/`useCallback` only when a measurable child re-renders or when the value feeds another memo/effect dependency. Otherwise it's noise.
- **Stable list keys.** Never `key={index}` (Biome enforces this); use a stable id from the data.
- **Images.** Always pass `sizes` when using `fill`; size hints prevent CLS even with `unoptimized: true`.
- **Avoid waterfalls in `lib/api.ts`.** Use `Promise.all` for independent requests.
- **Don't import server-only deps from client files.** It bloats the client bundle. Add `import "server-only"` to lib modules that must never ship to the browser.

---

## 11. Security

- **Trust nothing from the API in HTML contexts.** The Editor.js renderer must escape or sanitize HTML; never `dangerouslySetInnerHTML` with raw API content. If a block requires HTML, sanitize first (allowlist tags/attrs).
- **No secrets in `NEXT_PUBLIC_*`.** Client-exposed vars are public. Server-only secrets stay unprefixed and are only read in Server Components, route handlers, or `lib/` modules guarded by `typeof window === "undefined"`.
- **Validate URLs before rendering.** Use `app/utils/is-local-url.ts` (or extend it) to check user-supplied links; reject non-`http(s):` schemes (`javascript:`, `data:`).
- **Image hosts.** Anything new must be added to `next.config.ts > images.remotePatterns`. Don't widen to `**`.
- **Rewrites are public.** The `/api/:path*` rewrite proxies to the backend — assume browsers can call any path. Authorization lives on the backend, not in the client.
- **CSRF / mutations.** Mutating endpoints must require auth tokens issued by the backend; do not rely on cookies alone for unsafe verbs.
- **Dependencies.** Don't add a package to handle a five-line problem. Audit transitive deps for `npm` advisories before merging.
- **No `eval`, no `new Function`.** Same goes for any code that builds a string and runs it.
- **No `console.log` in committed code.** Use a no-op in production or a logger if observability is needed.

---

## 12. Tooling & Build Gates

Run before committing:

```bash
npm run lint        # ESLint (Next.js config)
npm run lint:biome  # Biome lint
npm run check       # Biome lint + format with --write
npm run build       # Type-check + production build
```

Biome formatting: spaces, indent 4, line width 100, double quotes, semicolons always, trailing commas ES5.

Lints worth knowing:

- ESLint: prefer `<Link>` over `<a>`, escape JSX text, `no-img-element`.
- Biome: no switch fallthrough, no array index as key, prefer template literals, no `!important` in CSS (exception: vendor overrides).

---

## 13. Conventional Commits

Format: `type(scope): description`

| Type | Use for |
|---|---|
| `feat` | A new user-visible capability |
| `fix` | A bug fix users would notice |
| `refactor` | Code change with no behavior change |
| `perf` | Refactor whose purpose is measurable speedup |
| `style` | Formatting, whitespace, missing semis (no logic) |
| `docs` | Markdown, comments, README |
| `test` | Adding or fixing tests |
| `chore` | Tooling, deps, build config |
| `build` | Build system / package manager |
| `ci` | GitHub Actions, Docker for CI |

Rules:

- Description ≤ 50 characters, imperative mood ("add", not "added"/"adds"), lowercase, no trailing period.
- Scope is a folder or feature: `posts`, `admin`, `editor`, `whitenest`, `theme`, `types`, `deps`.
- One concern per commit. If the diff straddles two scopes, split the commit.
- Body is optional. When used, wrap at 72 cols and explain *why*, not *what*.
- Breaking changes: append `!` after scope (`feat(api)!: ...`) and add a `BREAKING CHANGE:` footer.

Examples:

- `feat(search): add search bar to filter posts`
- `fix(editor): resolve dynamic import SSR issue`
- `refactor(types): make EditorJsBlock id optional`
- `perf(home): defer most-viewed section with suspense`
- `chore(deps): bump next to 16.1.4`

---

## 14. Anti-Patterns (Do Not)

1. Use `any`. Use `unknown` + a guard.
2. Inline `style={}` for static values. Tailwind class instead.
3. Create per-component `.css` files.
4. Use `var`. Always `const`; `let` only when reassignment is unavoidable.
5. Default-export components (except `page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx`).
6. Mix server and client logic in the same file. Split.
7. Fetch with `useEffect` inside a Server Component.
8. Hardcode hex colors. Use the zinc palette tokens.
9. Use emojis in code, comments, commits, or docs.
10. Build abstractions for hypothetical second callers. Wait for the second.
11. Add backwards-compat shims for deleted code (renamed `_unused`, re-exports, `// removed` comments).
12. Bypass hooks (`--no-verify`) or skip the type-check step.
13. Commit `console.log`, `debugger`, or `// TODO: remove this`.
14. Add new dependencies without justifying why a 30-line util wouldn't do.

---

## 15. Project-Specific Skills

This repo ships three Claude skills under `.claude/skills/`:

- **`create-page`** — scaffold a new App Router page with the project's conventions (server-first, layout.tsx if needed, types wiring).
- **`decouple-code`** — pull mixed concerns out of a file: API calls → `lib/`, helpers → `utils/`, types → `types/`, context → `providers/`.
- **`split-component`** — break a large component (>250 LOC or many `useState`s) into focused subcomponents with clear prop boundaries.

Invoke with `/create-page`, `/decouple-code`, `/split-component`. Each skill enforces the rules in this document.
