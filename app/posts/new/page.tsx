"use client";

import { useRouter } from "next/navigation";
import DraftsSidebar from "@/app/components/drafts-sidebar";
import NavBar from "@/app/components/navbar";
import PostForm, { type PostFormData } from "@/app/components/post-form";
import { createPost } from "@/app/lib/api";

export default function NewPostPage() {
    const router = useRouter();

    const handleSubmit = async (data: PostFormData, opts: { asDraft: boolean }) => {
        try {
            let formattedDate: string | undefined;
            if (data.date && data.date.length === 10) {
                const [d, m, y] = data.date.split("/");
                formattedDate = `${y}-${m}-${d}T00:00:00Z`;
            }

            const post = await createPost({
                title: data.title,
                subtitle: data.subtitle || undefined,
                description: data.description,
                image: data.image,
                author: "Redação",
                content: data.content,
                date: formattedDate,
                category_id: data.categoryId,
                tags: data.tags,
                character_ids: data.characterIds.length > 0 ? data.characterIds : undefined,
            });

            // Drafts: keep the editor open against the just-saved record so
            // subsequent saves update it instead of creating duplicates.
            if (opts.asDraft) {
                router.replace(`/posts/${post.id}/edit`);
                return;
            }
            router.push(`/posts/${post.id}`);
        } catch (error) {
            console.error("Error saving post:", error);
            throw error;
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <NavBar />
            <main className="container mx-auto px-5 sm:px-6 lg:px-10 py-10 lg:py-24 max-w-4xl">
                <PostForm
                    title="New post"
                    onSubmit={handleSubmit}
                    submitLabel="Publish"
                    savingLabel="Publishing…"
                    cancelHref="/"
                    headerExtra={<DraftsSidebar />}
                />
            </main>
        </div>
    );
}
