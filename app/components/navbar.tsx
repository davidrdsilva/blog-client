import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export default function NavBar() {
    return (
        <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    <Link href="/">Blog</Link>
                </h1>
                <div className="flex items-center gap-4">
                    <Link
                        href="/posts/new"
                        className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        New Post
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
