import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/app/types/post";
import formatDate from "@/app/utils/format-date";
import isLocalUrl from "@/app/utils/is-local-url";
import truncateDescription from "@/app/utils/truncate-description";
import { PostCardMenu } from "./post-card-menu";

interface PostCardProps {
    post: Post;
    onDelete?: (postId: string) => void;
    variant?: "hero" | "standard" | "compact" | "text-only";
}

function formatViews(views: number): string {
    return `${views.toLocaleString()} ${views === 1 ? "view" : "views"}`;
}

export function PostCard({ post, onDelete, variant = "standard" }: PostCardProps) {
    const formattedDate = formatDate(post.date);
    const viewsLabel = formatViews(post.totalViews);

    if (variant === "hero") {
        return (
            <article className="relative group flex flex-col pt-2">
                <div className="absolute bottom-2 right-2 z-10">
                    <PostCardMenu postId={post.id} postTitle={post.title} onDelete={onDelete} />
                </div>
                <Link href={`/posts/${post.id}`} className="flex flex-col gap-4">
                    <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                        {post.title}
                    </h2>
                    <div className="relative w-full aspect-2/1 md:aspect-video overflow-hidden mt-2">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 66vw"
                            unoptimized={isLocalUrl(post.image)}
                            priority
                        />
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 font-serif-light line-clamp-3">
                        {post.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-2">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{viewsLabel}</span>
                    </div>
                </Link>
            </article>
        );
    }

    if (variant === "compact") {
        return (
            <article className="relative group flex flex-col pt-2">
                <div className="absolute top-3 right-2 z-10">
                    <PostCardMenu postId={post.id} postTitle={post.title} onDelete={onDelete} />
                </div>
                <Link href={`/posts/${post.id}`} className="flex flex-col gap-3">
                    <div className="relative w-full aspect-video overflow-hidden border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-1">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            unoptimized={isLocalUrl(post.image)}
                        />
                    </div>
                    <h2 className="text-xl font-serif text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                        {post.title}
                    </h2>
                    <p className="text-sm text-zinc-700 dark:text-zinc-400 font-serif-light line-clamp-2">
                        {truncateDescription(post.description, 80)}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mt-1">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{viewsLabel}</span>
                    </div>
                </Link>
            </article>
        );
    }

    if (variant === "text-only") {
        return (
            <article className="relative group flex flex-col pt-2">
                <div className="absolute top-0 right-0 z-10">
                    <PostCardMenu postId={post.id} postTitle={post.title} onDelete={onDelete} />
                </div>
                <Link href={`/posts/${post.id}`} className="flex flex-col gap-2">
                    <h2 className="text-lg font-serif text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors pr-6">
                        {post.title}
                    </h2>
                    <p className="text-sm text-zinc-700 dark:text-zinc-400 font-serif-light line-clamp-2">
                        {truncateDescription(post.description, 100)}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mt-1">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{viewsLabel}</span>
                    </div>
                </Link>
            </article>
        );
    }

    // Standard variant
    return (
        <article className="relative group flex flex-col pt-2 h-full">
            <div className="absolute top-3 right-2 z-10">
                <PostCardMenu postId={post.id} postTitle={post.title} onDelete={onDelete} />
            </div>
            <Link href={`/posts/${post.id}`} className="flex flex-col gap-3 h-full">
                <div className="relative w-full aspect-4/3 overflow-hidden border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-1">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        unoptimized={isLocalUrl(post.image)}
                    />
                </div>
                <h2 className="text-lg font-serif text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors line-clamp-2">
                    {post.title}
                </h2>
                <p className="text-sm text-zinc-700 dark:text-zinc-400 font-serif-light line-clamp-3 mb-2">
                    {truncateDescription(post.description, 120)}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mt-auto pt-2">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{viewsLabel}</span>
                </div>
            </Link>
        </article>
    );
}
