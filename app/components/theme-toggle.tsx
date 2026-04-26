"use client";

import { useTheme } from "@/app/providers/theme-provider";

export function ThemeToggle() {
    const { toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="cursor-pointer font-bold uppercase tracking-[0.4em] text-sm transition-colors"
        >
            <span className="block dark:hidden">light</span>
            <span className="hidden dark:block">dark</span>
        </button>
    );
}
