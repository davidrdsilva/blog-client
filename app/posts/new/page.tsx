"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/app/components/navbar";
import PostForm, { type PostFormData } from "@/app/components/post-form";
import { createPost } from "@/app/lib/api";

export default function NewPostPage() {
    const router = useRouter();

    const handleSubmit = async (data: PostFormData) => {
        try {
            const post = await createPost({
                title: data.title,
                subtitle: data.subtitle || undefined,
                description: data.description,
                image: data.image,
                author: "Redação",
                content: data.content,
            });

            router.push(`/posts/${post.id}`);
        } catch (error) {
            console.error("Error saving post:", error);
            throw error;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <NavBar />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <PostForm
                    onSubmit={handleSubmit}
                    submitLabel="Publish Post"
                    savingLabel="Publishing..."
                    cancelHref="/"
                />
            </main>
        </div>
    );
}
