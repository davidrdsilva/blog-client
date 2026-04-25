import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/app/types/post";
import isLocalUrl from "@/app/utils/is-local-url";

interface SimilarPostsProps {
    posts: Post[];
}

/**
 * SimilarPosts renders the related-posts grid at the bottom of a post page.
 * Returns null when empty so the section disappears for posts with no
 * matching siblings (e.g. tag-less posts).
 */
export default function SimilarPosts({ posts }: SimilarPostsProps) {
    if (posts.length === 0) return null;

    return (
        <section
            aria-label="Similar posts"
            className="mt-8 pt-2 border-t border-zinc-200 dark:border-zinc-800"
        >
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200 mb-6">
                Similar Posts
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {posts.map((post) => (
                    <li key={post.id}>
                        <Link
                            href={`/posts/${post.id}`}
                            className="group flex flex-col gap-2 h-full"
                        >
                            <div className="relative w-full aspect-video overflow-hidden">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 20vw"
                                    unoptimized={isLocalUrl(post.image)}
                                />
                            </div>
                            <h3 className="text-base font-serif text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            {post.category && (
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    {post.category.name}
                                </span>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
