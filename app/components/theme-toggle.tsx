"use client";

import Image from "next/image";
import { useTheme } from "@/app/providers/theme-provider";
import { Theme } from "@/app/types/theme";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === Theme.Light ? Theme.Dark : Theme.Light} mode`}
            className="transition-colors"
        >
            {theme === Theme.Light ? (
                <Image
                    src="/icons/night-mode.svg"
                    alt="Dark mode"
                    className="cursor-pointer"
                    width={24}
                    height={24}
                />
            ) : (
                <Image
                    src="/icons/light-mode.svg"
                    alt="Light mode"
                    className="cursor-pointer"
                    width={24}
                    height={24}
                />
            )}
        </button>
    );
}
