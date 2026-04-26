import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorJsRenderer } from "@/app/components/editorjs-renderer";
import Footer from "@/app/components/footer";
import { GalleryProvider } from "@/app/components/image-gallery";
import WhitenestChaptersSidebar from "@/app/components/whitenest-chapters-sidebar";
import WhitenestCharacters from "@/app/components/whitenest-characters";
import WhitenestHeader from "@/app/components/whitenest-header";
import { APIClientError, getWhitenestChapter, getWhitenestChapters } from "@/app/lib/api";
import { calculateReadingTime } from "@/app/utils/calculate-reading-time";
import formatDate from "@/app/utils/format-date";
import isLocalUrl from "@/app/utils/is-local-url";

const WHITENEST_CATEGORY = "Whitenest";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WhitenestChapterPage({
    params,
}: {
    params: Promise<{ number: string }>;
}) {
    const { number: rawNumber } = await params;
    const parsed = Number(rawNumber);
    if (!Number.isInteger(parsed) || parsed < 1) {
        notFound();
    }

    let result: Awaited<ReturnType<typeof getWhitenestChapter>>;
    try {
        result = await getWhitenestChapter(parsed);
    } catch (error) {
        if (error instanceof APIClientError && error.code === "CHAPTER_NOT_FOUND") {
            notFound();
        }
        throw error;
    }
    if (!result) {
        notFound();
    }

    const { chapter, previous, next } = result;
    const chapterNumber = chapter.whitenestChapterNumber ?? parsed;
    const allChapters = await getWhitenestChapters().catch(() => []);
    const formattedDate = formatDate(chapter.date);
    const readingTime = calculateReadingTime(chapter);

    const contentImages =
        chapter.content?.blocks
            ?.filter((b) => b.type === "image")
            .map((b) => {
                const data = b.data as {
                    file?: { url: string };
                    url?: string;
                    caption?: string;
                };
                return {
                    src: data.file?.url || data.url || "",
                    alt: data.caption || "",
                };
            }) || [];
    const galleryImages = contentImages.filter((img) => img.src);

    return (
        <GalleryProvider images={galleryImages}>
            <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
                <section className="relative w-full h-screen overflow-hidden">
                    <WhitenestHeader variant="overlay" />
                    <Image
                        src={chapter.image}
                        alt={chapter.title}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                        unoptimized={isLocalUrl(chapter.image)}
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-black/55" />
                    <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6">
                        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-white/80 mb-6">
                            {WHITENEST_CATEGORY} — Chapter {chapterNumber}
                        </p>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.05] max-w-5xl">
                            {chapter.title}
                        </h1>
                        {chapter.subtitle && (
                            <p className="mt-6 text-lg md:text-2xl font-serif-light text-white/85 max-w-2xl">
                                {chapter.subtitle}
                            </p>
                        )}
                        <div className="mt-10 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-white/70">
                            <span>{formattedDate}</span>
                            <span aria-hidden="true">•</span>
                            <span>{readingTime}</span>
                        </div>
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-xs font-bold uppercase tracking-[0.3em] flex flex-col items-center gap-2 animate-pulse">
                            <span>Scroll to read</span>
                            <span aria-hidden="true">↓</span>
                        </div>
                    </div>
                </section>

                <article className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
                    <header className="mb-12">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Link
                                href="/"
                                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-80 transition-opacity"
                            >
                                {WHITENEST_CATEGORY}
                            </Link>
                            <Link
                                href={`/posts/${chapter.id}/edit`}
                                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Edit chapter
                            </Link>
                            <WhitenestChaptersSidebar
                                chapters={allChapters}
                                currentChapter={chapterNumber}
                            />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 leading-tight">
                            Chapter {chapterNumber} — {chapter.title}
                        </h2>
                        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-500">
                            <span>{formattedDate}</span>
                            <span aria-hidden="true">•</span>
                            <span className="font-medium">{chapter.author}</span>
                            <span aria-hidden="true">•</span>
                            <span>{readingTime}</span>
                        </div>
                    </header>

                    <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none">
                        {chapter.content ? (
                            <EditorJsRenderer content={chapter.content} variant="whitenest" />
                        ) : (
                            <p className="text-zinc-700 dark:text-zinc-300 leading-7">
                                {chapter.description}
                            </p>
                        )}
                    </div>

                    <WhitenestCharacters characters={result.cast} />

                    {chapter.tags.length > 0 && (
                        <section className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="flex flex-wrap gap-2">
                                {chapter.tags.map((tag) => (
                                    <Link
                                        key={tag.id}
                                        href={`/?tags=${encodeURIComponent(tag.name)}`}
                                        className="px-3 py-1 rounded-full text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                    >
                                        #{tag.name}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <nav
                        aria-label="Chapter navigation"
                        className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {previous ? (
                            <Link
                                href={`/whitenest/${previous.whitenestChapterNumber}`}
                                className="group flex flex-col gap-1 p-5 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors"
                            >
                                <span className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-500">
                                    ← Previous chapter
                                </span>
                                <span className="text-lg font-serif text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                                    {previous.whitenestChapterNumber}. {previous.title}
                                </span>
                            </Link>
                        ) : (
                            <div className="hidden md:block" aria-hidden="true" />
                        )}
                        {next ? (
                            <Link
                                href={`/whitenest/${next.whitenestChapterNumber}`}
                                className="group flex flex-col gap-1 p-5 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors text-right"
                            >
                                <span className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-500">
                                    Next chapter →
                                </span>
                                <span className="text-lg font-serif text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                                    {next.whitenestChapterNumber}. {next.title}
                                </span>
                            </Link>
                        ) : (
                            <div className="hidden md:block" aria-hidden="true" />
                        )}
                    </nav>
                </article>
                <Footer />
            </div>
        </GalleryProvider>
    );
}
