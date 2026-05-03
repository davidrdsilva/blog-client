---
name: create-page
description: Scaffold a new App Router page in this Next.js blog-client project following the conventions in CLAUDE.local.md. Use when the user asks to "add a page", "create a route", "new page at /...", or to add a nested/dynamic segment under app/. Picks Server vs Client correctly, wires types from app/types/, fetches via app/lib/api.ts, and applies the project's Tailwind layout primitives.
---

# create-page

Scaffold a new route under `app/` that conforms to this project's conventions. Run when the user asks for a new page, route, or app segment.

## Required input from the user (ask if missing)

1. **Route path** — e.g. `/posts/archive`, `/admin/tags/new`, `/whitenest/[number]/notes`. Determines the folder structure.
2. **Purpose** — read-only display, form, listing, detail. Drives Server vs Client choice and which existing components to compose.
3. **Data source** — does it call an existing function in `app/lib/api.ts`, a new one, or no API? If new, ask whether it's GET-only or mutating.
4. **Auth surface** — public, or part of `app/admin/*`? Admin routes follow the same patterns as `app/admin/manage-posts/page.tsx`.

If any of these are unclear after one round of asking, propose a default and proceed.

## Procedure

1. **Locate the folder.** Translate the route path to `app/<segments>/page.tsx`. Use `[param]` for dynamic segments. Create intermediate folders only as needed; do not add empty `layout.tsx` files.
2. **Pick the component kind:**
   - Default to **Server Component**. No `"use client"`.
   - Client Component only if the page needs hooks, browser APIs, event handlers, or context. Then put `"use client"` on line 1.
3. **Generate the file** using the matching template below. Use 4-space indent, double quotes, semicolons, named helpers above the component.
4. **Wire data through `app/lib/api.ts`.** Never call `fetch` from a page directly. If the function doesn't exist, add it to `app/lib/api.ts` and export it; map the API shape to a domain type from `app/types/`.
5. **Compose existing components** from `app/components/` for navbar, footer, post-grid, etc. Do not duplicate layout chrome.
6. **Handle missing entities** with `notFound()` from `next/navigation` for dynamic routes.
7. **Add metadata** when the page is user-visible: export `metadata` (Server) or `generateMetadata` (dynamic Server). Skip on admin/internal routes.
8. **Skip a `layout.tsx`** unless the new segment needs shared chrome distinct from the parent. Re-using parent layouts is preferred (KISS).
9. **Verify the build.** Run `npm run lint` and `npm run build` after writing. Fix issues before declaring done.

## Decision rules

- Folder under `[param]/` → use `params: Promise<{ param: string }>` and `await params` (server) or `use(params)` (client).
- Page-only helper components → colocate in the same folder (`app/<route>/_components/foo.tsx`). Promote to `app/components/` only on second consumer.
- Forms → Client Component. Submit handlers call `app/lib/api.ts`; do not embed mutation HTTP calls in the page file.
- Listings with filters/search → Server Component for data + a small Client island for the interactive control.

## Template — Server page (static or fetched)

```typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { getXxx } from "@/app/lib/api";

export const metadata: Metadata = {
    title: "Page Title",
    description: "Short, user-facing description.",
};

export default async function XxxPage() {
    const data = await getXxx();
    if (!data) notFound();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* render data via existing components */}
            </main>
            <Footer />
        </div>
    );
}
```

## Template — Server page with dynamic segment

```typescript
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost } from "@/app/lib/api";

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;
    const post = await getPost(id);
    return { title: post?.title ?? "Not found" };
}

export default async function PostDetailPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const post = await getPost(id);
    if (!post) notFound();
    return /* ... */;
}
```

## Template — Client page (interactive form)

```typescript
"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { PostForm } from "@/app/components/post-form";

export default function EditPostPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = use(params);
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    return /* ... */;
}
```

## Definition of done

- File created at the correct path with default export.
- No `"use client"` unless required.
- All HTTP goes through `app/lib/api.ts` returning domain types from `app/types/`.
- Tailwind tokens from the zinc palette; light + dark variants.
- `npm run lint` and `npm run build` pass.
- Reported back: the new route URL, the file path, any new lib/util/type added, and whether a layout was introduced.
