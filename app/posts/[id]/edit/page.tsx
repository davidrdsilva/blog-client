"use client";

import type EditorJSType from "@editorjs/editorjs";
import type { ToolConstructable } from "@editorjs/editorjs";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { posts } from "@/app/data/posts";
import type { EditorJsContent } from "@/app/types/post";

interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
    const { id } = use(params);
    const post = posts.find((p) => p.id === id);

    if (!post) {
        notFound();
    }

    const router = useRouter();
    const editorRef = useRef<EditorJSType | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: post.title,
        subtitle: post.subtitle ?? "",
        description: post.description,
        image: post.image,
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const uploadData = new FormData();
            uploadData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: uploadData,
            });

            const result = await response.json();

            if (result.success === 1 && result.file?.url) {
                setFormData({ ...formData, image: result.file.url });
            } else {
                console.error("Upload failed:", result.error);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, image: "" });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        const initEditor = async () => {
            if (editorRef.current) return;

            const [
                { default: EditorJS },
                { default: Header },
                { default: Paragraph },
                { default: ImageTool },
                { default: List },
                { default: Quote },
                { default: CodeTool },
                { default: LinkTool },
            ] = await Promise.all([
                import("@editorjs/editorjs"),
                import("@editorjs/header"),
                import("@editorjs/paragraph"),
                import("@editorjs/image"),
                import("@editorjs/list"),
                import("@editorjs/quote"),
                import("@editorjs/code"),
                import("@editorjs/link"),
            ]);

            editorRef.current = new EditorJS({
                holder: "editorjs",
                placeholder: "Start writing your post...",
                data: post.content,
                tools: {
                    header: {
                        class: Header as unknown as ToolConstructable,
                        config: {
                            placeholder: "Enter a header",
                            levels: [2, 3, 4],
                            defaultLevel: 2,
                        },
                    },
                    paragraph: {
                        class: Paragraph as unknown as ToolConstructable,
                        inlineToolbar: true,
                    },
                    image: {
                        class: ImageTool as unknown as ToolConstructable,
                        config: {
                            endpoints: {
                                byFile: "/api/upload",
                            },
                            field: "file",
                            types: "image/*",
                        },
                    },
                    list: {
                        class: List as unknown as ToolConstructable,
                        inlineToolbar: true,
                    },
                    quote: {
                        class: Quote as unknown as ToolConstructable,
                        inlineToolbar: true,
                    },
                    code: {
                        class: CodeTool as unknown as ToolConstructable,
                        config: {
                            placeholder: "Enter code",
                        },
                    },
                    linkTool: {
                        class: LinkTool as unknown as ToolConstructable,
                        config: {
                            endpoint: "/api/fetch-url",
                        },
                    },
                },
                onReady: () => {
                    setIsReady(true);
                },
            });
        };

        initEditor();

        return () => {
            if (editorRef.current?.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [post.content]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editorRef.current || !isReady) return;

        setIsSaving(true);

        try {
            const outputData = await editorRef.current.save();
            const postData = {
                id: post.id,
                ...formData,
                content: outputData as EditorJsContent,
                date: post.date,
                author: post.author,
            };

            console.log("Updated post data:", postData);

            router.push(`/posts/${post.id}`);
        } catch (error) {
            console.error("Error saving post:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link
                        href="/"
                        className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
                    >
                        Blog
                    </Link>
                    <ThemeToggle />
                </div>
            </header>
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
                    Edit Post
                </h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="title"
                                className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100"
                            >
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                required
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                                placeholder="Enter post title"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="subtitle"
                                className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100"
                            >
                                Subtitle (optional)
                            </label>
                            <input
                                type="text"
                                id="subtitle"
                                value={formData.subtitle}
                                onChange={(e) =>
                                    setFormData({ ...formData, subtitle: e.target.value })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                                placeholder="Enter post subtitle"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="description"
                                className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                required
                                maxLength={100}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 resize-none"
                                placeholder="Enter short description (max 100 characters)"
                                rows={3}
                            />
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                                {formData.description.length}/100
                            </p>
                        </div>
                        <div>
                            <label
                                htmlFor="image"
                                className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100"
                            >
                                Featured Image
                            </label>
                            {formData.image ? (
                                <div className="space-y-3">
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
                                        <Image
                                            src={formData.image}
                                            alt="Featured image preview"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 800px"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Change Image
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        id="image"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="image"
                                        className={`flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <svg
                                                    className="w-8 h-8 text-zinc-400 animate-spin"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    Uploading...
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-8 h-8 text-zinc-400"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                                    />
                                                </svg>
                                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    Click to upload featured image
                                                </span>
                                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                    JPEG, PNG, GIF, WebP (max 5MB)
                                                </span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            )}
                            <input type="hidden" name="image" value={formData.image} required />
                        </div>
                    </div>
                    <div>
                        <label
                            htmlFor="editorjs"
                            className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100"
                        >
                            Content
                        </label>
                        <div
                            id="editorjs"
                            className="min-h-[400px] px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={!isReady || isSaving || !formData.image}
                            className="px-6 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                        <Link
                            href={`/posts/${post.id}`}
                            className="px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </main>
        </div>
    );
}
