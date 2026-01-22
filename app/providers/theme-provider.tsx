"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Theme } from "@/app/types/theme";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("theme") as Theme | null;
            if (stored && Object.values(Theme).includes(stored)) {
                const root = document.documentElement;
                root.classList.toggle("dark", stored === Theme.Dark);
                root.classList.toggle("light", stored === Theme.Light);
                return stored;
            }
            const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? Theme.Dark
                : Theme.Light;
            const root = document.documentElement;
            root.classList.toggle("dark", systemPreference === Theme.Dark);
            root.classList.toggle("light", systemPreference === Theme.Light);
            return systemPreference;
        }
        return Theme.Light;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === Theme.Dark) {
            root.classList.add("dark");
            root.classList.remove("light");
        } else {
            root.classList.remove("dark");
            root.classList.add("light");
        }
    }, [theme]);

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
