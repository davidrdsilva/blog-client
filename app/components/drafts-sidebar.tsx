"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ConfirmModal } from "@/app/components/confirm-modal";
import { deletePost, getDrafts } from "@/app/lib/api";
import type { Post } from "@/app/types/post";

const PAGE_SIZE = 20;
const SHORT_MONTHS = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

interface DraftsSidebarProps {
    currentDraftId?: string;
    /**
     * Called after a draft is successfully discarded. Pages that are currently
     * editing the discarded draft can use this to navigate away (since the
     * underlying post no longer exists).
     */
    onDraftDiscarded?: (id: string) => void;
}

function formatDraftDate(date: Date): string {
    if (Number.isNaN(date.getTime())) return "—";
    const d = String(date.getUTCDate()).padStart(2, "0");
    const m = SHORT_MONTHS[date.getUTCMonth()];
    const y = date.getUTCFullYear();
    return `${d} ${m} ${y}`;
}

export default function DraftsSidebar({
    currentDraftId,
    onDraftDiscarded,
}: DraftsSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [drafts, setDrafts] = useState<Post[]>([]);
    const [total, setTotal] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [pendingDiscard, setPendingDiscard] = useState<Post | null>(null);
    const [isDiscarding, setIsDiscarding] = useState(false);

    // Portal target only exists in the browser. Track mount so SSR returns a
    // bare trigger and the drawer attaches once we're client-side.
    useEffect(() => {
        setMounted(true);
    }, []);

    // Initial fetch — runs once on mount so the trigger pill can show the count
    // without requiring the drawer to open.
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            const result = await getDrafts({
                page: 1,
                limit: PAGE_SIZE,
                sortBy: "updatedAt",
                sortOrder: "desc",
            });
            if (cancelled) return;
            if (result.error) {
                setErrorMsg("Failed to load drafts.");
            } else {
                setDrafts(result.posts);
                setTotal(result.meta.total);
                setHasMore(result.meta.hasMore);
                setPage(1);
            }
            setIsLoading(false);
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isOpen]);

    const loadMore = async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        const next = page + 1;
        const result = await getDrafts({
            page: next,
            limit: PAGE_SIZE,
            sortBy: "updatedAt",
            sortOrder: "desc",
        });
        if (!result.error) {
            setDrafts((prev) => [...prev, ...result.posts]);
            setHasMore(result.meta.hasMore);
            setPage(next);
        }
        setIsLoading(false);
    };

    const handleDiscard = async () => {
        if (!pendingDiscard) return;
        setIsDiscarding(true);
        try {
            await deletePost(pendingDiscard.id);
            const discardedId = pendingDiscard.id;
            setDrafts((prev) => prev.filter((d) => d.id !== discardedId));
            setTotal((prev) => (prev === null ? prev : Math.max(0, prev - 1)));
            setPendingDiscard(null);
            onDraftDiscarded?.(discardedId);
        } catch (err) {
            console.error("Failed to discard draft:", err);
            setErrorMsg(err instanceof Error ? err.message : "Failed to discard draft.");
        } finally {
            setIsDiscarding(false);
        }
    };

    const drawer = (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close drafts panel"
                tabIndex={isOpen ? 0 : -1}
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            />

            <aside
                aria-label="Drafts"
                aria-hidden={!isOpen}
                className={`fixed inset-y-0 right-0 z-50 w-full md:w-[26rem] bg-white dark:bg-[#09090b] shadow-2xl flex flex-col md:border-l md:border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#09090b] z-10">
                    <div className="flex items-baseline gap-3 min-w-0">
                        <h3 className="font-bold uppercase tracking-[0.4em] text-sm text-zinc-900 dark:text-zinc-100">
                            Drafts
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] tabular-nums text-zinc-500 dark:text-zinc-500">
                            {total === null ? "" : `${total} on file`}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close drafts"
                        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-2 cursor-pointer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            role="img"
                            aria-labelledby="drafts-close-icon"
                        >
                            <title id="drafts-close-icon">Close</title>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {errorMsg && (
                        <div className="px-6 py-4 text-sm text-red-700 dark:text-red-300 border-b border-red-200 dark:border-red-900/40">
                            {errorMsg}
                        </div>
                    )}

                    {!errorMsg && drafts.length === 0 && !isLoading && (
                        <p className="px-6 py-16 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                            No drafts on file
                        </p>
                    )}

                    {drafts.length > 0 && (
                        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {drafts.map((draft) => {
                                const isActive = draft.id === currentDraftId;
                                return (
                                    <li
                                        key={draft.id}
                                        className={`relative transition-colors ${
                                            isActive
                                                ? "bg-zinc-100 dark:bg-zinc-900/60"
                                                : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                                        }`}
                                    >
                                        <Link
                                            href={`/posts/${draft.id}/edit`}
                                            onClick={() => setIsOpen(false)}
                                            aria-current={isActive ? "page" : undefined}
                                            className="block px-6 py-5 pr-14"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] tabular-nums text-zinc-500 dark:text-zinc-500">
                                                    {formatDraftDate(draft.date)}
                                                </span>
                                                {isActive && (
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-900 dark:text-zinc-100">
                                                        Editing
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="mt-2 font-serif text-lg leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-2 break-words">
                                                {draft.title || (
                                                    <span className="italic text-zinc-500 dark:text-zinc-500">
                                                        Untitled
                                                    </span>
                                                )}
                                            </h4>
                                            {draft.description && (
                                                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                                    {draft.description}
                                                </p>
                                            )}
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setPendingDiscard(draft)}
                                            aria-label={`Discard draft ${draft.title || "Untitled"}`}
                                            className="absolute top-3 right-3 p-2 text-zinc-400 hover:text-red-700 dark:text-zinc-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {hasMore && (
                        <div className="flex justify-center py-4 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={loadMore}
                                disabled={isLoading}
                                className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Loading…" : "Load more"}
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            <ConfirmModal
                isOpen={pendingDiscard !== null}
                title="Discard draft"
                message={
                    pendingDiscard
                        ? `Permanently discard "${pendingDiscard.title || "Untitled"}"? The draft and its assets will be removed.`
                        : ""
                }
                confirmLabel={isDiscarding ? "Discarding…" : "Discard"}
                cancelLabel="Keep"
                variant="danger"
                onConfirm={handleDiscard}
                onCancel={() => !isDiscarding && setPendingDiscard(null)}
            />
        </>
    );

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Show drafts"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
                <span>Drafts</span>
                <span
                    aria-hidden="true"
                    className="inline-flex items-center justify-center min-w-[1.5em] px-1.5 py-px rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[9px] tabular-nums tracking-normal"
                >
                    {total ?? "·"}
                </span>
            </button>
            {mounted && createPortal(drawer, document.body)}
        </>
    );
}
