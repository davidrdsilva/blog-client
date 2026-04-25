import ApiError from "@/app/components/api-error";
import CategoriesStrip from "@/app/components/categories-strip";
import Footer from "@/app/components/footer";
import MostViewedSection from "@/app/components/most-viewed-section";
import NavBar from "@/app/components/navbar";
import { SearchablePosts } from "@/app/components/searchable-posts";
import { getMostViewedPosts, getPostCountByCategory, getPosts } from "@/app/lib/api";

// Force dynamic rendering - fetch data at request time, not build time
export const dynamic = "force-dynamic";

// Disable caching for this page
export const revalidate = 0;

interface HomeProps {
    searchParams: Promise<{ category?: string; tags?: string | string[] }>;
}

export default async function Home({ searchParams }: HomeProps) {
    const { category, tags } = await searchParams;
    const parsedCategoryId = category ? Number(category) : undefined;
    const activeCategoryId =
        parsedCategoryId && !Number.isNaN(parsedCategoryId) && parsedCategoryId > 0
            ? parsedCategoryId
            : undefined;

    const tagFilters = (() => {
        if (!tags) return undefined;
        const arr = Array.isArray(tags) ? tags : [tags];
        const flat = arr
            .flatMap((t) => t.split(","))
            .map((t) => t.trim())
            .filter(Boolean);
        return flat.length > 0 ? flat : undefined;
    })();

    const [{ posts, error }, categoryCounts, mostViewedPosts] = await Promise.all([
        getPosts({
            limit: 50,
            sortBy: "date",
            sortOrder: "desc",
            categoryId: activeCategoryId,
            tags: tagFilters,
        }),
        getPostCountByCategory(),
        getMostViewedPosts(),
    ]);

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
                <CategoriesStrip categories={categoryCounts} activeId={activeCategoryId} />
                <MostViewedSection posts={mostViewedPosts} />
                <SearchablePosts initialPosts={posts} />
            </main>
            <Footer />
        </div>
    );
}
