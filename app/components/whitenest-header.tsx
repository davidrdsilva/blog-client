"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

interface WhitenestHeaderProps {
    variant?: "overlay" | "solid";
}

export default function WhitenestHeader({ variant = "overlay" }: WhitenestHeaderProps) {
    const isOverlay = variant === "overlay";

    return (
        <header
            className={
                isOverlay
                    ? "absolute top-0 left-0 right-0 z-30"
                    : "sticky top-0 z-30 bg-white/95 dark:bg-black/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800"
            }
        >
            <div className="max-w-[1400px] mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" aria-label="The Falls Post — back to home">
                    <Image
                        src="/images/tfp.png"
                        alt="The Falls Post"
                        width={180}
                        height={90}
                        sizes="(max-width: 768px) 140px, 180px"
                        className={isOverlay ? "" : "invert dark:invert-0"}
                        priority
                    />
                </Link>
                <ThemeToggle />
            </div>
        </header>
    );
}
