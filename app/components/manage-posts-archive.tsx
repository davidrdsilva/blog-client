"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ConfirmModal } from "@/app/components/confirm-modal";
import { deletePost } from "@/app/lib/api";
import type { Post } from "@/app/types/post";

const PAGE_SIZE = 25;
const SHORT_MONTHS = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
];

interface ManagePostsArchiveProps {
    initialPosts: Post[];
}

// Extract searchable text from Editor.js blocks — mirrors the homepage's
// behaviour so a query for words in the article body matches here too.
function extractTextFromContent(post: Post): string {
    if (!post.content?.blocks) return "";
    return post.content.blocks
        .map((block) => {
            const data = block.data;
            if (typeof data.text === "string") return data.text;
            if (typeof data.code === "string") return data.code;
            if (typeof data.caption === "string") return data.caption;
            if (Array.isArray(data.items)) return data.items.join(" ");
            return "";
        })
        .join(" ");
}

function searchPosts(posts: Post[], query: string): Post[] {
    if (!query.trim()) return posts;
    const terms = query.toLowerCase().trim().split(/\s+/);
    return posts.filter((post) => {
        const haystack = [
            post.title,
            post.subtitle ?? "",
            post.description,
            post.author,
            post.category?.name ?? "",
            extractTextFromContent(post),
        ]
            .join(" ")
            .toLowerCase();
        return terms.every((term) => haystack.includes(term));
    });
}

export default function ManagePostsArchive({ initialPosts }: ManagePostsArchiveProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [error, setError] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<Post | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filtered = useMemo(() => searchPosts(posts, searchQuery), [posts, searchQuery]);
    const visiblePosts = filtered.slice(0, visibleCount);
    const hasMore = visibleCount < filtered.length;

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setVisibleCount(PAGE_SIZE);
    };

    const loadMore = () => {
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;
        setIsDeleting(true);
        try {
            await deletePost(pendingDelete.id);
            setPosts((prev) => prev.filter((p) => p.id !== pendingDelete.id));
            setPendingDelete(null);
        } catch (err) {
            console.error("Failed to delete post:", err);
            setError(err instanceof Error ? err.message : "Failed to delete post.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-10 lg:space-y-14">
            <ArchiveHeader
                total={posts.length}
                filteredCount={filtered.length}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
            />

            {error && (
                <div className="flex items-start gap-3 text-sm text-red-700 dark:text-red-300 border-l-2 border-red-700 dark:border-red-400 pl-4 py-2">
                    <span className="font-bold uppercase tracking-[0.3em] text-[10px] mt-0.5">
                        Error
                    </span>
                    <span className="font-serif">{error}</span>
                </div>
            )}

            <ArchiveTable posts={visiblePosts} onDeleteRequest={setPendingDelete} />

            {filtered.length === 0 && (
                <p className="py-16 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                    {searchQuery
                        ? `No articles match "${searchQuery}"`
                        : "The morgue is empty"}
                </p>
            )}

            {hasMore && filtered.length > 0 && (
                <div className="flex justify-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={loadMore}
                        className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                    >
                        Load more
                    </button>
                </div>
            )}

            <ConfirmModal
                isOpen={pendingDelete !== null}
                title="Pull article from the morgue"
                message={
                    pendingDelete
                        ? `Permanently delete "${pendingDelete.title}"? Comments and assets attached to this article go with it.`
                        : ""
                }
                confirmLabel={isDeleting ? "Deleting…" : "Delete"}
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => !isDeleting && setPendingDelete(null)}
            />
        </div>
    );
}

