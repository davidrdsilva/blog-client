"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/app/providers/theme-provider";
import { ThemeToggle } from "./theme-toggle";

export default function NavBar() {
    const { theme } = useTheme();

    return (
        <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/">
                    <Image
                        src="/images/tfp.png"
                        alt="The Falls Post"
                        width={200}
                        height={100}
                        sizes="(max-width: 768px) 100vw, 1200px"
                        style={{
                            filter: theme === "dark" ? "invert(0)" : "invert(1)",
                        }}
                    />
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        href="/posts/new"
                        className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        New Post
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
