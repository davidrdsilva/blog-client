import { Pagination } from "@/app/components/pagination";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { posts } from "@/app/data/posts";

export default function Home() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Blog</h1>
                    <div className="flex items-center gap-4">
                        <a
                            href="/posts/new"
                            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            New Post
                        </a>
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-12">
                <Pagination allPosts={posts} />
            </main>
        </div>
    );
}
