"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CharacterGalleryItem } from "@/app/types/post";
import isLocalUrl from "@/app/utils/is-local-url";

const IMAGE_DWELL_MS = 5000;
const VIDEO_FALLBACK_DWELL_MS = 8000;

interface CharacterGallerySlideshowProps {
    items: CharacterGalleryItem[];
    variant?: "framed" | "fill";
}

export default function CharacterGallerySlideshow({
    items,
    variant = "framed",
}: CharacterGallerySlideshowProps) {
    const safeItems = useMemo(() => items ?? [], [items]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const isFill = variant === "fill";

    const advance = useCallback(() => {
        setActiveIndex((i) => (safeItems.length === 0 ? 0 : (i + 1) % safeItems.length));
    }, [safeItems.length]);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        clearTimer();
        if (safeItems.length <= 1 || isPaused) return;
        const current = safeItems[activeIndex];
        if (!current) return;
        if (current.fileType === "video") return;
        timerRef.current = setTimeout(advance, IMAGE_DWELL_MS);
        return clearTimer;
    }, [activeIndex, advance, clearTimer, isPaused, safeItems]);

    useEffect(() => {
        for (let i = 0; i < videoRefs.current.length; i++) {
            const v = videoRefs.current[i];
            if (!v) continue;
            if (i === activeIndex) {
                v.currentTime = 0;
                const playPromise = v.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(() => {
                        /* autoplay blocked — ignored */
                    });
                }
            } else {
                v.pause();
            }
        }
    }, [activeIndex]);

    const handleVideoEnded = useCallback(() => {
        if (!isPaused) advance();
    }, [advance, isPaused]);

    const handleVideoLoadedMetadata = useCallback(
        (index: number) => {
            if (index !== activeIndex) return;
            const v = videoRefs.current[index];
            if (!v) return;
            const duration =
                Number.isFinite(v.duration) && v.duration > 0
                    ? v.duration * 1000
                    : VIDEO_FALLBACK_DWELL_MS;
            clearTimer();
            if (!isPaused && safeItems.length > 1) {
                timerRef.current = setTimeout(advance, duration);
            }
        },
        [activeIndex, advance, clearTimer, isPaused, safeItems.length]
    );

    if (safeItems.length === 0) return null;

    if (isFill) {
        return (
            <section
                className="relative w-full h-full overflow-hidden bg-black animate-[fade-up_1.2s_ease-out_both]"
                aria-label="Character surveillance feed"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {safeItems.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <div
                            key={item.id}
                            aria-hidden={!isActive}
                            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                                isActive ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            {item.fileType === "video" ? (
                                <video
                                    ref={(el) => {
                                        videoRefs.current[index] = el;
                                    }}
                                    src={item.fileUrl}
                                    muted
                                    playsInline
                                    preload="auto"
                                    onEnded={handleVideoEnded}
                                    onLoadedMetadata={() => handleVideoLoadedMetadata(index)}
                                    className={`w-full h-full object-cover transition-transform duration-6000 ease-out ${
                                        isActive ? "scale-100" : "scale-105"
                                    }`}
                                />
                            ) : (
                                <Image
                                    src={item.fileUrl}
                                    alt=""
                                    fill
                                    sizes="50vw"
                                    unoptimized={isLocalUrl(item.fileUrl)}
                                    priority={index === 0}
                                    className={`object-cover transition-transform duration-6000 ease-out ${
                                        isActive ? "scale-100" : "scale-105"
                                    }`}
                                />
                            )}
                        </div>
                    );
                })}

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/55"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_85%)]"
                />

                {safeItems.length > 1 && (
                    <div className="absolute inset-x-0 bottom-24 flex items-center justify-center gap-2 px-4">
                        {safeItems.map((item, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-current={isActive ? "true" : undefined}
                                    className={`h-px transition-all duration-300 ease-out cursor-pointer ${
                                        isActive
                                            ? "w-10 bg-white"
                                            : "w-5 bg-white/40 hover:bg-white/70"
                                    }`}
                                />
                            );
                        })}
                    </div>
                )}
            </section>
        );
    }

    return (
        <section
            className="relative w-full overflow-hidden border border-white/10 md:border-zinc-200 bg-black md:bg-zinc-50 animate-[fade-up_0.8s_ease-out_both]"
            aria-label="Character gallery"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="relative w-full aspect-4/3 md:aspect-3/2">
                {safeItems.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <div
                            key={item.id}
                            aria-hidden={!isActive}
                            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                                isActive ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            {item.fileType === "video" ? (
                                <video
                                    ref={(el) => {
                                        videoRefs.current[index] = el;
                                    }}
                                    src={item.fileUrl}
                                    muted
                                    playsInline
                                    preload="auto"
                                    onEnded={handleVideoEnded}
                                    onLoadedMetadata={() => handleVideoLoadedMetadata(index)}
                                    className={`w-full h-full object-cover transition-transform duration-6000 ease-out ${
                                        isActive ? "scale-100" : "scale-105"
                                    }`}
                                />
                            ) : (
                                <Image
                                    src={item.fileUrl}
                                    alt=""
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    unoptimized={isLocalUrl(item.fileUrl)}
                                    priority={index === 0}
                                    className={`object-contain transition-transform duration-6000 ease-out ${
                                        isActive ? "scale-100" : "scale-105"
                                    }`}
                                />
                            )}
                        </div>
                    );
                })}

                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/55 via-black/20 to-transparent pointer-events-none md:hidden"
                />
                <div
                    aria-hidden="true"
                    className="hidden md:block absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-white/85 via-white/30 to-transparent pointer-events-none"
                />

                <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/85 md:text-zinc-900 md:bg-white/80 md:px-2 md:py-1 px-2 py-1 bg-black/55 backdrop-blur-sm">
                    <span className="block w-1 h-1 rounded-full bg-red-400 md:bg-red-600 animate-pulse" />
                    Live feed
                </div>

                <div className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 md:text-zinc-700 md:bg-white/80 md:px-2 md:py-1 px-2 py-1 bg-black/55 backdrop-blur-sm tabular-nums">
                    {String(activeIndex + 1).padStart(2, "0")} /{" "}
                    {String(safeItems.length).padStart(2, "0")}
                </div>
            </div>

            {safeItems.length > 1 && (
                <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 px-4">
                    {safeItems.map((item, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                aria-current={isActive ? "true" : undefined}
                                className={`h-px transition-all duration-300 ease-out cursor-pointer ${
                                    isActive
                                        ? "w-10 bg-white md:bg-zinc-900"
                                        : "w-5 bg-white/40 md:bg-zinc-400 hover:bg-white/70 md:hover:bg-zinc-600"
                                }`}
                            />
                        );
                    })}
                </div>
            )}
        </section>
    );
}
