"use client";

import type EditorJSType from "@editorjs/editorjs";
import type { ToolConstructable } from "@editorjs/editorjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import type { EditorJsContent } from "@/app/types/post";

export default function NewPostPage() {
    const router = useRouter();
    const editorRef = useRef<EditorJSType | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        image: "",
    });

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
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editorRef.current || !isReady) return;

        setIsSaving(true);

        try {
            const outputData = await editorRef.current.save();
            const postData = {
                ...formData,
                content: outputData as EditorJsContent,
                date: new Date(),
                author: "David",
            };

            console.log("Post data:", postData);

            router.push("/");
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
                                Featured Image URL
                            </label>
                            <input
                                type="url"
                                id="image"
                                required
                                value={formData.image}
                                onChange={(e) =>
                                    setFormData({ ...formData, image: e.target.value })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                                placeholder="https://example.com/image.jpg"
                            />
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
                            disabled={!isReady || isSaving}
                            className="px-6 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSaving ? "Publishing..." : "Publish Post"}
                        </button>
                        <Link
                            href="/"
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
