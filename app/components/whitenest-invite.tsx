import Image from "next/image";
import Link from "next/link";
import { getLatestWhitenestChapter } from "@/app/lib/api";
import formatDate from "@/app/utils/format-date";
import isLocalUrl from "@/app/utils/is-local-url";

const WHITENEST_CATEGORY = "Whitenest";

export default async function WhitenestInvite() {
    const chapter = await getLatestWhitenestChapter();
    if (!chapter || chapter.whitenestChapterNumber === undefined) return null;

    const formattedDate = formatDate(chapter.date);

    return (
        <section
            aria-label="Whitenest — latest chapter"
            className="my-12 border-t border-zinc-200 dark:border-zinc-800"
        >
            <Link
                href={`/whitenest/${chapter.whitenestChapterNumber}`}
                className="group relative block overflow-hidden h-[420px] md:h-[560px]"
            >
                <Image
                    src={chapter.image}
                    alt={chapter.title}
                    fill
                    priority
                    sizes="(max-width: 1400px) 100vw, 1400px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    unoptimized={isLocalUrl(chapter.image)}
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"
                />
                <div className="relative z-10 flex flex-col justify-between h-full p-6 md:p-12">
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-white/80">
                        <span className="inline-block w-8 h-px bg-white/60" />
                        <span>A serial mystery from {WHITENEST_CATEGORY}</span>
                    </div>
                    <div className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70 mb-3">
                            Chapter {chapter.whitenestChapterNumber} — {formattedDate}
                        </p>
                        <h2 className="text-4xl md:text-6xl font-serif text-white leading-[1.05] mb-4">
                            {chapter.title}
                        </h2>
                        {chapter.subtitle && (
                            <p className="text-lg md:text-xl font-serif-light text-white/85 max-w-2xl mb-8">
                                {chapter.subtitle}
                            </p>
                        )}
                        <span className="inline-flex items-center gap-2 px-5 py-3 border border-white/70 text-white text-xs font-bold uppercase tracking-[0.25em] group-hover:bg-white group-hover:text-black transition-colors">
                            Read the latest chapter
                            <span aria-hidden="true">→</span>
                        </span>
                    </div>
                </div>
            </Link>
        </section>
    );
}
