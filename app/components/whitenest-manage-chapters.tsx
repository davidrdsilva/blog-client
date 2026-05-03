"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { APIClientError, reorderWhitenestChapters } from "@/app/lib/api";
import type { WhitenestChapterSummary } from "@/app/types/post";

interface WhitenestManageChaptersProps {
    initialChapters: WhitenestChapterSummary[];
}

type SaveState =
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "saved" }
    | { kind: "error"; message: string; code: string };

const SAVED_FLASH_MS = 1800;

export default function WhitenestManageChapters({ initialChapters }: WhitenestManageChaptersProps) {
    const [chapters, setChapters] = useState<WhitenestChapterSummary[]>(initialChapters);
    const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
    const [draggedIndex, setDraggedIndex] = useState(-1);
    const [insertIndex, setInsertIndex] = useState(-1);
    const [dragOffsetY, setDragOffsetY] = useState(0);

    const baselineRef = useRef<WhitenestChapterSummary[]>(initialChapters);
    const listRef = useRef<HTMLUListElement | null>(null);
    const dragOriginRef = useRef<{ pointerY: number; rowRects: DOMRect[] } | null>(null);

    useEffect(() => {
        if (saveState.kind !== "saved") return;
        const t = window.setTimeout(() => {
            setSaveState((s) => (s.kind === "saved" ? { kind: "idle" } : s));
        }, SAVED_FLASH_MS);
        return () => window.clearTimeout(t);
    }, [saveState]);

    const isDragging = draggedIndex >= 0;
    const isSaving = saveState.kind === "saving";

    const handlePointerDown = useCallback(
        (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
            if (isSaving) return;
            if (event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);

            const list = listRef.current;
            if (!list) return;
            const rowEls = Array.from(list.querySelectorAll<HTMLElement>("[data-chapter-row]"));
            dragOriginRef.current = {
                pointerY: event.clientY,
                rowRects: rowEls.map((el) => el.getBoundingClientRect()),
            };
            setDraggedIndex(index);
            setInsertIndex(index);
            setDragOffsetY(0);
        },
        [isSaving]
    );

    const handlePointerMove = useCallback(
        (event: React.PointerEvent<HTMLButtonElement>) => {
            const origin = dragOriginRef.current;
            if (!origin || draggedIndex < 0) return;

            setDragOffsetY(event.clientY - origin.pointerY);

            // Compute the insertion index by finding the first row whose
            // vertical midpoint sits below the pointer. If the pointer is past
            // every row, target == length (drop at end).
            const pointerY = event.clientY;
            let target = origin.rowRects.length;
            for (let i = 0; i < origin.rowRects.length; i++) {
                const rect = origin.rowRects[i];
                if (pointerY < rect.top + rect.height / 2) {
                    target = i;
                    break;
                }
            }
            setInsertIndex(target);
        },
        [draggedIndex]
    );

    const persistOrder = useCallback(async (next: WhitenestChapterSummary[]): Promise<void> => {
        setSaveState({ kind: "saving" });
        try {
            await reorderWhitenestChapters(next.map((c) => c.id));
            baselineRef.current = next;
            setSaveState({ kind: "saved" });
        } catch (err) {
            setChapters(baselineRef.current);
            const { code, message } = describeError(err);
            setSaveState({ kind: "error", code, message });
        }
    }, []);

    const handlePointerUp = useCallback(
        (event: React.PointerEvent<HTMLButtonElement>) => {
            if (draggedIndex < 0) return;
            event.currentTarget.releasePointerCapture(event.pointerId);

            const from = draggedIndex;
            let to = insertIndex;
            if (to > from) to -= 1;

            setDraggedIndex(-1);
            setInsertIndex(-1);
            setDragOffsetY(0);
            dragOriginRef.current = null;

            if (from === to || to < 0 || to >= chapters.length) return;

            const next = arrayMove(chapters, from, to);
            setChapters(next);
            void persistOrder(next);
        },
        [chapters, draggedIndex, insertIndex, persistOrder]
    );

    const handlePointerCancel = useCallback(
        (event: React.PointerEvent<HTMLButtonElement>) => {
            if (draggedIndex < 0) return;
            event.currentTarget.releasePointerCapture(event.pointerId);
            setDraggedIndex(-1);
            setInsertIndex(-1);
            setDragOffsetY(0);
            dragOriginRef.current = null;
        },
        [draggedIndex]
    );

    return (
        <div className="space-y-10 lg:space-y-14">
            <ManageChaptersHeader total={chapters.length} saveState={saveState} />

            {chapters.length === 0 ? (
                <p className="py-16 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                    The spine is empty
                </p>
            ) : (
                <ul
                    ref={listRef}
                    className={`relative border-t border-zinc-200 dark:border-zinc-800 ${
                        isSaving ? "pointer-events-none" : ""
                    }`}
                    aria-label="Whitenest chapter spine"
                >
                    {chapters.map((chapter, index) => {
                        const isThisDragging = index === draggedIndex;
                        const showInsertBefore =
                            isDragging &&
                            insertIndex === index &&
                            insertIndex !== draggedIndex &&
                            insertIndex !== draggedIndex + 1;
                        return (
                            <ChapterRow
                                key={chapter.id}
                                chapter={chapter}
                                displayNumber={index + 1}
                                isDragging={isThisDragging}
                                showInsertBefore={showInsertBefore}
                                dragOffsetY={isThisDragging ? dragOffsetY : 0}
                                onPointerDown={(e) => handlePointerDown(e, index)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerCancel}
                                disabled={isSaving}
                            />
                        );
                    })}
                    {isDragging &&
                        insertIndex === chapters.length &&
                        draggedIndex !== chapters.length - 1 &&
                        draggedIndex !== chapters.length && (
                            <li aria-hidden className="h-0.5 -mb-px bg-red-600 dark:bg-red-400" />
                        )}
                </ul>
            )}
        </div>
    );
}