// ─── Header: eyebrow, big serif italic title, count, search bar ──────────────
function ArchiveHeader({
    total,
    filteredCount,
    searchQuery,
    onSearchChange,
}: {
    total: number;
    filteredCount: number;
    searchQuery: string;
    onSearchChange: (next: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const isFiltered = searchQuery.trim().length > 0;

    return (
        <header className="space-y-8 animate-[fade-up_0.6s_ease-out_both]">
            <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500 dark:text-zinc-500">
                    Admin · Editorial Desk
                </p>
                <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-zinc-900 dark:text-zinc-100 leading-[1.05] tracking-tight">
                    The Morgue
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                    {isFiltered
                        ? `${filteredCount} of ${total} article${total === 1 ? "" : "s"} match`
                        : `${total.toLocaleString()} article${total === 1 ? "" : "s"} on file · sectioned by date · indexed by name`}
                </p>
            </div>

            <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="group flex items-center gap-3 w-full pb-3 border-b border-zinc-300 dark:border-zinc-700 focus-within:border-zinc-900 dark:focus-within:border-zinc-100 transition-colors text-left cursor-text"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="text-zinc-400 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors"
                >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by headline, standfirst, body, author, or section…"
                    className="flex-1 bg-transparent text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => onSearchChange("")}
                        aria-label="Clear search"
                        className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                    >
                        Clear
                    </button>
                )}
            </button>
        </header>
    );
}

// ─── Archive table ───────────────────────────────────────────────────────────
function ArchiveTable({
    posts,
    onDeleteRequest,
}: {
    posts: Post[];
    onDeleteRequest: (post: Post) => void;
}) {
    if (posts.length === 0) return null;
    return (
        <ul className="border-t border-zinc-200 dark:border-zinc-800">
            {posts.map((post) => (
                <ArchiveRow key={post.id} post={post} onDeleteRequest={onDeleteRequest} />
            ))}
        </ul>
    );
}

function formatArchiveDate(date: Date): string {
    if (Number.isNaN(date.getTime())) return "—";
    const d = String(date.getUTCDate()).padStart(2, "0");
    const m = SHORT_MONTHS[date.getUTCMonth()];
    const y = date.getUTCFullYear();
    return `${d} ${m} ${y}`;
}

function formatViewsCompact(views: number): string {
    if (views < 1000) return String(views);
    if (views < 10_000) return `${(views / 1000).toFixed(1)}K`;
    if (views < 1_000_000) return `${Math.round(views / 1000)}K`;
    return `${(views / 1_000_000).toFixed(1)}M`;
}

function ArchiveRow({
    post,
    onDeleteRequest,
}: {
    post: Post;
    onDeleteRequest: (post: Post) => void;
}) {
    const dateLabel = formatArchiveDate(post.date);
    const sectionLabel = post.category?.name ?? "Uncategorized";
    const viewsLabel = formatViewsCompact(post.totalViews);

    return (
        <li className="group border-b border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:grid-cols-[6.5rem_7rem_minmax(0,1fr)_4rem_auto] items-center gap-3 sm:gap-6 py-5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40 px-3 -mx-3">
                {/* Date */}
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] tabular-nums text-zinc-500 dark:text-zinc-500">
                    {dateLabel}
                </span>

                {/* Section — desktop only column, mobile shows under title */}
                <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700 dark:text-zinc-300 truncate">
                    {sectionLabel}
                </span>

                {/* Title + mobile section */}
                <div className="min-w-0 sm:col-auto col-start-2">
                    <Link
                        href={`/posts/${post.id}`}
                        className="block font-serif text-lg sm:text-xl leading-snug text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors line-clamp-2"
                    >
                        {post.title}
                    </Link>
                    <p className="sm:hidden mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500">
                        {sectionLabel} · {viewsLabel} views
                    </p>
                </div>

                {/* Views — desktop only column */}
                <span className="hidden sm:block text-right text-[10px] font-bold uppercase tracking-[0.3em] tabular-nums text-zinc-500 dark:text-zinc-500">
                    {viewsLabel}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-3 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                    <Link
                        href={`/posts/${post.id}/edit`}
                        className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        Edit
                    </Link>
                    <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700" aria-hidden>
                        ·
                    </span>
                    <button
                        type="button"
                        onClick={() => onDeleteRequest(post)}
                        className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors cursor-pointer"
                    >
                        Pull
                    </button>
                </div>
            </div>
        </li>
    );
}
