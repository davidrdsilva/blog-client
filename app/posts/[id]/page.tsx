import Image from "next/image";
import { notFound } from "next/navigation";
import Comments from "@/app/components/comments";
import { EditorJsRenderer } from "@/app/components/editorjs-renderer";
import Footer from "@/app/components/footer";
import NavBar from "@/app/components/navbar";
import { APIClientError, getPost } from "@/app/lib/api";
import type { Post } from "@/app/types/post";
import formatDate from "@/app/utils/format-date";
import isLocalUrl from "@/app/utils/is-local-url";

function calculateReadingTime(post: Post): string {
    let textContent = "";

    if (post.content?.blocks?.length) {
        textContent = post.content.blocks
            .map((block) => {
                const data = block.data || {};
                let text = "";
                if (typeof data.text === "string") text += data.text + " ";
                if (Array.isArray(data.items)) text += data.items.join(" ") + " ";
                if (typeof data.caption === "string") text += data.caption + " ";
                return text;
            })
            .join(" ");
    } else {
        textContent = post.description || "";
    }

    // Strip HTML tags commonly found in Editor.js strings (like <b>, <i>, <a>)
    const cleanText = textContent.replace(/<[^>]*>/g, " ");
    const wordCount = cleanText.split(/\s+/).filter((word) => word.length > 0).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));

    return `${minutes} min read`;
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
    const readingTime = calculateReadingTime(post);

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
                        <h1 className="text-4xl md:text-5xl tracking-wide font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                            {post.title}
                        </h1>
                        {post.subtitle && (
                            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-6">
                                {post.subtitle}
                            </p>
                        )}
                        <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-500">
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span className="font-medium">{post.author}</span>
                            <span>•</span>
                            <span>{readingTime}</span>
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
                <Comments postId={post.id} />
            </main>
            <Footer />
        </div>
    );
}
