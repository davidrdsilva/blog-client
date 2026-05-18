"use client";

import Link from "next/link";
import Footer from "@/app/components/footer";
import NavBar from "@/app/components/navbar";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col">
            <NavBar />
            <main className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 max-w-4xl flex-1 flex items-center">
                <article className="w-full space-y-10 lg:space-y-14 animate-[fade-up_0.6s_ease-out_both]">
                    <header className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] sm:tracking-[0.5em] text-red-600 dark:text-red-400">
                            Workshop · Editorial Desk · Press Failure
                        </p>
                        <div className="flex items-baseline gap-4 sm:gap-6 border-t-2 border-b border-red-600 dark:border-red-500 py-3 sm:py-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500 font-mono">
                                No.
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-600 dark:text-red-400 font-mono tabular-nums">
                                500
                            </span>
                            <span
                                aria-hidden="true"
                                className="ml-auto h-px flex-1 bg-red-200 dark:bg-red-900/40 self-center"
                            />
                            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.35em] text-red-600 dark:text-red-400 font-mono whitespace-nowrap">
                                Status — Wire down
                            </span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)] gap-8 md:gap-14 items-center">
                        <span
                            aria-hidden="true"
                            className="block font-serif italic text-zinc-900 dark:text-zinc-100 text-[140px] sm:text-[220px] lg:text-[280px] leading-none tracking-tight select-none"
                        >
                            500
                        </span>
                        <div className="space-y-5 max-w-md">
                            <h1 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
                                Stop the presses.
                            </h1>
                            <p className="font-serif-light text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                                Something jammed inside the press room — we couldn&apos;t set this
                                page for you. Run the press again, or head back to the front page
                                while we sort it out.
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => reset()}
                                    className="inline-flex items-center gap-2 px-5 py-3 border border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors cursor-pointer"
                                >
                                    Run the press again
                                    <span aria-hidden="true">↻</span>
                                </button>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-5 py-3 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold uppercase tracking-[0.3em] underline-offset-4 hover:underline"
                                >
                                    Return to the front page
                                </Link>
                            </div>
                            {error?.digest && (
                                <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-400 dark:text-zinc-600 pt-3">
                                    Digest — {error.digest}
                                </p>
                            )}
                        </div>
                    </div>

                    <footer className="border-t border-zinc-200 dark:border-zinc-800 pt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-500 font-mono">
                        <span>Wire log — Unexpected press condition</span>
                        <span aria-hidden="true">·</span>
                        <span>Filed: Internal</span>
                        <span aria-hidden="true">·</span>
                        <span>Pressed in Europe</span>
                    </footer>
                </article>
            </main>
            <Footer />
        </div>
    );
}
