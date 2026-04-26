"use client";

import { useRouter } from "next/navigation";
import CharacterForm, { type CharacterFormData } from "@/app/components/character-form";
import NavBar from "@/app/components/navbar";
import { createCharacter } from "@/app/lib/api";

export default function NewCharacterPage() {
    const router = useRouter();

    const handleSubmit = async (data: CharacterFormData) => {
        await createCharacter({
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
                        New character
                    </h1>
                </header>
                <CharacterForm
                    onSubmit={handleSubmit}
                    submitLabel="Create"
                    savingLabel="Creating…"
                    cancelHref="/admin/characters"
                />
            </main>
        </div>
    );
}
