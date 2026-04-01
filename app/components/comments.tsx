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

    if (isLoading) {
        return (
            <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 animate-pulse">
                <h3 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">
                    Comments
                </h3>
                <div className="space-y-6">
                    <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                    <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
                    Comments
                </h3>
                <div className="text-red-500 bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Comments{" "}
                {comments.length > 0 && (
                    <span className="text-zinc-500 text-lg font-normal">({comments.length})</span>
                )}
            </h3>

            {comments.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg text-center border border-zinc-100 dark:border-zinc-800/50">
                    No comments yet. Be the first to share your thoughts!
                </p>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {comment.author}
                                </span>
                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                <time
                                    className="text-sm text-zinc-500 dark:text-zinc-400"
                                    dateTime={comment.createdAt}
                                >
                                    {formatDate(new Date(comment.createdAt))}
                                </time>
                            </div>
                            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
