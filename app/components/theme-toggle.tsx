"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "@/app/providers/theme-provider";

export function ThemeToggle() {
    const { toggleTheme } = useTheme();
    const pathname = usePathname();
    const isWhitenestChapter = pathname?.startsWith("/whitenest/") ?? false;

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`cursor-pointer font-bold uppercase tracking-[0.4em] text-sm transition-colors ${
                isWhitenestChapter ? "text-white" : ""
            }`}
        >
            <span className="hidden dark:block">light</span>
            <span className="block dark:hidden">dark</span>
        </button>
    );
}
