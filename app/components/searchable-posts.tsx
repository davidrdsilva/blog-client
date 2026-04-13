"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deletePost } from "@/app/lib/api";
import type { Post } from "@/app/types/post";
import { PostGrid } from "./post-grid";
import { SearchBar } from "./search-bar";

interface SearchablePostsProps {
    initialPosts: Post[];
    initialCount?: number;
}

const POSTS_PER_PAGE = 13;

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

export function SearchablePosts({
    initialPosts,
    initialCount = POSTS_PER_PAGE,
}: SearchablePostsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [posts, setPosts] = useState(initialPosts);
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(initialCount);

    const filteredPosts = useMemo(() => searchPosts(posts, searchQuery), [posts, searchQuery]);

    const visiblePosts = filteredPosts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredPosts.length;

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setVisibleCount(initialCount);
    };

    const handleLoadMore = () => {
        setVisibleCount((prev) => Math.min(prev + POSTS_PER_PAGE, filteredPosts.length));
    };

    const handleDelete = async (postId: string) => {
        try {
            await deletePost(postId);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            startTransition(() => {
                router.refresh();
            });
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex justify-center md:justify-end mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div className="w-full max-w-sm">
                    <SearchBar
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search the archives..."
                    />
                </div>
            </div>

            {filteredPosts.length === 0 ? (
                <div className="text-center py-20 border-b border-zinc-200 dark:border-zinc-800">
                    <p className="text-lg font-serif text-zinc-500 dark:text-zinc-400">
                        {searchQuery
                            ? `No posts found matching "${searchQuery}"`
                            : "No stories printed yet. Create your first post!"}
                    </p>
                </div>
            ) : (
                <>
                    {searchQuery && (
                        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-6">
                            Found {filteredPosts.length} result
                            {filteredPosts.length !== 1 ? "s" : ""}
                        </p>
                    )}
                    <PostGrid posts={visiblePosts} onDelete={handleDelete} isDeleting={isPending} />
                    {hasMore && (
                        <div className="flex justify-center mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={handleLoadMore}
                                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                            >
                                Load More Stories
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
