import { posts } from "@/app/data/posts";
import { Pagination } from "@/app/components/pagination";
import { ThemeToggle } from "@/app/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Blog</h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">
        <Pagination allPosts={posts} />
      </main>
    </div>
  );
}
