"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { uploadImage } from "@/app/lib/api";
import type { CharacterSkills } from "@/app/types/post";
import isLocalUrl from "@/app/utils/is-local-url";

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
}

export default function CharacterForm({
    initialData,
    onSubmit,
    submitLabel,
    savingLabel,
    cancelHref,
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

    const handleSkillChange = (key: keyof CharacterSkills, value: number) => {
        setSkills((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        if (!formData.portrait) {
            setErrorMessage("Please upload a portrait image.");
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
        "w-full px-4 py-2 text-lg rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400";
    const labelClass = "block mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-100";

    return (
        <form onSubmit={handleSubmit} className="mx-auto space-y-6">
            {errorMessage && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                    {errorMessage}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="fullName" className={labelClass}>
                        Full name
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        required
                        maxLength={120}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="shortName" className={labelClass}>
                        Short name
                    </label>
                    <input
                        id="shortName"
                        type="text"
                        required
                        maxLength={60}
                        value={formData.shortName}
                        onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="occupation" className={labelClass}>
                        Occupation
                    </label>
                    <input
                        id="occupation"
                        type="text"
                        required
                        maxLength={120}
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="location" className={labelClass}>
                        Location
                    </label>
                    <input
                        id="location"
                        type="text"
                        required
                        maxLength={160}
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className={inputClass}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="description" className={labelClass}>
                    Description
                </label>
                <textarea
                    id="description"
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${inputClass} resize-none`}
                />
            </div>

            <div>
                <label htmlFor="portrait" className={labelClass}>
                    Portrait
                </label>
                {formData.portrait ? (
                    <div className="space-y-3">
                        <div className="relative w-48 aspect-square rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
                            <Image
                                src={formData.portrait}
                                alt="Portrait preview"
                                fill
                                className="object-cover"
                                sizes="192px"
                                unoptimized={isLocalUrl(formData.portrait)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleRemovePortrait}
                            className="text-sm text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                        >
                            Remove portrait
                        </button>
                    </div>
                ) : (
                    <input
                        ref={fileInputRef}
                        id="portrait"
                        type="file"
                        accept="image/*"
                        onChange={handlePortraitUpload}
                        disabled={isUploading}
                        className="block w-full text-zinc-700 dark:text-zinc-300"
                    />
                )}
                {isUploading && (
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">Uploading…</p>
                )}
            </div>

            <fieldset>
                <legend className={labelClass}>Skills</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SKILL_KEYS.map((key) => (
                        <div key={key} className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label
                                    htmlFor={`skill-${key}`}
                                    className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-700 dark:text-zinc-300"
                                >
                                    {key}
                                </label>
                                <span className="text-sm font-mono text-zinc-500 dark:text-zinc-500">
                                    {skills[key]}
                                </span>
                            </div>
                            <input
                                id={`skill-${key}`}
                                type="range"
                                min={0}
                                max={100}
                                value={skills[key]}
                                onChange={(e) => handleSkillChange(key, Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    ))}
                </div>
            </fieldset>

            <div className="flex flex-wrap gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="px-6 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isSaving ? savingLabel : submitLabel}
                </button>
                <Link
                    href={cancelHref}
                    className="px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-widest text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
