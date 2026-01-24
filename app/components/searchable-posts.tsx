"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/app/types/post";
import { PostGrid } from "./post-grid";
import { SearchBar } from "./search-bar";

interface SearchablePostsProps {
    allPosts: Post[];
    initialCount?: number;
}

const POSTS_PER_PAGE = 6;

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

    const searchTerms = query.toLowerCase().trim().split(/\s+/);

    return posts.filter((post) => {
        const searchableText = [
            post.title,
            post.subtitle ?? "",
            post.description,
            extractTextFromContent(post),
        ]
            .join(" ")
            .toLowerCase();

        return searchTerms.every((term) => searchableText.includes(term));
    });
}

export function SearchablePosts({ allPosts, initialCount = POSTS_PER_PAGE }: SearchablePostsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(initialCount);

    const filteredPosts = useMemo(() => searchPosts(allPosts, searchQuery), [allPosts, searchQuery]);

    const visiblePosts = filteredPosts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredPosts.length;

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setVisibleCount(initialCount);
    };

    const handleLoadMore = () => {
        setVisibleCount((prev) => Math.min(prev + POSTS_PER_PAGE, filteredPosts.length));
    };

    return (
        <div className="space-y-8">
            <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by title, description, or content..."
            />

            {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-zinc-500 dark:text-zinc-400">
                        No posts found matching &ldquo;{searchQuery}&rdquo;
                    </p>
                </div>
            ) : (
                <>
                    {searchQuery && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Found {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
                        </p>
                    )}
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
            )}
        </div>
    );
}
