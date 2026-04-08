import type { Post } from "@/app/types/post";
import { PostCard } from "./post-card";

interface PostGridProps {
    posts: Post[];
    onDelete?: (postId: string) => void;
    isDeleting?: boolean;
}

export function PostGrid({ posts, onDelete, isDeleting }: PostGridProps) {
    if (posts.length === 0) return null;

    const heroPost = posts[0];
    const secondaryPosts = posts.slice(1, 4);
    const deeperPosts = posts.slice(4);

    return (
        <div className={`flex flex-col ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-zinc-200 dark:border-zinc-800">
                {/* Hero Area */}
                <div className="lg:col-span-8 lg:border-r border-zinc-200 dark:border-zinc-800 lg:pr-12">
                    <PostCard post={heroPost} onDelete={onDelete} variant="hero" />
                </div>

                {/* Right Sidebar Area */}
                <div className="lg:col-span-4 flex flex-col pt-2">
                    {secondaryPosts.map((post, index) => (
                        <div
                            key={post.id}
                            className={`pb-6 ${index !== secondaryPosts.length - 1 ? "border-b border-zinc-200 dark:border-zinc-800 mb-6" : ""}`}
                        >
                            <PostCard
                                post={post}
                                onDelete={onDelete}
                                variant={index === 0 ? "compact" : "text-only"}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {deeperPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 pt-12">
                    {deeperPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={onDelete}
                            variant="standard"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
