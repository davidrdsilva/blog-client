"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Theme } from "@/app/types/theme";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(Theme.Light);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("theme") as Theme | null;
        let initialTheme = Theme.Light;

        if (stored && Object.values(Theme).includes(stored)) {
            initialTheme = stored;
        } else {
            initialTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? Theme.Dark
                : Theme.Light;
        }

        setTheme(initialTheme);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        if (theme === Theme.Dark) {
            root.classList.add("dark");
            root.classList.remove("light");
        } else {
            root.classList.add("light");
            root.classList.remove("dark");
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((prevTheme) => {
            const newTheme = prevTheme === Theme.Light ? Theme.Dark : Theme.Light;
            localStorage.setItem("theme", newTheme);
            return newTheme;
        });
    };

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
