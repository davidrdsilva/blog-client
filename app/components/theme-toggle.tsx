"use client";

import Image from "next/image";
import { useTheme } from "@/app/providers/theme-provider";

export function ThemeToggle() {
    const { toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="transition-colors"
        >
            <Image
                src="/icons/night-mode.svg"
                alt="Dark mode"
                className="cursor-pointer block dark:hidden"
                width={24}
                height={24}
            />
            <Image
                src="/icons/light-mode.svg"
                alt="Light mode"
                className="cursor-pointer hidden dark:block"
                width={24}
                height={24}
            />
        </button>
    );
}
