"use client";

import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import NavBar from "@/app/components/navbar";
import PostForm, { type PostFormData } from "@/app/components/post-form";
import { APIClientError, getPost, updatePost } from "@/app/lib/api";
import type { Post } from "@/app/types/post";

interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const fetchedPost = await getPost(id);
                setPost(fetchedPost);
            } catch (error) {
                if (error instanceof APIClientError && error.code === "POST_NOT_FOUND") {
                    notFound();
                }
                console.error("Failed to fetch post ERRO:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleSubmit = async (data: PostFormData) => {
        try {
            let formattedDate: string | undefined;
            if (data.date && data.date.length === 10) {
                const [d, m, y] = data.date.split("/");
                formattedDate = `${y}-${m}-${d}T00:00:00Z`;
            }

            await updatePost(id, {
                title: data.title,
                subtitle: data.subtitle || undefined,
                description: data.description,
                image: data.image,
                content: data.content,
                date: formattedDate,
                category_id: data.categoryId,
                tags: data.tags,
            });

            router.push(`/posts/${id}`);
        } catch (error) {
            console.error("Error saving post:", error);
            throw error;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black">
                <NavBar />
                <main className="container mx-auto px-4 py-12 max-w-4xl">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-zinc-500 dark:text-zinc-400">Loading...</div>
                    </div>
                </main>
            </div>
        );
    }

    if (!post) {
        return null;
    }

    const formatDate = (date: Date) => {
        if (Number.isNaN(date.getTime())) return "";
        const d = date.getUTCDate().toString().padStart(2, "0");
        const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
        const y = date.getUTCFullYear();
        return `${d}/${m}/${y}`;
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <NavBar />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
                    Edit Post
                </h1>
                <PostForm
                    initialData={{
                        title: post.title,
                        subtitle: post.subtitle ?? "",
                        description: post.description,
                        image: post.image,
                        content: post.content,
                        date: post.date ? formatDate(post.date) : "",
                        categoryId: post.categoryId,
                        tags: post.tags.map((t) => t.name),
                    }}
                    onSubmit={handleSubmit}
                    submitLabel="Save Changes"
                    savingLabel="Saving..."
                    cancelHref={`/posts/${id}`}
                />
            </main>
        </div>
    );
}
