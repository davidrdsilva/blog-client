"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MainNavSidebar from "./main-nav-sidebar";
import StockTicker from "./stock-ticker";
import { ThemeToggle } from "./theme-toggle";

export default function NavBar() {
    const currentPath = usePathname();
    return (
        <header className="max-w-[1400px] mx-auto border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
            <div className="container px-4 py-4 mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4 sm:gap-6">
                    <MainNavSidebar />
                    <Link href="/">
                        <Image
                            src="/images/tfp.png"
                            alt="The Falls Post"
                            width={200}
                            height={100}
                            sizes="(max-width: 768px) 100vw, 1200px"
                            className="invert dark:invert-0"
                        />
                    </Link>
                </div>
                <div className="flex items-center gap-6">
                    <StockTicker />
                    {currentPath !== "/posts/new" && (
                        <Link
                            href="/posts/new"
                            className="hidden lg:block px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            New Post
                        </Link>
                    )}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
