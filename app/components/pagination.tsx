"use client";

import { useState } from "react";
import type { Post } from "@/app/types/post";
import { PostGrid } from "./post-grid";

interface PaginationProps {
    allPosts: Post[];
    initialCount?: number;
}

const POSTS_PER_PAGE = 6;

export function Pagination({ allPosts, initialCount = POSTS_PER_PAGE }: PaginationProps) {
    const [visibleCount, setVisibleCount] = useState(initialCount);
    const visiblePosts = allPosts.slice(0, visibleCount);
    const hasMore = visibleCount < allPosts.length;

    const handleLoadMore = () => {
        setVisibleCount((prev) => Math.min(prev + POSTS_PER_PAGE, allPosts.length));
    };

    return (
        <>
            <PostGrid posts={visiblePosts} />
            {hasMore && (
                <div className="flex justify-center mt-8">
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        className="px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Load More
                    </button>
                </div>
            )}
        </>
    );
}
