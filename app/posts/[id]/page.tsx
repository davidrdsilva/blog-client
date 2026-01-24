import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorJsRenderer } from "@/app/components/editorjs-renderer";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { posts } from "@/app/data/posts";

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = posts.find((p) => p.id === id);

    if (!post) {
        notFound();
    }

    const formattedDate = formatDate(post.date);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link
                        href="/"
                        className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
                    >
                        Blog
                    </Link>
                    <ThemeToggle />
                </div>
            </header>
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <article>
                    <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 1200px"
                        />
                    </div>
                    <header className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                            {post.title}
                        </h1>
                        {post.subtitle && (
                            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-6">
                                {post.subtitle}
                            </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span className="font-medium">{post.author}</span>
                        </div>
                    </header>
                    <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none">
                        {post.content ? (
                            <EditorJsRenderer content={post.content} />
                        ) : (
                            <p className="text-zinc-700 dark:text-zinc-300 leading-7">
                                {post.description}
                            </p>
                        )}
                    </div>
                </article>
            </main>
        </div>
    );
}
