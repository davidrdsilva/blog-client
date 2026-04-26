"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ConfirmModal } from "@/app/components/confirm-modal";
import NavBar from "@/app/components/navbar";
import { deleteCharacter, getCharacters } from "@/app/lib/api";
import type { Character } from "@/app/types/post";

export default function AdminCharactersPage() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<Character | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const rows = await getCharacters();
            setCharacters(rows);
        } catch (err) {
            console.error("Failed to load characters:", err);
            setError(err instanceof Error ? err.message : "Failed to load characters.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async () => {
        if (!pendingDelete) return;
        setIsDeleting(true);
        try {
            await deleteCharacter(pendingDelete.id);
            setPendingDelete(null);
            await load();
        } catch (err) {
            console.error("Failed to delete character:", err);
            setError(err instanceof Error ? err.message : "Failed to delete character.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <NavBar />
            <main className="container mx-auto px-4 py-12 max-w-5xl">
                <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-500 mb-2">
                            Admin
                        </p>
                        <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 dark:text-zinc-100">
                            Cast
                        </h1>
                    </div>
                    <Link
                        href="/admin/characters/new"
                        className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
                    >
                        New character
                    </Link>
                </header>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <p className="text-zinc-500 dark:text-zinc-500">Loading…</p>
                ) : characters.length === 0 ? (
                    <p className="text-zinc-500 dark:text-zinc-500">
                        No characters yet. Create one to get started.
                    </p>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {characters.map((character) => (
                            <li
                                key={character.id}
                                className="flex items-center gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                            >
                                <Image
                                    src={character.portrait}
                                    alt=""
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                                    unoptimized
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                        {character.fullName}
                                    </p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-500 truncate">
                                        {character.occupation} · {character.location}
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Link
                                        href={`/admin/characters/${character.id}/edit`}
                                        className="px-3 py-1 rounded text-sm border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setPendingDelete(character)}
                                        className="px-3 py-1 rounded text-sm border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <ConfirmModal
                isOpen={pendingDelete !== null}
                title="Delete character"
                message={
                    pendingDelete
                        ? `Delete ${pendingDelete.fullName}? They'll be removed from any chapter cast they appear in.`
                        : ""
                }
                confirmLabel={isDeleting ? "Deleting…" : "Delete"}
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => !isDeleting && setPendingDelete(null)}
            />
        </div>
    );
}
