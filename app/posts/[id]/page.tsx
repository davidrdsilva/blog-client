import Image from "next/image";
import { notFound } from "next/navigation";
import { EditorJsRenderer } from "@/app/components/editorjs-renderer";
import NavBar from "@/app/components/navbar";
import { APIClientError, getPost } from "@/app/lib/api";
import type { Post } from "@/app/types/post";

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

function isLocalUrl(url: string): boolean {
    return url.includes("localhost") || url.includes("127.0.0.1");
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let post: Post;
    try {
        post = await getPost(id);
    } catch (error) {
        if (error instanceof APIClientError && error.code === "POST_NOT_FOUND") {
            notFound();
        }
        throw error;
    }

    const formattedDate = formatDate(post.date);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <NavBar />
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
                            unoptimized={isLocalUrl(post.image)}
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
