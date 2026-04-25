"use client";

import { useEffect, useRef, useState } from "react";
import { getTags } from "@/app/lib/api";
import type { Tag } from "@/app/types/post";

interface TagsInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

/**
 * TagsInput is a combobox-style multi-select. Users can:
 *  - type and pick a suggestion (existing tags from /api/tags?search=...)
 *  - press Enter or comma to "lock in" a tag (creates it on submit if new)
 *  - press Backspace on an empty input to remove the last tag
 */
export default function TagsInput({ value, onChange, placeholder }: TagsInputProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setSuggestions([]);
            return;
        }
        const handle = setTimeout(async () => {
            const results = await getTags(trimmed);
            setSuggestions(results);
        }, 200);
        return () => clearTimeout(handle);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addTag = (raw: string) => {
        const tag = raw.trim();
        if (!tag) return;
        const exists = value.some((t) => t.toLowerCase() === tag.toLowerCase());
        if (exists) {
            setQuery("");
            return;
        }
        onChange([...value, tag]);
        setQuery("");
        setSuggestions([]);
    };

    const removeTag = (index: number) => {
        const next = [...value];
        next.splice(index, 1);
        onChange(next);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(query);
            return;
        }
        if (e.key === "Backspace" && !query && value.length > 0) {
            e.preventDefault();
            removeTag(value.length - 1);
        }
    };

    const filteredSuggestions = suggestions.filter(
        (s) => !value.some((v) => v.toLowerCase() === s.name.toLowerCase())
    );

    return (
        <div ref={wrapperRef} className="relative">
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-zinc-500 dark:focus-within:ring-zinc-400">
                {value.map((tag, i) => (
                    <span
                        key={tag.toLowerCase()}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(i)}
                            aria-label={`Remove tag ${tag}`}
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
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-32 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
            </div>

            {isOpen && filteredSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg">
                    {filteredSuggestions.map((s) => (
                        <li key={s.id}>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    // mouseDown so the input doesn't blur first
                                    e.preventDefault();
                                    addTag(s.name);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                            >
                                {s.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                Press Enter or comma to add a tag.
            </p>
        </div>
    );
}
