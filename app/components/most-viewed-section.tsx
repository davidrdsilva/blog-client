import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/app/types/post";
import isLocalUrl from "@/app/utils/is-local-url";

interface MostViewedSectionProps {
    posts: Post[];
}

/**
 * MostViewedSection renders the top 5 posts of all time on the homepage,
 * leading each card with a rank number and the post's view count so the
 * "ranking" framing is immediately legible.
 */
export default function MostViewedSection({ posts }: MostViewedSectionProps) {
    if (posts.length === 0) return null;

    return (
        <section
            aria-label="Most viewed posts"
            className="pt-8 pb-12 border-t border-zinc-200 dark:border-zinc-800"
        >
            <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200">
                    Most Viewed
                </h2>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">All time</span>
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {posts.map((post, index) => (
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
                                <span className="absolute top-2 left-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/80 text-white text-sm font-bold">
                                    {index + 1}
                                </span>
                            </div>
                            <h3 className="text-base font-serif text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <div className="mt-auto text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                {post.totalViews.toLocaleString()}{" "}
                                {post.totalViews === 1 ? "view" : "views"}
                            </div>
                        </Link>
                    </li>
                ))}
            </ol>
        </section>
    );
}
