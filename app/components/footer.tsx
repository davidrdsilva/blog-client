"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/app/providers/theme-provider";

export default function Footer() {
    const { theme } = useTheme();

    return (
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center md:items-end">
                <Image
                    src="/images/logo.png"
                    alt="The Falls Post"
                    width={150}
                    height={75}
                    sizes="(max-width: 768px) 100vw, 1200px"
                    style={{
                        filter: theme === "dark" ? "invert(1)" : "invert(0)",
                    }}
                />
                <div className="flex flex-col items-center md:items-end">
                    <div className="flex flex-col text-lg items-center md:items-end mb-4 md:mb-10">
                        <Link href="/about">About</Link>
                        <Link href="/posts/new">Create your post</Link>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-center md:text-right">
                        © {new Date().getFullYear()} The Falls Post. All rights reserved. Version:{" "}
                        <b>v{process.env.NEXT_PUBLIC_APP_VERSION}</b>
                    </p>
                </div>
            </div>
        </footer>
    );
}
