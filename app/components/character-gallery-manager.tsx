"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { uploadCharacterGallery } from "@/app/lib/api";
import type { CharacterGalleryItem } from "@/app/types/post";
import isLocalUrl from "@/app/utils/is-local-url";

const ACCEPTED_MIME =
    "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg,video/quicktime";

interface PendingFile {
    file: File;
    previewUrl: string;
    isVideo: boolean;
}

interface CharacterGalleryManagerProps {
    characterId: string;
    initialItems: CharacterGalleryItem[];
}

export default function CharacterGalleryManager({
    characterId,
    initialItems,
}: CharacterGalleryManagerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [items, setItems] = useState<CharacterGalleryItem[]>(initialItems);
    const [pending, setPending] = useState<PendingFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        return () => {
            for (const p of pending) URL.revokeObjectURL(p.previewUrl);
        };
    }, [pending]);

    const handlePick = () => {
        fileInputRef.current?.click();
    };

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;
        const next: PendingFile[] = [];
        for (const file of Array.from(fileList)) {
            next.push({
                file,
                previewUrl: URL.createObjectURL(file),
                isVideo: file.type.startsWith("video/"),
            });
        }
        setPending((prev) => [...prev, ...next]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removePending = (index: number) => {
        setPending((prev) => {
            const target = prev[index];
            if (target) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    const clearPending = () => {
        for (const p of pending) URL.revokeObjectURL(p.previewUrl);
        setPending([]);
    };

    const handleUpload = async () => {
        if (pending.length === 0) return;
        setIsUploading(true);
        setErrorMessage("");
        try {
            const uploaded = await uploadCharacterGallery(
                characterId,
                pending.map((p) => p.file),
            );
            setItems((prev) => [...prev, ...uploaded]);
            clearPending();
        } catch (err) {
            console.error("Failed to upload gallery:", err);
            setErrorMessage(err instanceof Error ? err.message : "Failed to upload gallery.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <section className="mt-16 lg:mt-24 pt-10 border-t border-zinc-200 dark:border-zinc-800 animate-[fade-up_0.6s_ease-out_both]">
            <header className="flex items-baseline gap-4 md:gap-6 pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-8">
                <span
                    className="font-serif text-4xl sm:text-5xl md:text-6xl text-zinc-300 dark:text-zinc-700 leading-none tabular-nums"
                    aria-hidden="true"
                >
                    05
                </span>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] sm:tracking-[0.5em] text-zinc-700 dark:text-zinc-300">
                    Gallery
                </h2>
                <span className="ml-auto text-[10px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500 tabular-nums">
                    {items.length.toString().padStart(2, "0")} {items.length === 1 ? "item" : "items"}
                </span>
            </header>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_MIME}
                onChange={handleFiles}
                className="hidden"
            />

            {errorMessage && (
                <div className="mb-6 flex items-start gap-3 text-sm text-red-700 dark:text-red-300 border-l-2 border-red-700 dark:border-red-400 pl-4 py-2">
                    <span className="font-bold uppercase tracking-[0.3em] text-[10px] mt-0.5">
                        Error
                    </span>
                    <span className="font-serif">{errorMessage}</span>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-8">
                <button
                    type="button"
                    onClick={handlePick}
                    disabled={isUploading}
                    className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.4em] border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-zinc-100 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Select files
                </button>
                {pending.length > 0 && (
                    <>
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading
                                ? "Uploading…"
                                : `Upload ${pending.length.toString().padStart(2, "0")}`}
                        </button>
                        <button
                            type="button"
                            onClick={clearPending}
                            disabled={isUploading}
                            className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Clear pending
                        </button>
                    </>
                )}
                <span className="ml-auto text-[10px] uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 font-serif-light italic">
                    images &middot; mp4 &middot; webm &middot; ogg &middot; mov
                </span>
            </div>

            {pending.length > 0 && (
                <div className="mb-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500 mb-4">
                        Pending &middot; {pending.length.toString().padStart(2, "0")}
                    </p>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {pending.map((p, i) => (
                            <li
                                key={p.previewUrl}
                                className="relative group aspect-square overflow-hidden border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                            >
                                {p.isVideo ? (
                                    <video
                                        src={p.previewUrl}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Image
                                        src={p.previewUrl}
                                        alt=""
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        unoptimized
                                        className="object-cover"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => removePending(i)}
                                    disabled={isUploading}
                                    aria-label="Remove pending file"
                                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/70 text-white text-xs hover:bg-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ×
                                </button>
                                <span className="absolute bottom-2 left-2 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.3em] bg-black/70 text-white">
                                    {p.isVideo ? "Video" : "Image"}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500 mb-4">
                    Stored
                </p>
                {items.length === 0 ? (
                    <p className="text-sm font-serif-light italic text-zinc-500 dark:text-zinc-500">
                        Nothing yet. Upload images or video clips to populate the dossier slideshow.
                    </p>
                ) : (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {items.map((item, i) => (
                            <li
                                key={item.id}
                                className="relative group aspect-square overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
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
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        unoptimized={isLocalUrl(item.fileUrl)}
                                        className="object-cover"
                                    />
                                )}
                                <span className="absolute top-2 left-2 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.3em] bg-black/70 text-white tabular-nums">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="absolute bottom-2 right-2 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.3em] bg-black/70 text-white">
                                    {item.fileType}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
