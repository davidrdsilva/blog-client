"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { WhitenestChapterSummary } from "@/app/types/post";

interface WhitenestChaptersSidebarProps {
    chapters: WhitenestChapterSummary[];
    currentChapter?: number;
}

export default function WhitenestChaptersSidebar({
    chapters,
    currentChapter,
}: WhitenestChaptersSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const previous = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = previous;
            };
        }
    }, [isOpen]);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Show all chapters"
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
                Chapters
            </button>

            <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chapters panel"
                tabIndex={isOpen ? 0 : -1}
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            />

            <aside
                aria-label="Whitenest chapters"
                aria-hidden={!isOpen}
                className={`fixed inset-y-0 left-0 z-50 w-full md:w-100 bg-white dark:bg-[#09090b] shadow-2xl flex flex-col md:border-r md:border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#09090b] z-10">
                    <h3 className="font-bold uppercase tracking-[0.4em] text-sm text-zinc-900 dark:text-zinc-100">
                        Chapters
                    </h3>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close chapters"
                        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-2 cursor-pointer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            role="img"
                            aria-labelledby="chapters-close-icon"
                        >
                            <title id="chapters-close-icon">Close</title>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <ul className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chapters.length === 0 ? (
                        <li className="text-zinc-500 dark:text-zinc-400 text-sm text-center py-8">
                            No chapters yet.
                        </li>
                    ) : (
                        chapters.map((chapter) => {
                            const isActive = chapter.whitenestChapterNumber === currentChapter;
                            return (
                                <li key={chapter.id}>
                                    <Link
                                        href={`/whitenest/${chapter.whitenestChapterNumber}`}
                                        onClick={() => setIsOpen(false)}
                                        aria-current={isActive ? "page" : undefined}
                                        className={`group relative block overflow-hidden aspect-4/5 border transition-all duration-300 ${
                                            isActive
                                                ? "border-zinc-900 dark:border-zinc-100"
                                                : "border-transparent hover:border-zinc-900 dark:hover:border-zinc-100"
                                        }`}
                                    >
                                        <Image
                                            src={chapter.image}
                                            alt=""
                                            fill
                                            sizes="(max-width: 768px) 100vw, 20vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            unoptimized
                                        />
                                        <div
                                            aria-hidden="true"
                                            className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/20"
                                        />
                                        <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 mb-2">
                                                Chapter {chapter.whitenestChapterNumber}
                                            </span>
                                            <h4 className="text-xl font-serif leading-tight mb-3">
                                                {chapter.title}
                                            </h4>
                                            {chapter.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {chapter.tags.map((tag) => (
                                                        <span
                                                            key={tag.id}
                                                            className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-white/15 backdrop-blur-sm border border-white/20"
                                                        >
                                                            #{tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })
                    )}
                </ul>
            </aside>
        </>
    );
}
