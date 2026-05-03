"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

interface CommentsToggleValue {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const CommentsToggleContext = createContext<CommentsToggleValue | null>(null);

export function useCommentsToggle() {
    const ctx = useContext(CommentsToggleContext);
    if (!ctx) {
        throw new Error("useCommentsToggle must be used within a PostShell");
    }
    return ctx;
}

interface PostShellProps {
    children: ReactNode;
}

export function PostShell({ children }: PostShellProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <CommentsToggleContext.Provider value={{ isOpen, setIsOpen }}>
            <div
                className={`transition-[padding-right] duration-300 ease-in-out ${
                    isOpen ? "md:pr-100 xl:pr-[25%]" : ""
                }`}
            >
                {children}
            </div>
        </CommentsToggleContext.Provider>
    );
}
