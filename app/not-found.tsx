import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/components/footer";
import NavBar from "@/app/components/navbar";

export const metadata: Metadata = {
    title: "Page off the press — The Falls Post",
    description: "This page has been pulled from the run. Return to the front page.",
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col">
            <NavBar />
            <main className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 max-w-4xl flex-1 flex items-center">
                <article className="w-full space-y-10 lg:space-y-14 animate-[fade-up_0.6s_ease-out_both]">
                    <header className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] sm:tracking-[0.5em] text-zinc-500 dark:text-zinc-500">
                            Workshop · Editorial Desk · Lost Edition
                        </p>
                        <div className="flex items-baseline gap-4 sm:gap-6 border-t-2 border-b border-zinc-900 dark:border-zinc-100 py-3 sm:py-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500 font-mono">
                                No.
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">
                                404
                            </span>
                            <span
                                aria-hidden="true"
                                className="ml-auto h-px flex-1 bg-zinc-200 dark:bg-zinc-800 self-center"
                            />
                            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-500 font-mono whitespace-nowrap">
                                Status — Off the press
                            </span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)] gap-8 md:gap-14 items-center">
                        <span
                            aria-hidden="true"
                            className="block font-serif italic text-zinc-900 dark:text-zinc-100 text-[140px] sm:text-[220px] lg:text-[280px] leading-none tracking-tight select-none"
                        >
                            404
                        </span>
                        <div className="space-y-5 max-w-md">
                            <h1 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
                                We pulled this page from the run.
                            </h1>
                            <p className="font-serif-light text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                                The address you followed isn&apos;t in today&apos;s edition — it
                                may have been moved, retitled, or simply never made it past the
                                press.
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-3 pt-2">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-5 py-3 border border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors"
                                >
                                    Return to the front page
                                    <span aria-hidden="true">→</span>
                                </Link>
                                <Link
                                    href="/changelog"
                                    className="inline-flex items-center gap-2 px-5 py-3 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold uppercase tracking-[0.3em] underline-offset-4 hover:underline"
                                >
                                    Browse the press run
                                </Link>
                            </div>
                        </div>
                    </div>

                    <footer className="border-t border-zinc-200 dark:border-zinc-800 pt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-500 font-mono">
                        <span>Wire log — Page not in current edition</span>
                        <span aria-hidden="true">·</span>
                        <span>Filed: Unknown</span>
                        <span aria-hidden="true">·</span>
                        <span>Pressed in Europe</span>
                    </footer>
                </article>
            </main>
            <Footer />
        </div>
    );
}
