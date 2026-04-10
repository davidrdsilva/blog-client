"use client";

import Image from "next/image";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import isLocalUrl from "@/app/utils/is-local-url";

interface ImageItem {
    src: string;
    alt: string;
}

interface GalleryContextType {
    openGallery: (src: string) => void;
}

const GalleryContext = createContext<GalleryContextType | null>(null);

export function useGallery() {
    const context = useContext(GalleryContext);
    if (!context) {
        throw new Error("useGallery must be used within a GalleryProvider");
    }
    return context;
}

export function GalleryProvider({
    images,
    children,
}: {
    images: ImageItem[];
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openGallery = useCallback(
        (src: string) => {
            const index = images.findIndex((img) => img.src === src);
            if (index !== -1) {
                setCurrentIndex(index);
                setIsOpen(true);
            }
        },
        [images]
    );

    const closeGallery = useCallback(() => setIsOpen(false), []);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") closeGallery();
            if (e.key === "ArrowRight") goToNext();
            if (e.key === "ArrowLeft") goToPrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, closeGallery, goToNext, goToPrev]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Touch handlers for swipe
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) goToNext();
        if (isRightSwipe) goToPrev();
    };

    return (
        <GalleryContext.Provider value={{ openGallery }}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-stretch justify-stretch transition-all duration-300">
                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop click */}
                    {/* biome-ignore lint/a11y/noStaticElementInteractions: Backdrop click */}
                    <div
                        className="absolute inset-0 bg-black/95 md:bg-black/90 md:backdrop-blur-md z-0"
                        onClick={closeGallery}
                    />

                    <button
                        type="button"
                        onClick={closeGallery}
                        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 md:p-3 rounded-full bg-black/40 md:bg-black/20 text-white hover:text-white hover:bg-black/60 transition-colors backdrop-blur-sm cursor-pointer"
                        aria-label="Close gallery"
                    >
                        <svg
                            aria-hidden="true"
                            className="w-6 h-6 md:w-8 md:h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPrev();
                                }}
                                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 p-2 md:p-4 text-white/50 hover:text-white transition-colors"
                                aria-label="Previous image"
                            >
                                <svg
                                    aria-hidden="true"
                                    className="w-10 h-10 md:w-12 md:h-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToNext();
                                }}
                                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 p-2 md:p-4 text-white/50 hover:text-white transition-colors"
                                aria-label="Next image"
                            >
                                <svg
                                    aria-hidden="true"
                                    className="w-10 h-10 md:w-12 md:h-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        </>
                    )}

                    <div
                        className="relative z-10 w-full flex flex-col items-center justify-center p-2 md:p-12 pointer-events-none"
                        onTouchStart={images.length > 1 ? onTouchStart : undefined}
                        onTouchMove={images.length > 1 ? onTouchMove : undefined}
                        onTouchEnd={images.length > 1 ? onTouchEnd : undefined}
                    >
                        {images[currentIndex] && (
                            <>
                                <div className="relative w-full aspect-square md:aspect-auto md:h-full md:max-h-[85vh] flex items-center justify-center pointer-events-auto">
                                    <Image
                                        src={images[currentIndex].src}
                                        alt={images[currentIndex].alt}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        sizes="100vw"
                                        quality={100}
                                        unoptimized={isLocalUrl(images[currentIndex].src)}
                                        priority
                                    />
                                </div>
                                {images[currentIndex].alt && (
                                    <p className="mt-4 md:mt-6 text-zinc-300 text-center max-w-3xl text-sm md:text-base pointer-events-auto selection:bg-white/30">
                                        {images[currentIndex].alt}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 font-mono text-xs md:text-sm tracking-widest z-50 select-none pointer-events-none bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
            )}
        </GalleryContext.Provider>
    );
}

export function GalleryImage({
    src,
    alt,
    className,
    ...props
}: React.ComponentProps<typeof Image> & { src: string; alt: string }) {
    const { openGallery } = useGallery();

    const commonClasses = `md:cursor-zoom-in transition-transform md:hover:opacity-95 md:active:scale-[0.99] ${className || ""}`;
    const handleClick = () => {
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
            openGallery(src);
        }
    };

    if (!props.fill && props.width === 0 && props.height === 0) {
        // Fallback to native img if no dimensions are known to avoid Next.js aspect ratio stretching
        const {
            style,
            sizes,
            priority,
            quality,
            unoptimized,
            placeholder,
            blurDataURL,
            onLoadingComplete,
            ...nativeProps
            // biome-ignore lint/suspicious/noExplicitAny: Native props extraction
        } = props as any;
        return (
            // biome-ignore lint: Next.js rule bypass for native img fallback
            <img
                src={src}
                alt={alt}
                className={commonClasses}
                onClick={handleClick}
                style={style}
                {...nativeProps}
            />
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            className={commonClasses}
            onClick={handleClick}
            unoptimized={isLocalUrl(src)}
            {...props}
        />
    );
}
