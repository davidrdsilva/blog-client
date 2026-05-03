import type { Metadata } from "next";

import Footer from "@/app/components/footer";
import NavBar from "@/app/components/navbar";
import formatDate from "@/app/utils/format-date";

import { CHANGELOG_ENTRIES } from "./data";

export const metadata: Metadata = {
    title: "Changelog",
    description: "Releases and field notes from the press.",
};

export default function ChangelogPage() {
    const total = CHANGELOG_ENTRIES.length;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
            <NavBar />
            <main className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 max-w-4xl">
                <div className="space-y-10 lg:space-y-14">
                    <header className="space-y-6 sm:space-y-8 animate-[fade-up_0.6s_ease-out_both]">
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] sm:tracking-[0.5em] text-zinc-500 dark:text-zinc-500">
                                Workshop · Editorial Desk · Changelog
                            </p>
                            <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-zinc-900 dark:text-zinc-100 leading-[1.05] tracking-tight">
                                The Press Run
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                                <span className="sm:hidden">
                                    {total} {total === 1 ? "entry" : "entries"} · most recent first
                                </span>
                                <span className="hidden sm:inline">
                                    {total} {total === 1 ? "entry" : "entries"} on the press · most
                                    recent first · dates set in UTC
                                </span>
                            </p>
                        </div>
                    </header>

                    <ol
                        className="border-t border-zinc-200 dark:border-zinc-800"
                        aria-label="Release log"
                    >
                        {CHANGELOG_ENTRIES.map((entry, index) => {
                            const number = (total - index).toString().padStart(2, "0");
                            return (
                                <li
                                    key={`${entry.date}-${entry.title}`}
                                    className="group relative border-b border-zinc-200 dark:border-zinc-800"
                                >
                                    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] sm:grid-cols-[4.5rem_7rem_minmax(0,1fr)] items-baseline gap-4 sm:gap-8 py-6 sm:py-8 px-2 sm:px-3 -mx-2 sm:-mx-3 transition-colors hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40">
                                        <div className="flex flex-col leading-none">
                                            <span className="hidden sm:block text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600 mb-1">
                                                No.
                                            </span>
                                            <span className="font-serif italic text-3xl sm:text-4xl tabular-nums text-zinc-900 dark:text-zinc-100">
                                                {number}
                                            </span>
                                        </div>

                                        <time
                                            dateTime={entry.date}
                                            className="hidden sm:flex flex-col leading-none"
                                        >
                                            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600 mb-1">
                                                Pressed
                                            </span>
                                            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                                                {formatDate(new Date(entry.date))}
                                            </span>
                                        </time>

                                        <div className="min-w-0 col-span-2 sm:col-span-1">
                                            <p className="font-serif text-xl sm:text-2xl leading-snug text-zinc-900 dark:text-zinc-100">
                                                {entry.title}
                                            </p>
                                            <time
                                                dateTime={entry.date}
                                                className="mt-2 block sm:hidden text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500"
                                            >
                                                {formatDate(new Date(entry.date))}
                                            </time>
                                            <ul className="mt-4 space-y-2">
                                                {entry.items.map((item) => (
                                                    <li
                                                        key={item}
                                                        className="flex gap-3 text-sm sm:text-base font-serif leading-relaxed text-zinc-700 dark:text-zinc-300"
                                                    >
                                                        <span
                                                            aria-hidden
                                                            className="mt-[0.7em] inline-block h-px w-3 shrink-0 bg-zinc-400 dark:bg-zinc-600"
                                                        />
                                                        <span className="min-w-0">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>

                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">
                        — End of run —
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
