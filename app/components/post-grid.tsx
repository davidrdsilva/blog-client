import type { Post } from "@/app/types/post";
import { PostCard } from "./post-card";

interface PostGridProps {
    posts: Post[];
    onDelete?: (postId: string) => void;
    isDeleting?: boolean;
}

export function PostGrid({ posts, onDelete, isDeleting }: PostGridProps) {
    return (
        <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
        >
            {posts.map((post) => (
                <PostCard key={post.id} post={post} onDelete={onDelete} />
            ))}
        </div>
    );
}
