"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { uploadImage } from "@/app/lib/api";
import type { CharacterSkills } from "@/app/types/post";
import isLocalUrl from "@/app/utils/is-local-url";
import CharacterRadar from "./character-radar";

const SKILL_KEYS: (keyof CharacterSkills)[] = [
    "melee",
    "guns",
    "stealth",
    "persuasion",
    "intellect",
    "endurance",
];

const DEFAULT_SKILLS: CharacterSkills = {
    melee: 50,
    guns: 50,
    stealth: 50,
    persuasion: 50,
    intellect: 50,
    endurance: 50,
};

export interface CharacterFormData {
    fullName: string;
    shortName: string;
    description: string;
    occupation: string;
    location: string;
    portrait: string;
    skills: CharacterSkills;
}

interface CharacterFormProps {
    initialData?: CharacterFormData;
    onSubmit: (data: CharacterFormData) => Promise<void>;
    submitLabel: string;
    savingLabel: string;
    cancelHref: string;
    title: string;
    eyebrow?: string;
}

export default function CharacterForm({
    initialData,
    onSubmit,
    submitLabel,
    savingLabel,
    cancelHref,
    title,
    eyebrow = "Admin · Cast",
}: CharacterFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        fullName: initialData?.fullName ?? "",
        shortName: initialData?.shortName ?? "",
        description: initialData?.description ?? "",
        occupation: initialData?.occupation ?? "",
        location: initialData?.location ?? "",
        portrait: initialData?.portrait ?? "",
    });
    const [skills, setSkills] = useState<CharacterSkills>(initialData?.skills ?? DEFAULT_SKILLS);

    const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setErrorMessage("");
        try {
            const url = await uploadImage(file);
            setFormData((prev) => ({ ...prev, portrait: url }));
        } catch (error) {
            console.error("Error uploading portrait:", error);
            setErrorMessage(error instanceof Error ? error.message : "Error uploading portrait.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemovePortrait = () => {
        setFormData((prev) => ({ ...prev, portrait: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerPortraitPicker = () => {
        fileInputRef.current?.click();
    };

    const handleSkillChange = (key: keyof CharacterSkills, value: number) => {
        setSkills((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        if (!formData.portrait) {
            setErrorMessage("A portrait is required before this character can be saved.");
            return;
        }
        setIsSaving(true);
        try {
            await onSubmit({
                fullName: formData.fullName.trim(),
                shortName: formData.shortName.trim(),
                description: formData.description.trim(),
                occupation: formData.occupation.trim(),
                location: formData.location.trim(),
                portrait: formData.portrait,
                skills,
            });
        } catch (error) {
            console.error("Failed to save character:", error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to save character.");
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass =
        "w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-700 px-0 py-3 text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors";
    const fieldLabelClass =
        "block text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500 mb-1";

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-20"
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePortraitUpload}
                disabled={isUploading}
                className="hidden"
            />

            <aside className="lg:sticky lg:top-12 lg:self-start space-y-8">
                <header className="space-y-3 animate-[fade-up_0.6s_ease-out_both]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500 dark:text-zinc-500">
                        {eyebrow}
                    </p>
                    <h1 className="font-serif text-4xl md:text-5xl text-zinc-900 dark:text-zinc-100 leading-[1.05] tracking-tight">
                        {title}
                    </h1>
                </header>

                <PreviewCard
                    portrait={formData.portrait}
                    fullName={formData.fullName}
                    occupation={formData.occupation}
                    location={formData.location}
                    isUploading={isUploading}
                    onPick={triggerPortraitPicker}
                    onRemove={handleRemovePortrait}
                />

                <div className="space-y-3 animate-[fade-up_0.6s_ease-out_0.3s_both]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                        Aptitude profile
                    </p>
                    <div className="-mx-2">
                        <CharacterRadar
                            axes={SKILL_KEYS.map((key) => ({
                                label: key.toUpperCase(),
                                value: skills[key],
                            }))}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Link
                        href={cancelHref}
                        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        ← Back to roster
                    </Link>
                </div>
            </aside>
            <div className="space-y-16">
                {errorMessage && (
                    <div className="flex items-start gap-3 text-sm text-red-700 dark:text-red-300 border-l-2 border-red-700 dark:border-red-400 pl-4 py-2 animate-[fade-up_0.3s_ease-out_both]">
                        <span className="font-bold uppercase tracking-[0.3em] text-[10px] mt-0.5">
                            Error
                        </span>
                        <span className="font-serif">{errorMessage}</span>
                    </div>
                )}

                <Section number="01" label="Identity">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        <div className="md:col-span-2">
                            <label htmlFor="fullName" className={fieldLabelClass}>
                                Full name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                required
                                maxLength={120}
                                placeholder="—"
                                autoComplete="off"
                                value={formData.fullName}
                                onChange={(e) =>
                                    setFormData({ ...formData, fullName: e.target.value })
                                }
                                className={`${inputClass} font-serif text-2xl md:text-3xl`}
                            />
                        </div>
                        <div>
                            <label htmlFor="shortName" className={fieldLabelClass}>
                                Short name
                            </label>
                            <input
                                id="shortName"
                                type="text"
                                required
                                maxLength={60}
                                placeholder="What people call them"
                                autoComplete="off"
                                value={formData.shortName}
                                onChange={(e) =>
                                    setFormData({ ...formData, shortName: e.target.value })
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label htmlFor="occupation" className={fieldLabelClass}>
                                Occupation
                            </label>
                            <input
                                id="occupation"
                                type="text"
                                required
                                maxLength={120}
                                placeholder="Trade, role, calling"
                                autoComplete="off"
                                value={formData.occupation}
                                onChange={(e) =>
                                    setFormData({ ...formData, occupation: e.target.value })
                                }
                                className={inputClass}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="location" className={fieldLabelClass}>
                                Location
                            </label>
                            <input
                                id="location"
                                type="text"
                                required
                                maxLength={160}
                                placeholder="Where they reside"
                                autoComplete="off"
                                value={formData.location}
                                onChange={(e) =>
                                    setFormData({ ...formData, location: e.target.value })
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>
                </Section>

                <Section number="02" label="Biography">
                    <label htmlFor="description" className={fieldLabelClass}>
                        Description
                    </label>
                    <textarea
                        id="description"
                        required
                        rows={6}
                        placeholder="A few sentences. Voice, history, the shape of their silences."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`${inputClass} resize-none text-lg leading-relaxed`}
                    />
                </Section>

                <Section number="03" label="Aptitudes">
                    <div className="space-y-1">
                        {SKILL_KEYS.map((key) => (
                            <SkillSlider
                                key={key}
                                name={key}
                                value={skills[key]}
                                onChange={(v) => handleSkillChange(key, v)}
                            />
                        ))}
                    </div>
                </Section>

                <footer className="flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 pt-10 border-t border-zinc-200 dark:border-zinc-800">
                    <Link
                        href={cancelHref}
                        className="text-center sm:text-left px-6 py-3 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        Discard
                    </Link>
                    <button
                        type="submit"
                        disabled={isSaving || isUploading}
                        className="group relative px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-[0.4em] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-zinc-800 dark:hover:bg-white cursor-pointer"
                    >
                        <span className="relative z-10">
                            {isSaving ? savingLabel : submitLabel}
                        </span>
                    </button>
                </footer>
            </div>
        </form>
    );
}

function Section({
    number,
    label,
    children,
}: {
    number: string;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-8 animate-[fade-up_0.6s_ease-out_both]">
            <header className="flex items-baseline gap-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <span
                    className="font-serif text-5xl md:text-6xl text-zinc-300 dark:text-zinc-700 leading-none tabular-nums"
                    aria-hidden="true"
                >
                    {number}
                </span>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-700 dark:text-zinc-300">
                    {label}
                </h2>
            </header>
            {children}
        </section>
    );
}

function PreviewCard({
    portrait,
    fullName,
    occupation,
    location,
    isUploading,
    onPick,
    onRemove,
}: {
    portrait: string;
    fullName: string;
    occupation: string;
    location: string;
    isUploading: boolean;
    onPick: () => void;
    onRemove: () => void;
}) {
    return (
        <div className="space-y-4 animate-[fade-up_0.6s_ease-out_0.15s_both]">
            <button
                type="button"
                onClick={onPick}
                aria-label={portrait ? "Replace portrait" : "Upload portrait"}
                className="relative block w-full aspect-4/5 overflow-hidden bg-zinc-100 dark:bg-zinc-900 group focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 cursor-pointer"
            >
                {portrait ? (
                    <Image
                        src={portrait}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        unoptimized={isLocalUrl(portrait)}
                    />
                ) : (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                        <span className="w-14 h-14 border border-current rounded-full flex items-center justify-center text-2xl font-serif">
                            +
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                            Add portrait
                        </span>
                    </span>
                )}

                {portrait && (
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent"
                    />
                )}

                {portrait && (
                    <span className="absolute inset-x-0 bottom-0 p-6 text-white">
                        {fullName ? (
                            <span className="block font-serif text-3xl md:text-4xl leading-[1.05] tracking-tight">
                                {fullName}
                            </span>
                        ) : (
                            <span className="block font-serif italic text-3xl md:text-4xl text-white/40">
                                Untitled
                            </span>
                        )}
                        {occupation && (
                            <span className="mt-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-white/80">
                                {occupation}
                            </span>
                        )}
                    </span>
                )}

                {isUploading && (
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-[0.4em]"
                    >
                        Uploading…
                    </span>
                )}

                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-zinc-900/5 dark:ring-zinc-100/5"
                />
            </button>

            <div className="flex items-baseline justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                <span>{location || "Location unset"}</span>
                {portrait ? (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                    >
                        Replace
                    </button>
                ) : (
                    <span className="text-zinc-400 dark:text-zinc-600">Click image to upload</span>
                )}
            </div>
        </div>
    );
}

// ─── Custom skill slider — ledger row, click/drag/keyboard ───────────────────
function SkillSlider({
    name,
    value,
    onChange,
}: {
    name: string;
    value: number;
    onChange: (next: number) => void;
}) {
    const trackRef = useRef<HTMLButtonElement>(null);

    const setFromPointer = (clientX: number) => {
        const track = trackRef.current;
        if (!track) return;
        const rect = track.getBoundingClientRect();
        const ratio = (clientX - rect.left) / rect.width;
        onChange(Math.round(Math.max(0, Math.min(1, ratio)) * 100));
    };

    const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromPointer(e.clientX);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (e.buttons !== 1) return;
        setFromPointer(e.clientX);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        let next = value;
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(0, value - 1);
        else if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(100, value + 1);
        else if (e.key === "PageDown") next = Math.max(0, value - 10);
        else if (e.key === "PageUp") next = Math.min(100, value + 10);
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = 100;
        else return;
        e.preventDefault();
        onChange(next);
    };

    return (
        <div className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-6 py-4 border-b border-zinc-200/70 dark:border-zinc-800/70 last:border-b-0 group">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700 dark:text-zinc-300 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">
                {name}
            </span>
            <button
                ref={trackRef}
                type="button"
                role="slider"
                aria-label={`${name} skill`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value}
                aria-valuetext={String(value)}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onKeyDown={onKeyDown}
                className="relative h-6 w-full focus:outline-none touch-none cursor-pointer"
            >
                <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-300 dark:bg-zinc-700"
                />
                <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-zinc-900 dark:bg-zinc-100 transition-[width] duration-150 ease-out"
                    style={{ width: `${value}%` }}
                />
                <span
                    aria-hidden="true"
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-zinc-900 dark:bg-zinc-100 rounded-full transition-[left] duration-150 ease-out group-hover:scale-125 group-focus-within:scale-150"
                    style={{ left: `${value}%` }}
                />
            </button>
            <span className="font-serif text-3xl md:text-4xl tabular-nums text-zinc-900 dark:text-zinc-100 leading-none min-w-[3ch] text-right">
                {String(value).padStart(2, "0")}
            </span>
        </div>
    );
}
