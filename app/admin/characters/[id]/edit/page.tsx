"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CharacterForm, { type CharacterFormData } from "@/app/components/character-form";
import NavBar from "@/app/components/navbar";
import { getCharacter, updateCharacter } from "@/app/lib/api";

export default function EditCharacterPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const id = params.id;
    const [initial, setInitial] = useState<CharacterFormData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        (async () => {
            try {
                const character = await getCharacter(id);
                if (cancelled) return;
                setInitial({
                    fullName: character.fullName,
                    shortName: character.shortName,
                    description: character.description,
                    occupation: character.occupation,
                    location: character.location,
                    portrait: character.portrait,
                    skills: character.skills,
                });
            } catch (err) {
                console.error("Failed to load character:", err);
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load character.");
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleSubmit = async (data: CharacterFormData) => {
        await updateCharacter(id, {
            full_name: data.fullName,
            short_name: data.shortName,
            description: data.description,
            occupation: data.occupation,
            location: data.location,
            portrait: data.portrait,
            skills: data.skills,
        });
        router.push("/admin/characters");
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <NavBar />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <header className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-500 mb-2">
                        Admin · Cast
                    </p>
                    <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 dark:text-zinc-100">
                        Edit character
                    </h1>
                </header>
                {error && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                        {error}
                    </div>
                )}
                {!initial && !error ? (
                    <p className="text-zinc-500 dark:text-zinc-500">Loading…</p>
                ) : initial ? (
                    <CharacterForm
                        initialData={initial}
                        onSubmit={handleSubmit}
                        submitLabel="Save changes"
                        savingLabel="Saving…"
                        cancelHref="/admin/characters"
                    />
                ) : null}
            </main>
        </div>
    );
}
