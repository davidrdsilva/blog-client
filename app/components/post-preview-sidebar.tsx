"use client";

import { EditorJsRenderer } from "@/app/components/editorjs-renderer";
import { GalleryProvider } from "@/app/components/image-gallery";
import type { EditorJsContent } from "@/app/types/post";

interface PostPreviewSidebarProps {
    content: EditorJsContent | null;
    isOpen: boolean;
    onClose: () => void;
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function computeMetrics(content: EditorJsContent | null) {
    if (!content?.blocks?.length) {
        return { wordCount: 0, paragraphCount: 0, readingTime: 0 };
    }

    let totalText = "";
    let paragraphCount = 0;

    for (const block of content.blocks) {
        switch (block.type) {
            case "paragraph": {
                const data = block.data as { text: string };
                totalText += ` ${stripHtml(data.text)}`;
                paragraphCount++;
                break;
            }
            case "header": {
                const data = block.data as { text: string };
                totalText += ` ${stripHtml(data.text)}`;
                break;
            }
            case "quote": {
                const data = block.data as { text: string; caption?: string };
                totalText += ` ${stripHtml(data.text)}`;
                if (data.caption) totalText += ` ${stripHtml(data.caption)}`;
                break;
            }
            case "list": {
                type ListItem = string | { content: string };
                const data = block.data as { items: ListItem[] };
                for (const item of data.items) {
                    const text = typeof item === "string" ? item : item.content;
                    totalText += ` ${stripHtml(text)}`;
                }
                break;
            }
            case "code": {
                const data = block.data as { code: string };
                totalText += ` ${data.code}`;
                break;
            }
        }
    }

    const wordCount = totalText.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return { wordCount, paragraphCount, readingTime };
}

function contentImages(content: EditorJsContent | null) {
    return (
        content?.blocks
            ?.filter((b) => b.type === "image")
            .map((b) => {
                const data = b.data as { file?: { url: string }; url?: string; caption?: string };
                return { src: data.file?.url ?? data.url ?? "", alt: data.caption ?? "" };
            })
            .filter((img) => img.src) ?? []
    );
}

export default function PostPreviewSidebar({ content, isOpen, onClose }: PostPreviewSidebarProps) {
    const { wordCount, paragraphCount, readingTime } = computeMetrics(content);
    const isEmpty = !content?.blocks?.length;

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <div
                className={`fixed inset-y-0 right-0 w-full md:w-[42%] bg-white dark:bg-[#09090b] shadow-2xl z-50 flex flex-col md:border-l md:border-zinc-200 dark:border-zinc-800 ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
                style={{
                    transitionProperty: "transform, translate",
                    transitionDuration: "300ms",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-[#09090b] sticky top-0 z-10">
                    <h3 className="text-xl font-serif text-zinc-900 dark:text-zinc-100">
                        Post Preview
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-2 cursor-pointer"
                        aria-label="Close preview"
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
                            aria-labelledby="close-preview-icon"
                        >
                            <title id="close-preview-icon">Close</title>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex gap-6 text-sm text-zinc-500 dark:text-zinc-400">
                    <div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {wordCount}
                        </span>{" "}
                        words
                    </div>
                    <div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {paragraphCount}
                        </span>{" "}
                        paragraphs
                    </div>
                    <div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {readingTime} min
                        </span>{" "}
                        read
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isEmpty ? (
                        <p className="text-zinc-500 dark:text-zinc-400 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg text-center border border-zinc-100 dark:border-zinc-800/50 font-serif">
                            Start writing to see the preview...
                        </p>
                    ) : (
                        <GalleryProvider images={contentImages(content)}>
                            <EditorJsRenderer content={content ?? { blocks: [] }} />
                        </GalleryProvider>
                    )}
                </div>
            </div>
        </>
    );
}
