"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Category } from "@/app/types/post";

interface CategorySelectProps {
    id?: string;
    categories: Category[];
    value: number | "";
    onChange: (value: number) => void;
    placeholder?: string;
}

interface TriggerRect {
    top: number;
    left: number;
    width: number;
}

export default function CategorySelect({
    id,
    categories,
    value,
    onChange,
    placeholder = "Select…",
}: CategorySelectProps) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [rect, setRect] = useState<TriggerRect | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const reactId = useId();
    const listId = `${id ?? reactId}-list`;

    const selected = categories.find((c) => c.id === value) ?? null;

    // Sections in the form establish stacking contexts (transform on fade-up
    // animation), so the listbox must render in a portal with position: fixed
    // anchored to the trigger's bounding rect.
    useEffect(() => {
        if (!open) return;
        const measure = () => {
            const el = triggerRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            setRect({ top: r.bottom, left: r.left, width: r.width });
        };
        measure();
        window.addEventListener("scroll", measure, true);
        window.addEventListener("resize", measure);
        return () => {
            window.removeEventListener("scroll", measure, true);
            window.removeEventListener("resize", measure);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target)) return;
            if (listRef.current?.contains(target)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const idx = categories.findIndex((c) => c.id === value);
        setActiveIndex(idx >= 0 ? idx : 0);
    }, [open, value, categories]);

    useEffect(() => {
        if (!open || activeIndex < 0) return;
        const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
        el?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    const commitAt = (index: number) => {
        const c = categories[index];
        if (!c) return;
        onChange(c.id);
        setOpen(false);
        triggerRef.current?.focus();
    };

    const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (!open) {
            if (
                e.key === "ArrowDown" ||
                e.key === "ArrowUp" ||
                e.key === "Enter" ||
                e.key === " "
            ) {
                e.preventDefault();
                setOpen(true);
            }
            return;
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, categories.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
                break;
            case "Home":
                e.preventDefault();
                setActiveIndex(0);
                break;
            case "End":
                e.preventDefault();
                setActiveIndex(categories.length - 1);
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                commitAt(activeIndex);
                break;
            case "Escape":
                e.preventDefault();
                setOpen(false);
                break;
            case "Tab":
                setOpen(false);
                break;
        }
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                id={id}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={
                    open && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
                }
                onClick={() => setOpen((v) => !v)}
                onKeyDown={handleKey}
                className={`group w-full flex items-center justify-between gap-3 bg-transparent border-0 border-b px-0 py-3 text-left text-lg transition-colors focus:outline-none cursor-pointer ${
                    open
                        ? "border-zinc-900 dark:border-zinc-100"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500"
                }`}
            >
                <span
                    className={`truncate ${
                        selected
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-400 dark:text-zinc-600"
                    }`}
                >
                    {selected ? selected.name : placeholder}
                </span>
                <span
                    aria-hidden="true"
                    className={`shrink-0 text-xs text-zinc-500 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                    }`}
                >
                    ▾
                </span>
            </button>

            {open &&
                rect &&
                createPortal(
                    <div
                        ref={listRef}
                        id={listId}
                        role="listbox"
                        style={{
                            position: "fixed",
                            top: rect.top + 8,
                            left: rect.left,
                            width: rect.width,
                        }}
                        className="z-50 max-h-72 overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)] origin-top animate-[fade-up_0.15s_ease-out_both]"
                    >
                        {categories.length === 0 ? (
                            <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">
                                No categories
                            </div>
                        ) : (
                            categories.map((c, i) => {
                                const isSelected = value === c.id;
                                const isActive = activeIndex === i;
                                return (
                                    <div
                                        key={c.id}
                                        id={`${listId}-opt-${i}`}
                                        role="option"
                                        tabIndex={-1}
                                        aria-selected={isSelected}
                                        onMouseEnter={() => setActiveIndex(i)}
                                        onMouseDown={(e) => {
                                            // mousedown so we beat the outside-click watcher
                                            e.preventDefault();
                                            commitAt(i);
                                        }}
                                        className={`relative flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors ${
                                            isActive
                                                ? "bg-zinc-100 dark:bg-zinc-900"
                                                : "bg-transparent"
                                        }`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors ${
                                                isActive
                                                    ? "bg-zinc-900 dark:bg-zinc-100"
                                                    : "bg-transparent"
                                            }`}
                                        />
                                        <span
                                            className={`truncate ${
                                                isSelected
                                                    ? "font-bold text-zinc-900 dark:text-zinc-100"
                                                    : "text-zinc-700 dark:text-zinc-300"
                                            }`}
                                        >
                                            {c.name}
                                        </span>
                                        {c.isInternal && (
                                            <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>,
                    document.body
                )}
        </div>
    );
}
