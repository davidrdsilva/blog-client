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
}

export function PostCard({ post, onDelete }: PostCardProps) {
    const truncatedDescription = truncateDescription(post.description, 100);
    const formattedDate = formatDate(post.date);

    return (
        <article className="relative flex flex-col overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-shadow hover:shadow-lg">
            <div className="absolute top-3 right-3 z-10">
                <PostCardMenu postId={post.id} postTitle={post.title} onDelete={onDelete} />
            </div>
            <Link href={`/posts/${post.id}`} className="flex flex-col flex-1">
                <div className="relative w-full aspect-video">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized={isLocalUrl(post.image)}
                    />
                </div>
                <div className="flex flex-col gap-3 p-5 flex-1">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                        {post.title}
                    </h2>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 line-clamp-3">
                        {truncatedDescription}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-2 text-zinc-500 dark:text-zinc-500">
                        <span>{formattedDate}</span>
                        <span className="font-bold">{post.author}</span>
                    </div>
                </div>
            </Link>
        </article>
    );
}
