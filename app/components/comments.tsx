"use client";

import { useEffect, useState } from "react";
import type { Comment } from "@/app/lib/api";

import { APIClientError, getComments } from "@/app/lib/api";
import formatDate from "@/app/utils/format-date";

interface CommentsProps {
    postId: string;
}

export default function Comments({ postId }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const data = await getComments(postId);
                setComments(data);
            } catch (error) {
                if (error instanceof APIClientError && error.code === "COMMENTS_NOT_FOUND") {
                    setComments([]);
                } else {
                    setError(error instanceof Error ? error.message : "Failed to load comments.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    // Handle closing on Escape and preventing scroll
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 border w-full md:w-fit border-black dark:border-white text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
                aria-label="Show comments"
                type="button"
            >
                Show Comments {comments.length > 0 && `(${comments.length})`}
            </button>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 right-0 w-full md:w-[30%] bg-white dark:bg-[#09090b] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-zinc-200 dark:border-zinc-800 ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-[#09090b] sticky top-0 z-10">
                    <h3 className="text-xl font-bold font-serif text-zinc-900 dark:text-zinc-100">
                        Comments{" "}
                        {comments.length > 0 && (
                            <span className="text-zinc-500 font-normal ml-1">
                                ({comments.length})
                            </span>
                        )}
                    </h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-2 cursor-pointer"
                        aria-label="Close comments"
                        type="button"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            role="img"
                            aria-labelledby="close-icon"
                        >
                            <title id="close-icon">Close</title>
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="space-y-6 animate-pulse">
                            <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg"></div>
                            <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                            {error}
                        </div>
                    ) : comments.length === 0 ? (
                        <p className="text-zinc-500 dark:text-zinc-400 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg text-center border border-zinc-100 dark:border-zinc-800/50 font-serif">
                            No comments yet. Be the first to share your thoughts!
                        </p>
                    ) : (
                        comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="bg-white dark:bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        {comment.author}
                                    </span>
                                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                    <time
                                        className="text-xs font-bold uppercase tracking-wider text-zinc-500"
                                        dateTime={comment.createdAt}
                                    >
                                        {formatDate(new Date(comment.createdAt))}
                                    </time>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm font-serif">
                                    {comment.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
