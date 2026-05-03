import Footer from "@/app/components/footer";
import ManagePostsArchive from "@/app/components/manage-posts-archive";
import NavBar from "@/app/components/navbar";
import { getPosts } from "@/app/lib/api";
import type { Post } from "@/app/types/post";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 50;
const MAX_PAGES = 100;

async function fetchAllNonWhitenestPosts(): Promise<Post[]> {
    const all: Post[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
        const result = await getPosts({
            isWhitenestChapter: false,
            page,
            limit: PAGE_SIZE,
            sortBy: "date",
            sortOrder: "desc",
        });
        all.push(...result.posts);
        if (!result.meta.hasMore) break;
    }
    return all;
}

export default async function ManagePostsPage() {
    const posts = await fetchAllNonWhitenestPosts();

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <NavBar />
            <main className="container mx-auto px-5 sm:px-6 lg:px-10 py-10 lg:py-24 max-w-6xl">
                <ManagePostsArchive initialPosts={posts} />
            </main>
            <Footer />
        </div>
    );
}