function ManageChaptersHeader({ total, saveState }: { total: number; saveState: SaveState }) {
    return (
        <header className="space-y-6 sm:space-y-8 animate-[fade-up_0.6s_ease-out_both]">
            <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] sm:tracking-[0.5em] text-zinc-500 dark:text-zinc-500">
                    Admin · Editorial Desk · Whitenest
                </p>
                <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-zinc-900 dark:text-zinc-100 leading-[1.05] tracking-tight">
                    The Spine
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                    {total === 0 ? (
                        "no chapters bound yet"
                    ) : (
                        <>
                            <span className="sm:hidden">
                                {total} chapter{total === 1 ? "" : "s"} · drag to reorder
                            </span>
                            <span className="hidden sm:inline">
                                {total} chapter{total === 1 ? "" : "s"} on the spine · drag the
                                handle to renumber · saves on release
                            </span>
                        </>
                    )}
                </p>
            </div>

            <SaveBanner state={saveState} />
        </header>
    );
}

function SaveBanner({ state }: { state: SaveState }) {
    if (state.kind === "idle") return null;
    if (state.kind === "saving") {
        return (
            <output
                aria-live="polite"
                className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500 border-l-2 border-zinc-300 dark:border-zinc-700 pl-4 py-2"
            >
                <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-ping opacity-75" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400" />
                </span>
                <span>Setting type · saving order</span>
            </output>
        );
    }
    if (state.kind === "saved") {
        return (
            <output
                aria-live="polite"
                className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700 dark:text-zinc-300 border-l-2 border-zinc-700 dark:border-zinc-300 pl-4 py-2 animate-[fade-up_0.4s_ease-out_both]"
            >
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 dark:bg-zinc-300" />
                <span>Pressed · order persisted</span>
            </output>
        );
    }
    // error
    return (
        <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-3 text-sm text-red-700 dark:text-red-300 border-l-2 border-red-700 dark:border-red-400 pl-4 py-2"
        >
            <span className="font-bold uppercase tracking-[0.3em] text-[10px] mt-0.5 shrink-0">
                {state.code === "CHAPTER_SET_MISMATCH" ? "Stale" : "Error"}
            </span>
            <span className="font-serif">{state.message}</span>
        </div>
    );
}

