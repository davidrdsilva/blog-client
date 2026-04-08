import ApiError from "@/app/components/api-error";
import Footer from "@/app/components/footer";
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

    const today = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const formattedDate = today.toLocaleDateString("en-US", dateOptions);

    return (
        <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
            <NavBar />
            <main className="container mx-auto px-4 max-w-[1400px]">
                <div className="py-2 border-b-2 border-black dark:border-white mb-6 mt-4 flex flex-col md:flex-row justify-between items-center text-xs font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200">
                    <span>{formattedDate}</span>
                    <span className="hidden md:inline-block">Today's Paper</span>
                </div>
                <SearchablePosts initialPosts={posts} />
            </main>
            <Footer />
        </div>
    );
}
