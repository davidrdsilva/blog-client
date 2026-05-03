import Footer from "@/app/components/footer";
import NavBar from "@/app/components/navbar";
import WhitenestManageChapters from "@/app/components/whitenest-manage-chapters";
import { getWhitenestChapters } from "@/app/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ManageWhitenestChaptersPage() {
    const chapters = await getWhitenestChapters();

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <NavBar />
            <main className="container mx-auto px-5 sm:px-6 lg:px-10 py-10 lg:py-24 max-w-6xl">
                <WhitenestManageChapters initialChapters={chapters} />
            </main>
            <Footer />
        </div>
    );
}
