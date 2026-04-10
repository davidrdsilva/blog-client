import { notFound } from "next/navigation";
import Comments from "@/app/components/comments";
import { EditorJsRenderer } from "@/app/components/editorjs-renderer";
import Footer from "@/app/components/footer";
import { GalleryImage, GalleryProvider } from "@/app/components/image-gallery";
import NavBar from "@/app/components/navbar";
import { APIClientError, getPost } from "@/app/lib/api";
import type { Post } from "@/app/types/post";
import { calculateReadingTime } from "@/app/utils/calculate-reading-time";
import formatDate from "@/app/utils/format-date";

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

    const contentImages =
        post.content?.blocks
            ?.filter((b) => b.type === "image")
            .map((b) => {
                const data = b.data as { file?: { url: string }; url?: string; caption?: string };
                return {
                    src: data.file?.url || data.url || "",
                    alt: data.caption || "",
                };
            }) || [];

    const allImages = [{ src: post.image, alt: post.title }, ...contentImages].filter(
        (img) => img.src
    );

    return (
        <GalleryProvider images={allImages}>
            <div className="min-h-screen bg-zinc-50 dark:bg-black">
                <NavBar />
                <main className="container mx-auto px-4 py-12 max-w-4xl">
                    <article>
                        <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                            <GalleryImage
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, 1200px"
                            />
                        </div>
                        <header className="mb-8">
                            <h1 className="text-4xl md:text-5xl tracking-wide font-serif text-zinc-900 dark:text-zinc-100 mb-4">
                                {post.title}
                            </h1>
                            {post.subtitle && (
                                <p className="text-lg text-zinc-600 font-serif-light dark:text-zinc-400 mb-6">
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
        </GalleryProvider>
    );
}
