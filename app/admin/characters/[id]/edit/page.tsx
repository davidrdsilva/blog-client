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
        <div className="min-h-screen bg-white dark:bg-black">
            <NavBar />
            <main className="container mx-auto px-6 lg:px-10 py-16 lg:py-24 max-w-7xl">
                {error && (
                    <div className="mb-8 text-sm text-red-700 dark:text-red-300 border-l-2 border-red-700 dark:border-red-400 pl-4 py-2">
                        <span className="font-bold uppercase tracking-[0.3em] text-[10px] mr-3">
                            Error
                        </span>
                        <span className="font-serif">{error}</span>
                    </div>
                )}
                {!initial && !error ? (
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">
                        Loading…
                    </p>
                ) : initial ? (
                    <CharacterForm
                        title={
                            initial.fullName
                                ? `Edit · ${initial.shortName || initial.fullName}`
                                : "Edit character"
                        }
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
