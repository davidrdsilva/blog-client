import { notFound, redirect } from "next/navigation";
import { getLatestWhitenestChapter } from "@/app/lib/api";

export const dynamic = "force-dynamic";

export default async function LatestWhitenestRedirect() {
    const chapter = await getLatestWhitenestChapter();
    if (!chapter || chapter.whitenestChapterNumber === undefined) {
        notFound();
    }
    redirect(`/whitenest/${chapter.whitenestChapterNumber}`);
}
