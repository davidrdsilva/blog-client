"use client";

import { useEffect, useRef, useState } from "react";

export default function CursorGlow() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const el = ref.current?.parentElement;
        if (!el) return;

        const handleMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        };
        const handleLeave = () => setPos(null);

        el.addEventListener("mousemove", handleMove);
        el.addEventListener("mouseleave", handleLeave);
        return () => {
            el.removeEventListener("mousemove", handleMove);
            el.removeEventListener("mouseleave", handleLeave);
        };
    }, []);

    return (
        <>
            <div
                ref={ref}
                aria-hidden="true"
                className="md:hidden pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    opacity: pos ? 1 : 0,
                    background: pos
                        ? `radial-gradient(520px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.07), transparent 45%)`
                        : undefined,
                }}
            />
            <div
                aria-hidden="true"
                className="hidden md:block pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    opacity: pos ? 1 : 0,
                    background: pos
                        ? `radial-gradient(520px circle at ${pos.x}px ${pos.y}px, rgba(9,9,11,0.04), transparent 45%)`
                        : undefined,
                }}
            />
        </>
    );
}
