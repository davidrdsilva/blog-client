import Image from "next/image";
import { notFound } from "next/navigation";
import CharacterRadar from "@/app/components/character-radar";
import { APIClientError, getCharacter } from "@/app/lib/api";
import type { Character, CharacterSkills, CharacterStatus } from "@/app/types/post";
import BackLink from "./back-link";
import CursorGlow from "./cursor-glow";

const SKILL_LABELS = ["Melee", "Guns", "Stealth", "Persuasion", "Intellect", "Endurance"] as const;

const STATUS_META: Record<CharacterStatus, { label: string; dot: string; text: string }> = {
    alive: { label: "Active", dot: "bg-emerald-400", text: "text-emerald-300" },
    dead: { label: "Deceased", dot: "bg-red-500", text: "text-red-300" },
    missing: { label: "Missing", dot: "bg-amber-400", text: "text-amber-200" },
};

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let character: Character;
    try {
        character = await getCharacter(id);
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

    return (
        <div className="relative min-h-screen text-zinc-100 isolate overflow-x-hidden">
            <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
                <Image
                    src={character.portrait}
                    alt=""
                    fill
                    sizes="100vw"
                    priority
                    unoptimized
                    className="object-cover object-center scale-110 animate-[fade-up_1.2s_ease-out_both]"
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

            <main className="container mx-auto px-4 py-10 md:py-16 max-w-5xl">
                <div className="animate-[fade-up_0.5s_ease-out_both]">
                    <BackLink fallbackHref="/whitenest" />
                </div>

                <div className="relative border border-white/10 bg-black/55 backdrop-blur-md shadow-2xl animate-[fade-up_0.7s_ease-out_both]">
                    <CursorGlow />

                    <Corner position="top-left" />
                    <Corner position="top-right" />
                    <Corner position="bottom-left" />
                    <Corner position="bottom-right" />

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"
                    />

                    <div className="relative p-6 md:p-12 flex flex-col gap-10">
                        <div
                            className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 animate-[fade-up_0.6s_ease-out_both]"
                            style={{ animationDelay: "120ms" }}
                        >
                            <span className="flex items-center gap-3">
                                <span className="block w-1.5 h-1.5 rounded-full bg-white/40" />
                                File N&ordm; {fileCode}
                            </span>
                            <span className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 border border-white/20 text-white/70">
                                <span className="block w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                                Classified
                            </span>
                        </div>

                        <header
                            className="flex flex-col gap-4 animate-[fade-up_0.7s_ease-out_both]"
                            style={{ animationDelay: "200ms" }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="block h-px w-10 bg-white/40" />
                                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-white/70">
                                    Dossier &middot; {character.occupation}
                                </p>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-serif leading-[1.05] tracking-tight text-white">
                                {character.fullName}
                            </h1>
                            <p className="text-base md:text-lg text-white/60 font-serif-light italic">
                                Known as &ldquo;{character.shortName}&rdquo;
                            </p>
                        </header>

                        <dl
                            className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6 border-y border-white/10 py-6 animate-[fade-up_0.7s_ease-out_both]"
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
                                                className={`relative block w-1.5 h-1.5 rounded-full ${statusMeta.dot} shadow-[0_0_8px_currentColor]`}
                                            />
                                        </span>
                                        <span
                                            className={`text-sm font-bold uppercase tracking-[0.2em] ${statusMeta.text}`}
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
                                    <span className="text-sm text-white">
                                        {character.affiliation}
                                    </span>
                                ) : (
                                    <Dash />
                                )}
                            </Field>

                            <Field label="Location" index={2}>
                                <span className="text-sm text-white">{character.location}</span>
                            </Field>

                            <Field label="Confirmed kills" index={3}>
                                {typeof character.killCount === "number" ? (
                                    <span className="font-serif text-3xl leading-none text-white tabular-nums">
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
                                <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50">
                                    Profile
                                </p>
                                <span className="block flex-1 h-px bg-white/10" />
                            </div>
                            <p className="text-base md:text-lg leading-relaxed text-white/85 whitespace-pre-line">
                                {character.description}
                            </p>
                        </section>

                        <section
                            className="relative animate-[fade-up_0.8s_ease-out_both]"
                            style={{ animationDelay: "560ms" }}
                        >
                            <div className="flex items-baseline justify-between mb-6">
                                <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50">
                                    Skill Matrix
                                </p>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-serif-light">
                                    Hover &middot; Scale 0&ndash;100
                                </p>
                            </div>
                            <div className="relative flex items-center justify-center py-4 text-white">
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07),transparent_60%)]"
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
                    </div>

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-px left-8 right-8 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"
                    />
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
        <div className="group flex flex-col gap-2 min-w-0 relative">
            <div className="flex items-center gap-2">
                <span className="font-serif text-[10px] text-white/30 tabular-nums">
                    {(index + 1).toString().padStart(2, "0")}
                </span>
                <dt className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50 group-hover:text-white/80 transition-colors">
                    {label}
                </dt>
            </div>
            <dd className="min-w-0">{children}</dd>
            <span
                aria-hidden="true"
                className="block h-px w-0 bg-white/40 group-hover:w-8 transition-[width] duration-500 ease-out"
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
        "pointer-events-none absolute w-5 h-5 border-white/40 animate-[fade-up_0.6s_ease-out_both]";
    const map = {
        "top-left": "-top-px -left-px border-t-2 border-l-2",
        "top-right": "-top-px -right-px border-t-2 border-r-2",
        "bottom-left": "-bottom-px -left-px border-b-2 border-l-2",
        "bottom-right": "-bottom-px -right-px border-b-2 border-r-2",
    } as const;
    return <span aria-hidden="true" className={`${base} ${map[position]}`} />;
}

function Dash() {
    return <span className="text-sm text-white/40">&mdash;</span>;
}
