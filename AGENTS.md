# AI Agent Guidelines for blog-client

This document defines the rules and conventions AI agents must follow when implementing or maintaining code in this project.

## Project Overview

- **Framework**: Next.js 16.x with App Router
- **Language**: TypeScript 5.x with strict mode enabled
- **UI**: React 19.x
- **Styling**: Tailwind CSS 4.x
- **Linting**: ESLint 9.x (eslint-config-next) + Biome 2.x
- **Content Editor**: Editor.js 2.x

---

## Project Structure

```
app/
  components/     # Reusable UI components
  data/           # Static data and mock data
  posts/          # Post-related pages (dynamic routes)
  providers/      # React Context providers
  types/          # TypeScript type definitions
  globals.css     # Global styles and Tailwind configuration
  layout.tsx      # Root layout
  page.tsx        # Home page
types/            # External module type declarations
```

### File Organization Rules

1. Place reusable components in `app/components/`
2. Place page-specific components within the page directory if not reusable
3. Place TypeScript interfaces and types in `app/types/`
4. Place external module declarations (`.d.ts`) in root `types/`
5. Place React Context providers in `app/providers/`
6. Use kebab-case for all file names (e.g., `post-card.tsx`, `theme-toggle.tsx`)

---

## Code Formatting

Enforced by Biome configuration:

| Rule | Value |
|------|-------|
| Indent style | Spaces |
| Indent width | 4 |
| Line width | 100 characters |
| Quote style | Double quotes |
| Semicolons | Always |
| Trailing commas | ES5 |

Run `npm run format` to auto-format code before committing.

---

## TypeScript Conventions

### Type Imports

Always use `import type` for type-only imports:

```typescript
// Correct
import type { Post } from "@/app/types/post";
import type { ToolConstructable } from "@editorjs/editorjs";

// Incorrect
import { Post } from "@/app/types/post";
```

### Interface Definitions

1. Define component prop interfaces directly above the component
2. Use `interface` for object shapes, `type` for unions/intersections
3. Suffix prop interfaces with `Props` (e.g., `PostCardProps`)
4. Mark optional properties with `?`

```typescript
interface PostCardProps {
    post: Post;
    onDelete?: (postId: string) => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
    // ...
}
```

### Type Assertions

When dealing with external libraries with incomplete types, use double assertion:

```typescript
class: Header as unknown as ToolConstructable
```

### Path Aliases

Always use the `@/` alias for imports from the project root:

```typescript
// Correct
import { ThemeToggle } from "@/app/components/theme-toggle";

// Incorrect
import { ThemeToggle } from "../../components/theme-toggle";
```

---

## React Component Patterns

### Server vs Client Components

1. **Default to Server Components** - Do not add "use client" unless required
2. **Use Client Components when**:
   - Using React hooks (useState, useEffect, useRef, etc.)
   - Using browser APIs (localStorage, document, window)
   - Adding event handlers (onClick, onChange, etc.)
   - Using React Context consumers

3. Place `"use client"` directive at the top of the file, before imports:

```typescript
"use client";

import { useState } from "react";
```

### Component Exports

Use named exports for all components:

```typescript
// Correct
export function PostCard({ post }: PostCardProps) {}

// Incorrect
export default function PostCard({ post }: PostCardProps) {}
```

Exception: Page components (`page.tsx`) must use default exports as required by Next.js.

### Helper Functions

Define helper functions within the component file, above the component:

```typescript
function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export function PostCard({ post }: PostCardProps) {
    const formattedDate = formatDate(post.date);
    // ...
}
```

### Dynamic Imports

Use dynamic imports for browser-only libraries (like Editor.js) to prevent SSR issues:

```typescript
useEffect(() => {
    const initEditor = async () => {
        const [
            { default: EditorJS },
            { default: Header },
        ] = await Promise.all([
            import("@editorjs/editorjs"),
            import("@editorjs/header"),
        ]);
        // Initialize editor
    };
    initEditor();
}, []);
```

---

## Styling Guidelines

### Tailwind CSS Classes

1. Use the zinc color palette as the primary color scheme
2. Always provide dark mode variants using the `dark:` prefix
3. Follow this pattern for interactive elements:

```typescript
// Button/Interactive element pattern
className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
```

