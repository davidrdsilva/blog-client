import ApiError from "@/app/components/api-error";
import NavBar from "@/app/components/navbar";
import { SearchablePosts } from "@/app/components/searchable-posts";
import { getPosts } from "@/app/lib/api";

// Force dynamic rendering - fetch data at request time, not build time
export const dynamic = "force-dynamic";

// Disable caching for this page
export const revalidate = 0;

export default async function Home() {
    const { posts, error } = await getPosts({ limit: 50, sortBy: "date", sortOrder: "desc" });

    if (error) {
        return <ApiError />;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <NavBar />
            <main className="container mx-auto px-4 py-12">
                <SearchablePosts initialPosts={posts} />
            </main>
        </div>
    );
}
