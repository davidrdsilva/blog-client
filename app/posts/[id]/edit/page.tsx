"use client";

import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ConfirmModal } from "@/app/components/confirm-modal";
import DraftsSidebar from "@/app/components/drafts-sidebar";
import NavBar from "@/app/components/navbar";
import PostForm, { type PostFormData } from "@/app/components/post-form";
import { APIClientError, deletePost, getPost, updatePost } from "@/app/lib/api";
import type { Post } from "@/app/types/post";

interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const fetchedPost = await getPost(id);
                setPost(fetchedPost);
            } catch (error) {
                if (error instanceof APIClientError && error.code === "POST_NOT_FOUND") {
                    notFound();
                }
                console.error("Failed to fetch post:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleSubmit = async (data: PostFormData, opts: { asDraft: boolean }) => {
        try {
            let formattedDate: string | undefined;
            if (data.date && data.date.length === 10) {
                const [d, m, y] = data.date.split("/");
                formattedDate = `${y}-${m}-${d}T00:00:00Z`;
            }

            const updated = await updatePost(id, {
                title: data.title,
                subtitle: data.subtitle || undefined,
                description: data.description,
                image: data.image,
                content: data.content,
                date: formattedDate,
                category_id: data.categoryId,
                tags: data.tags,
                character_ids: data.characterIds,
            });

            // Drafts: stay on the editor so the user can keep working. Refresh
            // the in-memory post so the date/category reflect what the server
            // just persisted (the publish-transition rule may have mutated date).
            if (opts.asDraft) {
                setPost(updated);
                return;
            }
            router.push(`/posts/${id}`);
        } catch (error) {
            console.error("Error saving post:", error);
            throw error;
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await deletePost(id);
            router.push("/admin/manage-posts");
        } catch (error) {
            console.error("Failed to delete post:", error);
            setDeleteError(error instanceof Error ? error.message : "Failed to delete this post.");
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <NavBar />
                <main className="container mx-auto px-5 sm:px-6 lg:px-10 py-10 lg:py-24 max-w-4xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">
                        Loading…
                    </p>
                </main>
            </div>
        );
    }

    if (!post) return null;

    const formatDate = (date: Date) => {
        if (Number.isNaN(date.getTime())) return "";
        const d = date.getUTCDate().toString().padStart(2, "0");
        const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
        const y = date.getUTCFullYear();
        return `${d}/${m}/${y}`;
    };

    const editTitle = post.title ? `Edit · ${post.title}` : "Edit post";

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <NavBar />
            <main className="container mx-auto px-5 sm:px-6 lg:px-10 py-10 lg:py-24 max-w-4xl">
                {deleteError && (
                    <div className="mb-8 flex items-start gap-3 text-sm text-red-700 dark:text-red-300 border-l-2 border-red-700 dark:border-red-400 pl-4 py-2">
                        <span className="font-bold uppercase tracking-[0.3em] text-[10px] mt-0.5">
                            Error
                        </span>
                        <span className="font-serif">{deleteError}</span>
                    </div>
                )}
                <PostForm
                    title={editTitle}
                    initialData={{
                        title: post.title,
                        subtitle: post.subtitle ?? "",
                        description: post.description,
                        image: post.image,
                        content: post.content,
                        date: post.date ? formatDate(post.date) : "",
                        categoryId: post.categoryId,
                        tags: post.tags.map((t) => t.name),
                        characterIds: post.characters.map((c) => c.id),
                    }}
                    onSubmit={handleSubmit}
                    submitLabel="Save changes"
                    savingLabel="Saving..."
                    cancelHref={`/posts/${id}`}
                    onDelete={() => {
                        setDeleteError(null);
                        setIsDeleteModalOpen(true);
                    }}
                    deleteLabel="Delete post"
                    headerExtra={
                        <DraftsSidebar
                            currentDraftId={id}
                            onDraftDiscarded={(discardedId) => {
                                if (discardedId === id) router.push("/");
                            }}
                        />
                    }
                />
            </main>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Delete this article"
                message={
                    post.title
                        ? `Permanently delete "${post.title}"? Comments and assets attached to this article go with it.`
                        : "Permanently delete this post? Comments and assets attached to it go with it."
                }
                confirmLabel={isDeleting ? "Deleting…" : "Delete"}
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => !isDeleting && setIsDeleteModalOpen(false)}
            />
        </div>
    );
}
