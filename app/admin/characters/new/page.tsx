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
        <div className="min-h-screen bg-white dark:bg-black">
            <NavBar />
            <main className="container mx-auto px-5 sm:px-6 lg:px-10 py-10 lg:py-24 max-w-7xl">
                <CharacterForm
                    title="New character"
                    onSubmit={handleSubmit}
                    submitLabel="Commit to roster"
                    savingLabel="Committing…"
                    cancelHref="/admin/characters"
                />
            </main>
        </div>
    );
}
