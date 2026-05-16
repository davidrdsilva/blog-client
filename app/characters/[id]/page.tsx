import Image from "next/image";
import { notFound } from "next/navigation";
import CharacterRadar from "@/app/components/character-radar";
import { APIClientError, getCharacter } from "@/app/lib/api";
import type { Character, CharacterSkills, CharacterStatus } from "@/app/types/post";
import BackLink from "./back-link";

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

    return (
        <div className="relative min-h-screen text-zinc-100 isolate">
            <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
                <Image
                    src={character.portrait}
                    alt=""
                    fill
                    sizes="100vw"
                    priority
                    unoptimized
                    className="object-cover object-center scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/60 to-black/95" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_85%)]" />
            </div>

            <main className="container mx-auto px-4 py-10 md:py-16 max-w-5xl">
                <BackLink fallbackHref="/whitenest" />

                <div className="relative border border-white/10 bg-black/55 backdrop-blur-md shadow-2xl">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"
                    />

                    <div className="p-6 md:p-12 flex flex-col gap-10">
                        <header className="flex flex-col gap-4">
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

                        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6 border-y border-white/10 py-6">
                            <Field label="Status">
                                {statusMeta ? (
                                    <span className="flex items-center gap-2">
                                        <span
                                            aria-hidden="true"
                                            className={`block w-1.5 h-1.5 rounded-full ${statusMeta.dot} shadow-[0_0_8px_currentColor]`}
                                        />
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

                            <Field label="Affiliation">
                                {character.affiliation ? (
                                    <span className="text-sm text-white">
                                        {character.affiliation}
                                    </span>
                                ) : (
                                    <Dash />
                                )}
                            </Field>

                            <Field label="Location">
                                <span className="text-sm text-white">{character.location}</span>
                            </Field>

                            <Field label="Confirmed kills">
                                {typeof character.killCount === "number" ? (
                                    <span className="font-serif text-3xl leading-none text-white tabular-nums">
                                        {character.killCount.toString().padStart(2, "0")}
                                    </span>
                                ) : (
                                    <Dash />
                                )}
                            </Field>
                        </dl>

                        <section>
                            <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50 mb-4">
                                Profile
                            </p>
                            <p className="text-base md:text-lg leading-relaxed text-white/85 whitespace-pre-line">
                                {character.description}
                            </p>
                        </section>

                        <section className="relative">
                            <div className="flex items-baseline justify-between mb-6">
                                <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50">
                                    Skill Matrix
                                </p>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-serif-light">
                                    Scale 0&ndash;100
                                </p>
                            </div>
                            <div className="relative flex items-center justify-center py-4 text-white">
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]"
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2 min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">
                {label}
            </dt>
            <dd className="min-w-0">{children}</dd>
        </div>
    );
}

function Dash() {
    return <span className="text-sm text-white/40">&mdash;</span>;
}