function ChapterRow({
    chapter,
    displayNumber,
    isDragging,
    showInsertBefore,
    dragOffsetY,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    disabled,
}: {
    chapter: WhitenestChapterSummary;
    displayNumber: number;
    isDragging: boolean;
    showInsertBefore: boolean;
    dragOffsetY: number;
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLButtonElement>) => void;
    disabled: boolean;
}) {
    const tagsLabel = chapter.tags
        .slice(0, 3)
        .map((t) => t.name)
        .join(" · ");

    return (
        <li
            data-chapter-row
            className={`group relative border-b border-zinc-200 dark:border-zinc-800 ${
                isDragging ? "z-20" : ""
            }`}
            style={
                isDragging
                    ? {
                          transform: `translateY(${dragOffsetY}px)`,
                          transition: "none",
                      }
                    : undefined
            }
        >
            {showInsertBefore && (
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 -top-px h-0.5 bg-red-600 dark:bg-red-400 z-10"
                />
            )}

            <div
                className={`grid grid-cols-[2.5rem_4.25rem_minmax(0,1fr)_auto] sm:grid-cols-[2.5rem_5.5rem_5rem_minmax(0,1fr)_auto] items-center gap-3 sm:gap-6 py-4 sm:py-5 px-2 sm:px-3 -mx-2 sm:-mx-3 transition-colors ${
                    isDragging
                        ? "bg-zinc-50 dark:bg-zinc-900/60 shadow-[0_18px_36px_-22px_rgba(0,0,0,0.45)] dark:shadow-[0_18px_36px_-22px_rgba(0,0,0,0.9)]"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                }`}
            >
                <button
                    type="button"
                    aria-label={`Reorder chapter ${displayNumber}: ${chapter.title}`}
                    disabled={disabled}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerCancel}
                    className={`flex items-center justify-center h-9 w-9 -ml-1 rounded-sm text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors ${
                        isDragging
                            ? "cursor-grabbing text-zinc-900 dark:text-zinc-100"
                            : "cursor-grab"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                    style={{ touchAction: "none" }}
                >
                    <svg
                        width="14"
                        height="18"
                        viewBox="0 0 14 18"
                        fill="none"
                        role="img"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <title>Drag handle</title>
                        <circle cx="3" cy="3" r="1.4" fill="currentColor" />
                        <circle cx="11" cy="3" r="1.4" fill="currentColor" />
                        <circle cx="3" cy="9" r="1.4" fill="currentColor" />
                        <circle cx="11" cy="9" r="1.4" fill="currentColor" />
                        <circle cx="3" cy="15" r="1.4" fill="currentColor" />
                        <circle cx="11" cy="15" r="1.4" fill="currentColor" />
                    </svg>
                </button>

                <div className="flex flex-col leading-none">
                    <span className="hidden sm:block text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600 mb-1">
                        Chapter
                    </span>
                    <span className="font-serif italic text-3xl sm:text-4xl tabular-nums text-zinc-900 dark:text-zinc-100">
                        {displayNumber.toString().padStart(2, "0")}
                    </span>
                </div>

                <div className="hidden sm:block relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    {chapter.image ? (
                        <Image
                            src={chapter.image}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <span className="absolute inset-0 grid place-items-center text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                            no art
                        </span>
                    )}
                </div>

                <div className="min-w-0">
                    <p className="font-serif text-base sm:text-xl leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-2">
                        {chapter.title}
                    </p>
                    {tagsLabel && (
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500 truncate">
                            {tagsLabel}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                    <Link
                        href={`/posts/${chapter.id}/edit`}
                        className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        Edit
                    </Link>
                </div>
            </div>
        </li>
    );
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
    if (from === to) return arr;
    const next = arr.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
}

function describeError(err: unknown): { code: string; message: string } {
    if (err instanceof APIClientError) {
        switch (err.code) {
            case "CHAPTER_SET_MISMATCH":
                return {
                    code: err.code,
                    message:
                        "The chapter list changed since you opened this page (a chapter was published or pulled). Refresh and try again.",
                };
            case "INVALID_CHAPTER_ORDER":
                return {
                    code: err.code,
                    message: `The submitted order was rejected: ${err.message}`,
                };
            default:
                return {
                    code: err.code,
                    message: err.message,
                };
        }
    }
    if (err instanceof TypeError) {
        return {
            code: "NETWORK",
            message: "Couldn't reach the server. Check your connection and try the reorder again.",
        };
    }
    return {
        code: "UNKNOWN",
        message: "Something went wrong saving the new order.",
    };
}
