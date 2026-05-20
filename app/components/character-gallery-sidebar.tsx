"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CharacterGalleryItem } from "@/app/types/post";
import isLocalUrl from "@/app/utils/is-local-url";

interface CharacterGallerySidebarProps {
    items: CharacterGalleryItem[];
    initialIndex: number | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function CharacterGallerySidebar({
    items,
    initialIndex,
    isOpen,
    onClose,
}: CharacterGallerySidebarProps) {
    const [mounted, setMounted] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex ?? 0);
    const closeBtnRef = useRef<HTMLButtonElement | null>(null);
    const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        if (initialIndex != null) setSelectedIndex(initialIndex);
    }, [isOpen, initialIndex]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCloseRef.current();
                return;
            }
            if (items.length <= 1) return;
            if (e.key === "ArrowRight") {
                setSelectedIndex((i) => (i + 1) % items.length);
            } else if (e.key === "ArrowLeft") {
                setSelectedIndex((i) => (i - 1 + items.length) % items.length);
            }
        };
        window.addEventListener("keydown", onKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const focusTimeout = window.setTimeout(() => closeBtnRef.current?.focus(), 280);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
            window.clearTimeout(focusTimeout);
        };
    }, [isOpen, items.length]);

    useEffect(() => {
        if (!isOpen) return;
        thumbRefs.current[selectedIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }, [isOpen, selectedIndex]);

    if (!mounted) return null;

    const current = items[selectedIndex];
    const total = items.length;
    const indexLabel = total > 0 ? String(selectedIndex + 1).padStart(2, "0") : "00";
    const totalLabel = String(total).padStart(2, "0");

    const drawer = (
        <div
            aria-hidden={!isOpen}
            inert={!isOpen}
            className={`fixed inset-0 z-60 ${
                isOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
        >
            <button
                type="button"
                aria-label="Close gallery preview"
                tabIndex={isOpen ? 0 : -1}
                onClick={onClose}
                className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-500 ease-out ${
                    isOpen ? "opacity-100" : "opacity-0"
                }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Character gallery preview"
                className={`absolute right-0 top-0 h-full w-full sm:w-[min(560px,92vw)] lg:w-[min(720px,80vw)] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-l border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-500 will-change-transform ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-px bg-linear-to-b from-transparent via-zinc-300/70 dark:via-zinc-700 to-transparent"
                />
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-2 w-px bg-linear-to-b from-transparent via-zinc-200/60 dark:via-zinc-800 to-transparent"
                />

                <header className="px-6 sm:px-8 pt-7 pb-5 border-b-2 border-zinc-900 dark:border-zinc-100 relative shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p
                                className="text-[10px] uppercase tracking-[0.45em] text-zinc-500 dark:text-zinc-400"
                                style={{ fontFamily: "var(--font-serif-light)" }}
                            >
                                Dossier
                            </p>
                            <h2
                                className="mt-1 text-[32px] sm:text-[40px] leading-none font-bold uppercase tracking-tight"
                                style={{ fontFamily: "var(--font-sans)" }}
                            >
                                Gallery
                            </h2>
                        </div>
                        <button
                            ref={closeBtnRef}
                            type="button"
                            onClick={onClose}
                            aria-label="Close gallery preview"
                            className="relative size-9 cursor-pointer flex items-center justify-center border border-zinc-900 dark:border-zinc-100 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-950 shrink-0"
                        >
                            <span className="absolute h-px w-4 bg-current rotate-45" />
                            <span className="absolute h-px w-4 bg-current -rotate-45" />
                        </button>
                    </div>

                    <div className="mt-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400 font-mono">
                        <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
                            {indexLabel}
                        </span>
                        <span aria-hidden="true" className="h-px w-6 bg-zinc-300 dark:bg-zinc-700" />
                        <span className="tabular-nums">of {totalLabel}</span>
                        <span
                            aria-hidden="true"
                            className="ml-auto h-px flex-1 bg-zinc-200 dark:bg-zinc-800"
                        />
                        <span className="text-zinc-700 dark:text-zinc-300">
                            {current?.fileType ?? "—"}
                        </span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
                    {current ? (
                        <div
                            key={current.id}
                            className="animate-[fade-up_0.5s_cubic-bezier(0.22,1,0.36,1)_both]"
                        >
                            <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                {current.fileType === "video" ? (
                                    <video
                                        src={current.fileUrl}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        className="w-full h-full object-contain bg-black"
                                    />
                                ) : (
                                    <Image
                                        src={current.fileUrl}
                                        alt=""
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 560px, 720px"
                                        unoptimized={isLocalUrl(current.fileUrl)}
                                        className="object-contain"
                                    />
                                )}
                                <span className="absolute top-3 left-3 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.35em] bg-black/70 text-white tabular-nums">
                                    {indexLabel}
                                </span>
                                <span className="absolute bottom-3 right-3 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.35em] bg-black/70 text-white">
                                    {current.fileType}
                                </span>
                            </div>

                            {total > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedIndex(
                                                (i) => (i - 1 + total) % total,
                                            )
                                        }
                                        aria-label="Previous item"
                                        className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.4em] border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-zinc-100 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                                    >
                                        ← Prev
                                    </button>
                                    <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600 font-mono tabular-nums">
                                        {indexLabel} / {totalLabel}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedIndex((i) => (i + 1) % total)}
                                        aria-label="Next item"
                                        className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.4em] border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-zinc-100 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm font-serif-light italic text-zinc-500 dark:text-zinc-500">
                            Nothing to display.
                        </p>
                    )}
                </div>

                {total > 0 && (
                    <div className="px-6 sm:px-8 py-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                        <div className="flex items-baseline gap-3 mb-3">
                            <span
                                className="text-[10px] uppercase tracking-[0.45em] text-zinc-500 dark:text-zinc-400"
                                style={{ fontFamily: "var(--font-serif-light)" }}
                            >
                                Contact Sheet
                            </span>
                            <span
                                aria-hidden="true"
                                className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"
                            />
                            <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600 font-mono tabular-nums">
                                {totalLabel}
                            </span>
                        </div>
                        <ul className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
                            {items.map((item, i) => {
                                const isActive = i === selectedIndex;
                                return (
                                    <li key={item.id} className="snap-start shrink-0">
                                        <button
                                            ref={(el) => {
                                                thumbRefs.current[i] = el;
                                            }}
                                            type="button"
                                            onClick={() => setSelectedIndex(i)}
                                            aria-label={`View item ${String(i + 1).padStart(2, "0")}`}
                                            aria-current={isActive ? "true" : undefined}
                                            className={`relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden bg-zinc-100 dark:bg-zinc-900 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${
                                                isActive
                                                    ? "border-2 border-zinc-900 dark:border-zinc-100"
                                                    : "border border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100"
                                            }`}
                                        >
                                            {item.fileType === "video" ? (
                                                <video
                                                    src={item.fileUrl}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    preload="metadata"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Image
                                                    src={item.fileUrl}
                                                    alt=""
                                                    fill
                                                    sizes="80px"
                                                    unoptimized={isLocalUrl(item.fileUrl)}
                                                    className="object-cover"
                                                />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </aside>
        </div>
    );

    return createPortal(drawer, document.body);
}
