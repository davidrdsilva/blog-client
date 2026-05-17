import Image from "next/image";
import { notFound } from "next/navigation";
import CharacterGallerySlideshow from "@/app/components/character-gallery-slideshow";
import CharacterRadar from "@/app/components/character-radar";
import { APIClientError, getCharacter, getCharacterGallery } from "@/app/lib/api";
import type {
    Character,
    CharacterGalleryItem,
    CharacterSkills,
    CharacterStatus,
} from "@/app/types/post";
import BackLink from "./back-link";
import CursorGlow from "./cursor-glow";

const SKILL_LABELS = ["Melee", "Guns", "Stealth", "Persuasion", "Intellect", "Endurance"] as const;

const STATUS_META: Record<
    CharacterStatus,
    { label: string; dot: string; text: string; ring: string }
> = {
    alive: {
        label: "Active",
        dot: "bg-emerald-400 md:bg-emerald-600",
        text: "text-emerald-300 md:text-emerald-700",
        ring: "ring-emerald-400/40 md:ring-emerald-600/30",
    },
    dead: {
        label: "Deceased",
        dot: "bg-red-500 md:bg-red-600",
        text: "text-red-300 md:text-red-700",
        ring: "ring-red-400/40 md:ring-red-600/30",
    },
    missing: {
        label: "Missing",
        dot: "bg-amber-400 md:bg-amber-600",
        text: "text-amber-200 md:text-amber-700",
        ring: "ring-amber-300/40 md:ring-amber-600/30",
    },
};

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let character: Character;
    let gallery: CharacterGalleryItem[] = [];
    try {
        const [c, g] = await Promise.all([
            getCharacter(id),
            getCharacterGallery(id).catch(() => [] as CharacterGalleryItem[]),
        ]);
        character = c;
        gallery = g;
    } catch (error) {
        if (
            error instanceof APIClientError &&
            (error.code === "CHARACTER_NOT_FOUND" || error.code === "NOT_FOUND")
        ) {
            notFound();
        }
        throw error;
    }

    const statusMeta = character.status ? STATUS_META[character.status] : null;
    const fileCode = character.id.slice(0, 8).toUpperCase();
    const barcodeBars = Array.from(character.id.replace(/-/g, ""))
        .slice(0, 56)
        .map((c) => (c.charCodeAt(0) % 3) + 1);

    return (
        <div className="relative min-h-screen text-zinc-100 isolate overflow-x-hidden">
            <div aria-hidden="true" className="md:hidden fixed inset-0 -z-10 overflow-hidden">
                <Image
                    src={character.portrait}
                    alt=""
                    fill
                    sizes="100vw"
                    priority
                    unoptimized
                    className="object-cover object-center scale-105 animate-[fade-up_1.2s_ease-out_both]"
                />

                <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/65 to-black/95" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_85%)]" />

                <svg
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full opacity-[0.08] mix-blend-overlay"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <filter id="grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#grain)" />
                </svg>
            </div>

            <div className="hidden md:block fixed inset-y-0 left-0 right-1/2 overflow-hidden">
                {gallery.length > 0 ? (
                    <CharacterGallerySlideshow items={gallery} variant="fill" />
                ) : (
                    <div className="relative w-full h-full">
                        <Image
                            src={character.portrait}
                            alt=""
                            fill
                            sizes="50vw"
                            priority
                            unoptimized
                            className="object-cover object-center scale-105 animate-[fade-up_1.2s_ease-out_both]"
                        />
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-linear-to-r from-black/25 via-transparent to-black/15"
                        />
                    </div>
                )}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-white/30 to-transparent"
                />
                <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.06] mix-blend-overlay"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <filter id="grain-desktop">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#grain-desktop)" />
                </svg>
            </div>

            <div
                aria-hidden="true"
                className="hidden md:flex pointer-events-none fixed inset-y-0 left-0 w-1/2 z-10 flex-col justify-between p-8"
            >
                <div className="flex items-start justify-between text-[10px] font-bold uppercase tracking-[0.5em] text-white/55">
                    <span className="flex items-center gap-3">
                        <span className="block w-1.5 h-1.5 rounded-full bg-white/55" />
                        Whitenest &middot; Cast
                    </span>
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 border border-white/25 text-white/70">
                        <span className="block w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                        Classified
                    </span>
                </div>

                <div className="flex items-end justify-between text-[10px] font-bold uppercase tracking-[0.5em] text-white/55">
                    <span>File N&ordm; {fileCode}</span>
                    <span className="font-serif-light tracking-[0.3em] normal-case italic text-white/40">
                        Gallery
                    </span>
                </div>
            </div>

            <main className="relative md:ml-[50%] md:w-1/2 md:min-h-screen">
                <div className="md:bg-white md:text-zinc-900 md:min-h-screen md:border-l md:border-zinc-200">
                    <div className="px-4 py-10 md:px-10 lg:px-16 md:py-16 max-w-2xl mx-auto md:mx-0 md:max-w-none">
                        <div className="animate-[fade-up_0.5s_ease-out_both]">
                            <BackLink fallbackHref="/whitenest" />
                        </div>

                        <div className="relative border border-white/10 bg-black/55 backdrop-blur-md shadow-2xl animate-[fade-up_0.7s_ease-out_both] md:border-0 md:bg-transparent md:backdrop-blur-none md:shadow-none overflow-hidden md:overflow-visible">
                            <CursorGlow />

                            <span
                                aria-hidden="true"
                                className="md:hidden pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_3px,rgba(255,255,255,0.025)_3px_4px)]"
                            />

                            <span
                                aria-hidden="true"
                                className="md:hidden pointer-events-none absolute -top-3 -right-10 text-7xl font-serif text-white/[0.07] uppercase tracking-[0.3em] whitespace-nowrap -rotate-12 select-none"
                            >
                                Classified
                            </span>

                            <span
                                aria-hidden="true"
                                className="md:hidden pointer-events-none absolute top-1/2 -left-2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[0.6em] text-white/30 select-none"
                                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                            >
                                Whitenest &middot; Internal
                            </span>

                            <Corner position="top-left" />
                            <Corner position="top-right" />
                            <Corner position="bottom-left" />
                            <Corner position="bottom-right" />

                            <div
                                aria-hidden="true"
                                className="md:hidden pointer-events-none absolute -top-px left-8 right-8 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"
                            />

                            <div className="relative p-6 md:p-0 flex flex-col gap-10">
                                <div
                                    className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 animate-[fade-up_0.6s_ease-out_both] md:hidden"
                                    style={{ animationDelay: "120ms" }}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="block w-1.5 h-1.5 rounded-full bg-white/40" />
                                        File N&ordm; {fileCode}
                                    </span>
                                    <span className="inline-flex items-center gap-2 px-2.5 py-1 border border-white/20 text-white/70">
                                        <span className="block w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                                        Classified
                                    </span>
                                </div>

                                <header
                                    className="flex flex-col gap-4 animate-[fade-up_0.7s_ease-out_both]"
                                    style={{ animationDelay: "200ms" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="block h-px w-10 bg-white/40 md:bg-zinc-300" />
                                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-white/70 md:text-zinc-500">
                                            Dossier &middot; {character.occupation}
                                        </p>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.05] tracking-tight text-white md:text-zinc-900">
                                        {character.fullName}
                                    </h1>
                                    <p className="text-base md:text-lg text-white/60 md:text-zinc-500 font-serif-light italic">
                                        Known as &ldquo;{character.shortName}&rdquo;
                                    </p>
                                </header>

                                <dl
                                    className="grid grid-cols-2 gap-x-6 gap-y-6 md:gap-3 border-y border-white/10 md:border-0 py-6 md:py-0 animate-[fade-up_0.7s_ease-out_both]"
                                    style={{ animationDelay: "320ms" }}
                                >
                                    <Field label="Status" index={0}>
                                        {statusMeta ? (
                                            <span className="flex items-center gap-2">
                                                <span
                                                    aria-hidden="true"
                                                    className="relative flex w-2 h-2 items-center justify-center"
                                                >
                                                    {character.status === "alive" && (
                                                        <span
                                                            className={`absolute inline-flex w-full h-full rounded-full ${statusMeta.dot} opacity-75 animate-ping`}
                                                        />
                                                    )}
                                                    <span
                                                        className={`relative block w-1.5 h-1.5 rounded-full ${statusMeta.dot} shadow-[0_0_8px_currentColor] ring-2 ${statusMeta.ring}`}
                                                    />
                                                </span>
                                                <span
                                                    className={`text-sm md:text-lg font-bold uppercase tracking-[0.2em] ${statusMeta.text}`}
                                                >
                                                    {statusMeta.label}
                                                </span>
                                            </span>
                                        ) : (
                                            <Dash />
                                        )}
                                    </Field>

                                    <Field label="Affiliation" index={1}>
                                        {character.affiliation ? (
                                            <span className="text-sm md:text-lg text-white md:text-zinc-900">
                                                {character.affiliation}
                                            </span>
                                        ) : (
                                            <Dash />
                                        )}
                                    </Field>

                                    <Field label="Location" index={2}>
                                        <span className="text-sm md:text-lg text-white md:text-zinc-900">
                                            {character.location}
                                        </span>
                                    </Field>

                                    <Field label="Confirmed kills" index={3}>
                                        {typeof character.killCount === "number" ? (
                                            <span className="font-serif text-3xl md:text-5xl lg:text-6xl leading-none text-white md:text-zinc-900 tabular-nums">
                                                {character.killCount.toString().padStart(2, "0")}
                                            </span>
                                        ) : (
                                            <Dash />
                                        )}
                                    </Field>
                                </dl>

                                <section
                                    className="animate-[fade-up_0.7s_ease-out_both]"
                                    style={{ animationDelay: "440ms" }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50 md:text-zinc-500">
                                            Profile
                                        </p>
                                        <span className="block flex-1 h-px bg-white/10 md:bg-zinc-200" />
                                    </div>
                                    <p className="text-base md:text-lg leading-relaxed text-white/85 md:text-zinc-700 whitespace-pre-line">
                                        {character.description}
                                    </p>
                                </section>

                                <section
                                    className="relative animate-[fade-up_0.8s_ease-out_both]"
                                    style={{ animationDelay: "560ms" }}
                                >
                                    <div className="flex items-baseline justify-between mb-6">
                                        <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50 md:text-zinc-500">
                                            Skill Matrix
                                        </p>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 md:text-zinc-400 font-serif-light">
                                            Hover &middot; Scale 0&ndash;100
                                        </p>
                                    </div>
                                    <div className="relative flex items-center justify-center py-4 text-white md:text-zinc-900">
                                        <div
                                            aria-hidden="true"
                                            className="md:hidden pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07),transparent_60%)]"
                                        />
                                        <CharacterRadar
                                            axes={SKILL_LABELS.map((label) => ({
                                                label,
                                                value: character.skills[
                                                    label.toLowerCase() as keyof CharacterSkills
                                                ],
                                            }))}
                                        />
                                    </div>
                                </section>

                                {gallery.length > 0 && (
                                    <section
                                        className="md:hidden animate-[fade-up_0.75s_ease-out_both]"
                                        style={{ animationDelay: "500ms" }}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50 md:text-zinc-500">
                                                Surveillance
                                            </p>
                                            <span className="block flex-1 h-px bg-white/10 md:bg-zinc-200" />
                                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 md:text-zinc-400 tabular-nums">
                                                {gallery.length.toString().padStart(2, "0")}
                                            </span>
                                        </div>
                                        <CharacterGallerySlideshow items={gallery} />
                                    </section>
                                )}

                                <section
                                    aria-hidden="true"
                                    className="md:hidden flex flex-col gap-2 pt-4 mt-2 border-t border-white/10 animate-[fade-up_0.9s_ease-out_both]"
                                    style={{ animationDelay: "700ms" }}
                                >
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
                                        <span>WN&ndash;{fileCode}</span>
                                        <span className="font-serif-light tracking-[0.3em] normal-case italic">
                                            end of file
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-px h-8 overflow-hidden">
                                        {barcodeBars.map((w, i) => (
                                            <span
                                                // biome-ignore lint/suspicious/noArrayIndexKey: barcode is purely decorative, ordering is stable
                                                key={i}
                                                className="block bg-white/70 h-full shrink-0"
                                                style={{ width: `${w}px` }}
                                            />
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div
                                aria-hidden="true"
                                className="md:hidden pointer-events-none absolute -bottom-px left-8 right-8 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Field({
    label,
    index,
    children,
}: {
    label: string;
    index: number;
    children: React.ReactNode;
}) {
    return (
        <div className="group flex flex-col gap-2 min-w-0 relative md:gap-3 md:p-5 lg:p-6 md:bg-zinc-50 md:border md:border-zinc-200 md:hover:border-zinc-900 md:hover:bg-white transition-colors">
            <div className="flex items-center gap-2 md:gap-3">
                <span className="font-serif text-[10px] md:text-2xl lg:text-3xl text-white/30 md:text-zinc-300 tabular-nums leading-none">
                    {(index + 1).toString().padStart(2, "0")}
                </span>
                <dt className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-white/50 group-hover:text-white/80 md:text-zinc-500 md:group-hover:text-zinc-900 transition-colors">
                    {label}
                </dt>
            </div>
            <dd className="min-w-0 md:pt-1">{children}</dd>
            <span
                aria-hidden="true"
                className="block md:hidden h-px w-0 bg-white/40 group-hover:w-8 transition-[width] duration-500 ease-out"
            />
        </div>
    );
}

function Corner({
    position,
}: {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
    const base =
        "pointer-events-none absolute w-5 h-5 border-white/40 animate-[fade-up_0.6s_ease-out_both] md:hidden";
    const map = {
        "top-left": "-top-px -left-px border-t-2 border-l-2",
        "top-right": "-top-px -right-px border-t-2 border-r-2",
        "bottom-left": "-bottom-px -left-px border-b-2 border-l-2",
        "bottom-right": "-bottom-px -right-px border-b-2 border-r-2",
    } as const;
    return <span aria-hidden="true" className={`${base} ${map[position]}`} />;
}

function Dash() {
    return <span className="text-sm text-white/40 md:text-zinc-400">&mdash;</span>;
}