### Color Palette Reference

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background (page) | `bg-zinc-50` | `dark:bg-black` |
| Background (card) | `bg-white` | `dark:bg-zinc-900` |
| Border | `border-zinc-200` | `dark:border-zinc-800` |
| Border (input) | `border-zinc-300` | `dark:border-zinc-700` |
| Text (primary) | `text-zinc-900` | `dark:text-zinc-100` |
| Text (secondary) | `text-zinc-600` | `dark:text-zinc-400` |
| Text (muted) | `text-zinc-500` | `dark:text-zinc-500` |

### Layout Patterns

1. Use `container mx-auto px-4` for page content containers
2. Use `max-w-4xl` for content-focused pages (post detail, forms)
3. Use responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

### Header Pattern

```typescript
<header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Content */}
    </div>
</header>
```

---

## Icons

Use inline SVG icons from Heroicons (Outline style, 24x24 viewBox):

```typescript
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

Required attributes:
- `aria-hidden="true"` for decorative icons
- `className` with size (`w-5 h-5`) and color classes
- `strokeWidth={1.5}` (numeric, not string)

---

## Accessibility

1. Add `type="button"` to all non-submit buttons
2. Provide `aria-label` for icon-only buttons
3. Use semantic HTML elements (`article`, `header`, `main`, `nav`)
4. Add `role` and `aria-*` attributes to custom interactive components
5. Support keyboard navigation (Escape to close modals, Enter to activate)
6. Escape special characters in JSX text using HTML entities:

```typescript
// Correct
<p>No posts found matching &ldquo;{query}&rdquo;</p>

// Incorrect (will cause ESLint error)
<p>No posts found matching "{query}"</p>
```

---

## Next.js Patterns

### Page Components

```typescript
// Server Component page (default)
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // ...
}

// Client Component page
"use client";

import { use } from "react";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    // ...
}
```

### Navigation

Always use `next/link` for internal navigation:

```typescript
import Link from "next/link";

<Link href="/posts/new">New Post</Link>
```

### Images

Use `next/image` with required props:

```typescript
import Image from "next/image";

<Image
    src={url}
    alt={description}
    fill                    // or width/height
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 800px"
/>
```

### Not Found Handling

```typescript
import { notFound } from "next/navigation";

if (!post) {
    notFound();
}
```

---

## State Management

### Local State

Use React hooks for component-local state:

```typescript
const [isOpen, setIsOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
```

### Global State

Use React Context for app-wide state (e.g., theme):

```typescript
// Provider pattern
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
```

### Derived State

Use `useMemo` for expensive computations:

```typescript
const filteredPosts = useMemo(
    () => searchPosts(allPosts, searchQuery),
    [allPosts, searchQuery]
);
```

---

## Event Handling

### Click Event Propagation

When nesting interactive elements, stop propagation:

```typescript
const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
};
```

### Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission
};

<form onSubmit={handleSubmit}>
```

---

## Linting Rules

### ESLint (Next.js)

- Use `<Link>` instead of `<a>` for internal navigation
- Escape special characters in JSX

### Biome

- No switch case fallthrough without explicit `break`
- No array index as React key (use unique identifiers)
- Prefer template literals over string concatenation
- No `!important` in CSS (exception: third-party library overrides)

Run before committing:

```bash
npm run lint        # ESLint
npm run lint:biome  # Biome
npm run build       # TypeScript check
```

---

## Commit Messages

Follow Conventional Commits format:

```
type(scope): description
```

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`

Examples:
- `feat(search): add search bar to filter posts`
- `fix(editor): resolve dynamic import SSR issue`
- `refactor(types): make EditorJsBlock id optional`

Maximum 50 characters for the description. No commit body required.

---

## Anti-Patterns to Avoid

1. **Do not** use `any` type - use `unknown` and type guards instead
2. **Do not** use inline styles - use Tailwind classes
3. **Do not** create `.css` files for components - use Tailwind
4. **Do not** use `var` - use `const` or `let`
5. **Do not** use default exports for components (except pages)
6. **Do not** mix Server and Client Component logic in the same file
7. **Do not** use `useEffect` for data fetching in Server Components
8. **Do not** hardcode colors - use the zinc palette variables
9. **Do not** use emojis in code, comments, or documentation
10. **Do not** create unnecessary abstractions - follow KISS principle
