"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Character, CharacterSkills } from "@/app/types/post";
import CharacterRadar from "./character-radar";

const SKILL_LABELS = ["Melee", "Guns", "Stealth", "Persuasion", "Intellect", "Endurance"] as const;

interface WhitenestCharactersProps {
    characters: Character[];
}

export default function WhitenestCharacters({ characters }: WhitenestCharactersProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const active = characters.find((c) => c.id === activeId) ?? null;

    useEffect(() => {
        if (!active) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setActiveId(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [active]);

    useEffect(() => {
        if (!active) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [active]);

    if (characters.length === 0) return null;

    return (
        <section className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500 mb-6">
                Cast in this chapter
            </h3>

            <ul className="flex flex-wrap gap-6">
                {characters.map((character) => (
                    <li key={character.id}>
                        <button
                            type="button"
                            onClick={() => setActiveId(character.id)}
                            className="group flex flex-col items-center gap-2 cursor-pointer"
                            aria-label={`Show details for ${character.fullName}`}
                        >
                            <span className="relative block w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-900 dark:group-hover:border-zinc-100 transition-colors">
                                <Image
                                    src={character.portrait}
                                    alt=""
                                    fill
                                    sizes="96px"
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    unoptimized
                                />
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-700 dark:text-zinc-300">
                                {character.shortName}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                onClick={() => setActiveId(null)}
                aria-label="Close character details"
                tabIndex={active ? 0 : -1}
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                    active ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-hidden={!active}
                aria-label={active ? `${active.fullName} — character details` : undefined}
                className={`fixed inset-0 z-50 md:flex md:items-center md:justify-center md:p-4 ${
                    active ? "" : "pointer-events-none"
                }`}
            >
                <div
                    className={`absolute inset-0 overflow-y-auto bg-white dark:bg-[#09090b] transition-transform duration-300 ease-in-out md:relative md:inset-auto md:w-full md:max-w-3xl md:max-h-[90vh] md:border md:border-zinc-200 md:dark:border-zinc-800 md:shadow-2xl md:transition-[transform,opacity] ${
                        active
                            ? "translate-x-0 md:scale-100 md:opacity-100"
                            : "translate-x-full md:translate-x-0 md:scale-95 md:opacity-0"
                    }`}
                >
                    <button
                        type="button"
                        onClick={() => setActiveId(null)}
                        aria-label="Close"
                        className="absolute top-4 right-4 z-10 p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            role="img"
                            aria-labelledby="character-close-icon"
                        >
                            <title id="character-close-icon">Close</title>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {active && (
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
                            <div className="relative aspect-square md:aspect-auto md:min-h-[420px]">
                                <Image
                                    src={active.portrait}
                                    alt={active.fullName}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                    className="object-cover"
                                    unoptimized
                                />
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent md:hidden"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-6 md:hidden text-white">
                                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/70 mb-1">
                                        {active.occupation}
                                    </p>
                                    <h4 className="text-3xl font-serif">{active.fullName}</h4>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 flex flex-col gap-6">
                                <header className="hidden md:block">
                                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-500 mb-2">
                                        {active.occupation}
                                    </p>
                                    <h4 className="text-3xl font-serif text-zinc-900 dark:text-zinc-100 leading-tight">
                                        {active.fullName}
                                    </h4>
                                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                                        {active.location}
                                    </p>
                                </header>

                                <p className="md:hidden text-sm text-zinc-500 dark:text-zinc-500">
                                    {active.location}
                                </p>

                                <ScrollableDescription text={active.description} />

                                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-500 mb-4">
                                        Skills
                                    </p>
                                    <CharacterRadar
                                        axes={SKILL_LABELS.map((label) => ({
                                            label,
                                            value: active.skills[
                                                label.toLowerCase() as keyof CharacterSkills
                                            ],
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function ScrollableDescription({ text }: { text: string }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [showShadow, setShowShadow] = useState(false);

    // biome-ignore lint/correctness/useExhaustiveDependencies: rerun when text changes to recompute overflow
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => {
            const overflows = el.scrollHeight - el.clientHeight > 1;
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
            setShowShadow(overflows && !atBottom);
        };
        update();
        el.addEventListener("scroll", update, { passive: true });
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", update);
            ro.disconnect();
        };
    }, [text]);

    return (
        <div
            ref={ref}
            className={`max-h-64 overflow-y-auto pr-2 -mr-2 text-base text-zinc-700 dark:text-zinc-300 leading-relaxed transition-shadow duration-200 ${
                showShadow
                    ? "shadow-[inset_0_-16px_16px_-16px_rgba(0,0,0,0.18)] dark:shadow-[inset_0_-16px_16px_-16px_rgba(0,0,0,0.7)]"
                    : ""
            }`}
        >
            {text}
        </div>
    );
}
