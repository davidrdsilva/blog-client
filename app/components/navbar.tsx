"use client";

import Image from "next/image";
import Link from "next/link";
import MainNavSidebar from "./main-nav-sidebar";
import StockTicker from "./stock-ticker";
import { ThemeToggle } from "./theme-toggle";

export default function NavBar() {
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
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
