---
name: split-component
description: Break a large React component in this Next.js blog-client repo into smaller, focused subcomponents. Use when the user asks to "split", "break up", "extract subcomponents", "this component is too big", or when a *.tsx file exceeds ~250 lines, holds many useState hooks, or renders multiple visually distinct sections. Applies the Single Responsibility Principle from CLAUDE.local.md and produces named-export components with minimal prop surfaces.
---

# split-component

Decompose a large `.tsx` file into smaller components, each with one responsibility and a minimal prop interface. Run when a component is too big, too stateful, or renders distinct sections that could be reasoned about in isolation.

## Triggers

Apply when any of these hold for the target file:

- Length over ~250 lines (hard signal). Known offenders: `post-form.tsx`, `character-form.tsx`, `whitenest-manage-chapters.tsx`, `drafts-sidebar.tsx`, `main-nav-sidebar.tsx`, `manage-posts-archive.tsx`, `image-gallery.tsx`.
- Six or more `useState` calls, or state that clusters into clearly independent groups.
- Two or more clearly separable visual regions (header / list / footer / modal) sharing nothing but layout.
- A render branch (early return for loading/empty/error) that itself contains substantial JSX.
- A nested component declared inside another component (re-created on every render).

## Procedure

1. **Read the whole file.** Don't split blind — understand the full state graph and JSX tree first.
2. **Identify seams.** Look for:
   - JSX subtrees with self-contained props (a region that depends on a small slice of state).
   - State variables that are only read/written within one subtree → those move with the subtree.
   - Repeated JSX (a row, a card, a field) → extract a single reusable subcomponent.
   - Effects scoped to one concern (autosave, keyboard listener) → candidate for a custom hook.
3. **Sketch the new shape** and confirm with the user when the split adds 3+ new files. Show: parent component name, list of subcomponents with one-line responsibilities, any new hooks. If the user gives a thumbs-up or the change is small, proceed.
4. **Decide locations:**
   - Reusable across routes → `app/components/<name>.tsx`.
   - Used only by one page/route → colocate in `app/<route>/_components/<name>.tsx`.
   - Custom hook → `app/<route>/_hooks/use-<thing>.ts` (page-local) or `app/hooks/use-<thing>.ts` if cross-route (create the folder on first use).
5. **Extract one piece at a time.** After each extraction, the file must still build. Do not big-bang the split.
6. **Minimize prop surface.** Pass only what the subcomponent uses. If you'd pass a whole `Post` to use only `title` and `id`, pass `{ title, id }` instead. Honor Interface Segregation (CLAUDE.local.md §3).
7. **Lift state to the lowest common ancestor** of its readers/writers. If state is read in one subcomponent only, move the `useState` into that subcomponent.
8. **Stable callbacks.** When a parent passes a handler that triggers a child re-render, wrap it with `useCallback` only if the child is memoized — otherwise it's noise (KISS).
9. **Memoize children selectively.** Wrap a subcomponent in `React.memo` only when it's expensive and re-renders measurably.
10. **Delete dead code from the parent** as it gets thinner. No "moved to..." comments, no re-exports from the old location.
11. **Validate.** Run `npm run lint`, `npm run lint:biome`, and `npm run build`. Manually verify the affected page in the browser if the project's dev server is running.

## Naming

- File: kebab-case matching the component (`tag-list-input.tsx` ↔ `TagListInput`).
- Page-local components: prefix with the parent feature when ambiguous (e.g. `post-form-cover-uploader.tsx`).
- Event prop names: `on<Event>` (`onSelect`, `onRemove`, `onSubmit`).
- Hook names: `use<Noun>` returning a stable object/tuple.

## Patterns

### Pattern: form with sections

A 600-line form usually contains: meta fields, body editor, taxonomy (tags/category), preview, save bar. Split into:

```
post-form.tsx                 (parent: state shell + submit)
post-form-meta-fields.tsx     (title/subtitle/description)
post-form-body-editor.tsx     (Editor.js mount + dynamic import)
post-form-taxonomy.tsx        (tags + category selectors)
post-form-save-bar.tsx        (sticky footer with actions)
```

The parent owns the `Post` draft state; subcomponents receive slices and `onChange<Field>` handlers.

### Pattern: list + item

A list rendering complex rows. Extract `<ListItem>` with the smallest viable props.

```typescript
function ChapterList({ chapters, onReorder, onDelete }: ChapterListProps) {
    return (
        <ul>
            {chapters.map(c => (
                <ChapterListItem key={c.id} chapter={c} onDelete={onDelete} />
            ))}
        </ul>
    );
}
```

### Pattern: effect cluster → hook

A component with three `useEffect`s that together implement "autosave drafts to localStorage" → extract `useAutosaveDraft(draft)`.

### Pattern: nested component declared inside parent

```typescript
// Anti-pattern — recreated each render, breaks memoization, hurts DX.
function Parent() {
    function Child() { /* ... */ }
    return <Child />;
}
```

Always lift the inner component to the module scope or a sibling file.

## Boundaries

- Don't split below ~30 lines of JSX. Tiny components add navigation tax for no clarity gain.
- Don't introduce prop-drilling depths > 2 levels. If you would, lift state to a Context (page-scoped) or pass an object slice.
- Don't extract a subcomponent that needs 8+ props — that's a sign the seam is wrong; rethink the boundary.
- Don't add `forwardRef` unless the consumer actually needs the ref. KISS.

## Definition of done

- Parent file is materially shorter and reads as orchestration: state, derived values, layout, render of children.
- Each new component does one thing, has a `<Name>Props` interface declared above it, named export only.
- No nested components-inside-components remain.
- No layer violations introduced (subcomponents follow CLAUDE.local.md §2).
- Lints and `npm run build` pass.
- Report: parent line count before/after, list of new files with one-line responsibilities, any new hooks.
