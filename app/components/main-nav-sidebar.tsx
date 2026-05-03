"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import packageJson from "../../package.json";

type SidebarLink = {
    label: string;
    href: string;
    accent?: "live" | "muted";
};

type SidebarSection = {
    eyebrow: string;
    title: string;
    links: SidebarLink[];
};

const SECTIONS: SidebarSection[] = [
    {
        eyebrow: "Section A",
        title: "Sections",
        links: [
            { label: "Front Page", href: "/" },
            { label: "White Nest", href: "/whitenest/1", accent: "live" },
            { label: "Bridge Falls", href: "/?tags=Bridge%20Falls" },
            { label: "Valentino", href: "/?tags=Valentino" },
        ],
    },
    {
        eyebrow: "Section B",
        title: "White Nest",
        links: [
            { label: "Manage Chapters", href: "/admin/whitenest/manage-chapters" },
            { label: "Manage Cast", href: "/admin/characters" },
        ],
    },
    {
        eyebrow: "Section C",
        title: "Editorial Desk",
        links: [
            { label: "Publish with Us", href: "/posts/new" },
            { label: "Manage Articles", href: "/admin/manage-posts" },
        ],
    },
];

const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const MONTHS = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
];

function formatMasthead(date: Date): { weekday: string; long: string } {
    return {
        weekday: WEEKDAYS[date.getDay()],
        long: `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
    };
}

const textColors = {
    default: "bg-zinc-900 dark:bg-zinc-100",
    whitenestBgColors: "bg-white",
    whitenestTextColors: "text-white",
};

export default function MainNavSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [todayLabel, setTodayLabel] = useState<{ weekday: string; long: string } | null>(null);
    const closeBtnRef = useRef<HTMLButtonElement | null>(null);
    const pathname = usePathname();
    const isWhitenestChapter = pathname?.startsWith("/whitenest/") ?? false;

    useEffect(() => {
        setMounted(true);
        setTodayLabel(formatMasthead(new Date()));
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", onKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const focusTimeout = window.setTimeout(() => closeBtnRef.current?.focus(), 280);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
            window.clearTimeout(focusTimeout);
        };
    }, [isOpen]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: pathname identity change is the trigger
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const trigger = (
        <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation index"
            aria-expanded={isOpen}
            className="group relative flex items-center gap-3 px-3 py-2 -ml-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 rounded"
        >
            <span className="flex flex-col gap-[5px] w-5">
                <span
                    className={`block h-px w-full ${isWhitenestChapter ? textColors.whitenestBgColors : textColors.default} transition-transform duration-300 group-hover:translate-x-[2px]`}
                />
                <span
                    className={`block h-px w-3/4 ${isWhitenestChapter ? textColors.whitenestBgColors : textColors.default} transition-all duration-300 group-hover:w-full`}
                />
                <span
                    className={`block h-px w-full ${isWhitenestChapter ? textColors.whitenestBgColors : textColors.default} transition-transform duration-300 group-hover:-translate-x-[2px]`}
                />
            </span>
            <span
                className={`hidden sm:inline text-[11px] uppercase tracking-[0.4em] font-bold ${isWhitenestChapter ? textColors.whitenestTextColors : "text-zinc-900 dark:text-zinc-100"}`}
            >
                Index
            </span>
        </button>
    );

    if (!mounted) return trigger;

    const drawer = (
        <div
            aria-hidden={!isOpen}
            className={`fixed inset-0 z-60 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        >
            <button
                type="button"
                aria-label="Close navigation index"
                tabIndex={isOpen ? 0 : -1}
                onClick={() => setIsOpen(false)}
                className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-500 ease-out ${
                    isOpen ? "opacity-100" : "opacity-0"
                }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation index"
                className={`absolute left-0 top-0 h-full w-[min(440px,92vw)] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-500 will-change-transform ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-zinc-300/70 dark:via-zinc-700 to-transparent"
                />
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-2 w-px bg-linear-to-b from-transparent via-zinc-200/60 dark:via-zinc-800 to-transparent"
                />

                <header className="px-8 pt-7 pb-5 border-b-2 border-zinc-900 dark:border-zinc-100 relative">
                    <div className="flex items-start justify-between">
                        <div>
                            <p
                                className="text-[10px] uppercase tracking-[0.45em] text-zinc-500 dark:text-zinc-400"
                                style={{ fontFamily: "var(--font-serif-light)" }}
                            >
                                The Falls Post
                            </p>
                            <h2
                                className="mt-1 text-[44px] leading-none font-bold uppercase tracking-tight"
                                style={{ fontFamily: "var(--font-sans)" }}
                            >
                                The Index
                            </h2>
                        </div>
                        <button
                            ref={closeBtnRef}
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close navigation index"
                            className="relative size-9 cursor-pointer flex items-center justify-center border border-zinc-900 dark:border-zinc-100 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-950"
                        >
                            <span className="absolute h-px w-4 bg-current rotate-45" />
                            <span className="absolute h-px w-4 bg-current -rotate-45" />
                        </button>
                    </div>

                    {todayLabel && (
                        <div className="mt-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400 font-mono">
                            <span>{todayLabel.weekday}</span>
                            <span
                                aria-hidden="true"
                                className="h-px w-6 bg-zinc-300 dark:bg-zinc-700"
                            />
                            <span>{todayLabel.long}</span>
                            <span
                                aria-hidden="true"
                                className="ml-auto h-px flex-1 bg-zinc-200 dark:bg-zinc-800"
                            />
                            <span className="text-zinc-700 dark:text-zinc-300">
                                No. {packageJson.version}
                            </span>
                        </div>
                    )}
                </header>

                <nav className="flex-1 overflow-y-auto px-8 py-6">
                    {SECTIONS.map((section, sIndex) => (
                        <div
                            key={section.title}
                            className={`mb-8 ${isOpen ? "animate-[fade-up_0.6s_cubic-bezier(0.22,1,0.36,1)_both]" : ""}`}
                            style={{ animationDelay: isOpen ? `${180 + sIndex * 90}ms` : "0ms" }}
                        >
                            <div className="flex items-baseline gap-3 mb-4">
                                <span
                                    className="text-[10px] uppercase tracking-[0.45em] text-zinc-500 dark:text-zinc-400"
                                    style={{ fontFamily: "var(--font-serif-light)" }}
                                >
                                    {section.eyebrow}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"
                                />
                                <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600 font-mono">
                                    {String(section.links.length).padStart(2, "0")}
                                </span>
                            </div>

                            <h3 className="text-[11px] uppercase tracking-[0.35em] text-zinc-400 dark:text-zinc-600 mb-3 font-mono">
                                {section.title}
                            </h3>

                            <ul className="flex flex-col">
                                {section.links.map((link, lIndex) => {
                                    const indexLabel = String(sIndex * 10 + lIndex + 1).padStart(
                                        2,
                                        "0"
                                    );
                                    const isLive = link.accent === "live";
                                    return (
                                        <li key={`${section.title}-${link.label}-${lIndex}`}>
                                            <Link
                                                href={link.href}
                                                className="group/link relative flex items-baseline gap-4 py-2.5 border-b border-dotted border-zinc-300/70 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors"
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="text-[11px] tabular-nums tracking-widest text-zinc-400 dark:text-zinc-600 group-hover/link:text-zinc-900 dark:group-hover/link:text-zinc-100 transition-colors w-7 font-mono"
                                                >
                                                    {indexLabel}
                                                </span>
                                                <span
                                                    className="relative inline-block text-[26px] leading-[1.05] font-bold tracking-tight uppercase text-zinc-900 dark:text-zinc-100"
                                                    style={{ fontFamily: "var(--font-sans)" }}
                                                >
                                                    {link.label}
                                                    <span
                                                        aria-hidden="true"
                                                        className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-zinc-900 dark:bg-zinc-100 origin-left scale-x-0 group-hover/link:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                                    />
                                                </span>
                                                {isLive && (
                                                    <span className="ml-2 self-center inline-flex items-center gap-1.5">
                                                        <span className="relative inline-flex size-1.5 rounded-full bg-red-500">
                                                            <span className="absolute inset-0 inline-flex animate-ping rounded-full bg-red-400 opacity-75" />
                                                        </span>
                                                        <span className="text-[9px] leading-none tracking-[0.4em] text-red-600 dark:text-red-400 font-mono">
                                                            LIVE
                                                        </span>
                                                    </span>
                                                )}
                                                <span
                                                    aria-hidden="true"
                                                    className="ml-auto text-zinc-400 dark:text-zinc-600 group-hover/link:text-zinc-900 dark:group-hover/link:text-zinc-100 group-hover/link:translate-x-1 transition-all self-center"
                                                >
                                                    →
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <footer className="px-8 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400 font-mono">
                    <span>Pressed in Europe</span>
                    <span>On the Wire</span>
                </footer>
            </aside>
        </div>
    );

    return (
        <>
            {trigger}
            {createPortal(drawer, document.body)}
        </>
    );
}
