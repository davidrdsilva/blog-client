"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getCharacters } from "@/app/lib/api";
import type { Character } from "@/app/types/post";

interface CharacterPickerProps {
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
}

interface AnchorRect {
    top: number;
    left: number;
    width: number;
}

/**
 * CharacterPicker is a multi-select that appends characters to an ordered
 * list. Unlike TagsInput it doesn't allow freetext creation — only existing
 * characters can be picked. New ones are created via the admin page.
 */
export default function CharacterPicker({ value, onChange, placeholder }: CharacterPickerProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Character[]>([]);
    const [cache, setCache] = useState<Record<string, Character>>({});
    const [isOpen, setIsOpen] = useState(false);
    const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Track the input container's position so the portaled dropdown can
    // anchor under it. rAF-throttled so mobile momentum scroll doesn't jitter
    // the dropdown position by re-rendering between paint frames.
    useEffect(() => {
        if (!isOpen) return;
        let raf = 0;
        const measure = () => {
            const el = anchorRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            setAnchorRect({ top: r.bottom, left: r.left, width: r.width });
        };
        const schedule = () => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(measure);
        };
        measure();
        window.addEventListener("scroll", schedule, true);
        window.addEventListener("resize", schedule);
        return () => {
            if (raf) cancelAnimationFrame(raf);
            window.removeEventListener("scroll", schedule, true);
            window.removeEventListener("resize", schedule);
        };
    }, [isOpen]);

    // Hydrate the cache for any selected IDs we don't yet have full data for —
    // e.g. when editing an existing post.
    useEffect(() => {
        const missing = value.filter((id) => !cache[id]);
        if (missing.length === 0) return;
        let cancelled = false;
        (async () => {
            const all = await getCharacters();
            if (cancelled) return;
            setCache((prev) => {
                const next = { ...prev };
                for (const c of all) next[c.id] = c;
                return next;
            });
        })();
        return () => {
            cancelled = true;
        };
    }, [value, cache]);

    // Suggestions debounce. When the query is empty we leave the cached
    // suggestions in place; the render path filters them out below.
    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) return;
        const handle = setTimeout(async () => {
            const results = await getCharacters(trimmed);
            setSuggestions(results);
        }, 200);
        return () => clearTimeout(handle);
    }, [query]);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (wrapperRef.current?.contains(target)) return;
            if (listRef.current?.contains(target)) return;
            setIsOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const addCharacter = (character: Character) => {
        if (value.includes(character.id)) {
            setQuery("");
            return;
        }
        onChange([...value, character.id]);
        setCache((prev) => ({ ...prev, [character.id]: character }));
        setQuery("");
    };

    const removeAt = (index: number) => {
        const nextValue = [...value];
        nextValue.splice(index, 1);
        onChange(nextValue);
    };

    const selected = value.map((id) => cache[id]).filter((c): c is Character => Boolean(c));
    const filteredSuggestions = query.trim()
        ? suggestions.filter((s) => !value.includes(s.id))
        : [];

    return (
        <div ref={wrapperRef} className="relative">
            <div
                ref={anchorRef}
                className="flex flex-wrap items-center gap-2 px-0 py-3 border-0 border-b border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:border-zinc-900 dark:focus-within:border-zinc-100 transition-colors"
            >
                {selected.map((character, i) => (
                    <span
                        key={character.id}
                        className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm"
                    >
                        <Image
                            src={character.portrait}
                            alt=""
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full object-cover"
                            unoptimized
                        />
                        {character.shortName}
                        <button
                            type="button"
                            onClick={() => removeAt(i)}
                            aria-label={`Remove ${character.shortName}`}
                            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={selected.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-32 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
            </div>

            {isOpen &&
                anchorRect &&
                filteredSuggestions.length > 0 &&
                createPortal(
                    <ul
                        ref={listRef}
                        className="fixed z-50 max-h-64 overflow-auto border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0a0a0a] shadow-2xl"
                        style={{
                            top: anchorRect.top + 4,
                            left: anchorRect.left,
                            width: anchorRect.width,
                        }}
                    >
                        {filteredSuggestions.map((s) => (
                            <li key={s.id}>
                                <button
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        addCharacter(s);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-3 cursor-pointer"
                                >
                                    <Image
                                        src={s.portrait}
                                        alt=""
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full object-cover"
                                        unoptimized
                                    />
                                    <span className="flex-1">
                                        <span className="block text-zinc-900 dark:text-zinc-100">
                                            {s.shortName}
                                        </span>
                                        <span className="block text-xs text-zinc-500 dark:text-zinc-500">
                                            {s.fullName} — {s.occupation}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>,
                    document.body
                )}

            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500">
                Type to search ·{" "}
                <Link
                    href="/admin/characters/new"
                    target="_blank"
                    className="underline hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                    Create new
                </Link>
            </p>
        </div>
    );
}
