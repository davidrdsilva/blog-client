"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPosts } from "@/app/lib/api";
import type { Post } from "@/app/types/post";

const POLL_INTERVAL_MS = 45_000;
const FRESH_WINDOW_MS = 6 * 60 * 60 * 1000;
const STORAGE_KEY = "tfp:smokinghot:lastSeenId";

function timeAgo(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const mins = Math.max(1, Math.round(diffMs / 60_000));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    return `${hours}h ago`;
}

export default function SmokingHot() {
    const [post, setPost] = useState<Post | null>(null);
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const lastSeenRef = useRef<string | null>(null);

    const evaluate = useCallback((candidate: Post | null) => {
        if (!candidate) return;
        const published = new Date(candidate.date);
        const isFresh = Date.now() - published.getTime() <= FRESH_WINDOW_MS;
        const isUnseen = lastSeenRef.current !== candidate.id;
        if (!isFresh || !isUnseen) return;
        setPost(candidate);
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const fetchLatest = useCallback(async () => {
        const { posts, error } = await getPosts({
            limit: 1,
            sortBy: "date",
            sortOrder: "desc",
            isWhitenestChapter: false,
        });
        if (error) return;
        evaluate(posts[0] ?? null);
    }, [evaluate]);

    useEffect(() => {
        try {
            lastSeenRef.current = window.localStorage.getItem(STORAGE_KEY);
        } catch {
            lastSeenRef.current = null;
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            if (cancelled || document.hidden) return;
            await fetchLatest();
        };

        tick();
        const interval = window.setInterval(tick, POLL_INTERVAL_MS);
        const onVisible = () => {
            if (!document.hidden) tick();
        };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [fetchLatest]);

    const markSeen = useCallback((id: string) => {
        lastSeenRef.current = id;
        try {
            window.localStorage.setItem(STORAGE_KEY, id);
        } catch {
            // localStorage unavailable — in-memory ref is enough for the session.
        }
    }, []);

    const handleDismiss = () => {
        if (post) markSeen(post.id);
        setVisible(false);
        window.setTimeout(() => setDismissed(true), 400);
    };

    if (dismissed || !post) return null;

    const ago = timeAgo(new Date(post.date));
    const categoryName = post.category?.name;

    return (
        <section
            aria-label="Smoking hot — just published"
            className={`mb-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2"
            }`}
        >
            <article className="relative border-t border-b border-zinc-200 dark:border-zinc-800 py-4 sm:py-5">
                <div className="flex items-center gap-3 sm:gap-5">
                    <Link
                        href={`/posts/${post.id}`}
                        onClick={() => markSeen(post.id)}
                        className="group flex items-center gap-3 sm:gap-5 flex-1 min-w-0"
                    >
                        <span className="relative inline-flex size-2 rounded-full bg-red-500 shrink-0">
                            <span className="absolute inset-0 inline-flex animate-ping rounded-full bg-red-500 opacity-75" />
                        </span>

                        <div className="relative size-14 sm:size-[72px] shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                            {post.image && (
                                <Image
                                    src={post.image}
                                    alt=""
                                    fill
                                    sizes="72px"
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                                />
                            )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col gap-1 sm:gap-1.5">
                            <div className="flex items-center gap-2 sm:gap-3 text-[10px] uppercase tracking-[0.35em] sm:tracking-[0.4em] font-mono">
                                <span className="font-bold text-red-600 dark:text-red-400">
                                    Just In
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="size-[3px] rounded-full bg-zinc-300 dark:bg-zinc-700"
                                />
                                <span className="text-zinc-500 dark:text-zinc-400 tabular-nums">
                                    {ago}
                                </span>
                                {categoryName && (
                                    <>
                                        <span
                                            aria-hidden="true"
                                            className="hidden sm:inline-block size-[3px] rounded-full bg-zinc-300 dark:bg-zinc-700"
                                        />
                                        <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
                                            {categoryName}
                                        </span>
                                    </>
                                )}
                            </div>

                            <h3
                                className="text-[15px] sm:text-lg md:text-xl font-bold leading-snug tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-2 decoration-1 underline-offset-[5px] decoration-transparent group-hover:decoration-zinc-900 dark:group-hover:decoration-zinc-100 group-hover:underline transition-[text-decoration-color] duration-300"
                                style={{ fontFamily: "var(--font-sans)" }}
                            >
                                {post.title}
                            </h3>
                        </div>

                        <span
                            aria-hidden="true"
                            className="hidden sm:inline-block text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-1 transition-all duration-300 shrink-0"
                        >
                            →
                        </span>
                    </Link>

                    <button
                        type="button"
                        onClick={handleDismiss}
                        aria-label="Dismiss notification"
                        className="relative size-7 shrink-0 cursor-pointer flex items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 rounded-sm"
                    >
                        <span aria-hidden="true" className="absolute h-px w-3.5 bg-current rotate-45" />
                        <span aria-hidden="true" className="absolute h-px w-3.5 bg-current -rotate-45" />
                    </button>
                </div>
            </article>
        </section>
    );
}
