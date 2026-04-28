"use client";

import type EditorJSType from "@editorjs/editorjs";
import type { ToolConstructable } from "@editorjs/editorjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CharacterPicker from "@/app/components/character-picker";
import PostPreviewSidebar from "@/app/components/post-preview-sidebar";
import TagsInput from "@/app/components/tags-input";
import { FETCH_URL_ENDPOINT, getCategories, UPLOAD_ENDPOINT } from "@/app/lib/api";
import type { Category, EditorJsContent } from "@/app/types/post";
import isLocalUrl from "@/app/utils/is-local-url";

const WHITENEST_CATEGORY_NAME = "Whitenest";
const DESCRIPTION_LIMIT = 100;

export interface PostFormData {
    title: string;
    subtitle?: string;
    description: string;
    image: string;
    content: EditorJsContent;
    date?: string;
    categoryId: number;
    tags: string[];

    // Cast for Whitenest chapters; empty/ignored on other categories.
    characterIds: string[];
}

interface PostFormProps {
    initialData?: {
        title: string;
        subtitle?: string;
        description: string;
        image: string;
        content?: EditorJsContent;
        date?: string;
        categoryId?: number;
        tags?: string[];
        characterIds?: string[];
    };
    onSubmit: (data: PostFormData, opts: { asDraft: boolean }) => Promise<void>;
    submitLabel: string;
    savingLabel: string;
    cancelHref: string;
    title: string;
    eyebrow?: string;
    headerExtra?: React.ReactNode;
}

export default function PostForm({
    initialData,
    onSubmit,
    submitLabel,
    savingLabel,
    title,
    eyebrow = "Admin · Posts",
    headerExtra,
}: PostFormProps) {
    const editorRef = useRef<EditorJSType | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState<EditorJsContent | null>(
        initialData?.content ?? null
    );
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        subtitle: initialData?.subtitle || "",
        description: initialData?.description || "",
        image: initialData?.image || "",
        date: initialData?.date || "",
    });
    const [categoryId, setCategoryId] = useState<number | "">(initialData?.categoryId ?? "");
    const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
    const [characterIds, setCharacterIds] = useState<string[]>(initialData?.characterIds ?? []);
    const [categories, setCategories] = useState<Category[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Admin form needs to see internal categories (e.g. Drafts) so the
        // editor can save work-in-progress without publishing.
        getCategories(undefined, { includeInternal: true })
            .then(setCategories)
            .catch(() => setCategories([]));
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setErrorMessage("");

        try {
            const uploadData = new FormData();
            uploadData.append("file", file);

            const response = await fetch(UPLOAD_ENDPOINT, {
                method: "POST",
                body: uploadData,
            });

            const result = await response.json();

            if (result.success === 1 && result.file?.url) {
                setFormData((prev) => ({ ...prev, image: result.file.url }));
            } else if (result.error) {
                setErrorMessage(result.error.message);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            setErrorMessage("Error uploading image. Just try again, will you?");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, image: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerImagePicker = () => {
        fileInputRef.current?.click();
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 4) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        } else if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        setFormData((prev) => ({ ...prev, date: value }));
    };

    // Editor.js owns its own DOM once instantiated. In Strict Mode the effect
    // mounts → unmounts → re-mounts; the cancelled flag bails out of the first
    // run if it loses the race, and the destroy() awaits isReady so a tear-down
    // never collides with internal init.
    // biome-ignore lint/correctness/useExhaustiveDependencies: initialData.content seeds the editor exactly once on mount; re-running would tear down user edits
    useEffect(() => {
        let cancelled = false;
        let localEditor: EditorJSType | null = null;

        const initEditor = async () => {
            const [
                { default: EditorJS },
                { default: Header },
                { default: Paragraph },
                { default: ImageTool },
                { default: List },
                { default: Quote },
                { default: CodeTool },
                { default: LinkTool },
                { default: VideoTool },
            ] = await Promise.all([
                import("@editorjs/editorjs"),
                import("@editorjs/header"),
                import("@editorjs/paragraph"),
                import("@editorjs/image"),
                import("@editorjs/list"),
                import("@editorjs/quote"),
                import("@editorjs/code"),
                import("@editorjs/link"),
                import("@/app/components/editorjs-video-tool"),
            ]);

            if (cancelled) return;

            localEditor = new EditorJS({
                holder: "editorjs",
                placeholder: "Begin the article…",
                data: initialData?.content,
                tools: {
                    header: {
                        class: Header as unknown as ToolConstructable,
                        config: {
                            placeholder: "Section heading",
                            levels: [2, 3, 4],
                            defaultLevel: 2,
                        },
                    },
                    paragraph: {
                        class: Paragraph as unknown as ToolConstructable,
                        inlineToolbar: true,
                    },
                    image: {
                        class: ImageTool as unknown as ToolConstructable,
                        config: {
                            endpoints: { byFile: UPLOAD_ENDPOINT, byUrl: UPLOAD_ENDPOINT },
                            field: "file",
                            types: "image/*",
                            captionPlaceholder: "Image caption",
                        },
                    },
                    list: {
                        class: List as unknown as ToolConstructable,
                        inlineToolbar: true,
                    },
                    quote: {
                        class: Quote as unknown as ToolConstructable,
                        inlineToolbar: true,
                    },
                    code: {
                        class: CodeTool as unknown as ToolConstructable,
                        config: { placeholder: "Enter code" },
                    },
                    linkTool: {
                        class: LinkTool as unknown as ToolConstructable,
                        config: { endpoint: FETCH_URL_ENDPOINT },
                    },
                    video: {
                        class: VideoTool as unknown as ToolConstructable,
                        config: {
                            endpoint: UPLOAD_ENDPOINT,
                            field: "file",
                            types: "video/mp4,video/webm,video/ogg,video/quicktime",
                            captionPlaceholder: "Video caption",
                        },
                    },
                },
                onReady: () => {
                    if (cancelled) return;
                    setIsReady(true);
                },
                onChange: async (api) => {
                    const data = await api.saver.save();
                    setPreviewContent(data as EditorJsContent);
                },
            });

            editorRef.current = localEditor;
        };

        initEditor();

        return () => {
            cancelled = true;
            const editor = localEditor;
            if (!editor) return;
            editorRef.current = null;
            editor.isReady
                .then(() => editor.destroy?.())
                .catch(() => {
                    // EditorJS rejects isReady when destroyed mid-init; safe to ignore.
                });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const isWhitenest = selectedCategory?.name === WHITENEST_CATEGORY_NAME;
    const isDraftCategory = selectedCategory?.isInternal === true;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editorRef.current || !isReady) return;
        if (categoryId === "") {
            setErrorMessage("Please select a category before publishing.");
            return;
        }
        // Drafts can be saved without a featured image; published posts can't.
        if (!isDraftCategory && !formData.image) {
            setErrorMessage("A featured image is required to publish.");
            return;
        }

        setIsSaving(true);
        try {
            const outputData = await editorRef.current.save();
            await onSubmit(
                {
                    ...formData,
                    content: outputData as EditorJsContent,
                    categoryId: Number(categoryId),
                    tags,
                    characterIds,
                },
                { asDraft: isDraftCategory }
            );
        } catch (error) {
            console.error("Failed to save post:", error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to save post.");
        } finally {
            setIsSaving(false);
        }
    };
    const descriptionRemaining = DESCRIPTION_LIMIT - formData.description.length;

    const inputClass =
        "w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-700 px-0 py-3 text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors";
    const fieldLabelClass =
        "block text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500 mb-1";
    // Shared box for footer actions: identical padding + a 1px border (transparent
    // when the variant has no visible border) so all three buttons share the same
    // computed height. Hierarchy comes from fill, never from size.
    const footerBtnBase =
        "inline-flex items-center justify-center px-8 py-4 border text-[10px] font-bold uppercase tracking-[0.4em] transition-colors";

    return (
        <form onSubmit={handleSubmit} className="space-y-12 lg:space-y-16">
            <header className="space-y-2 lg:space-y-3 animate-[fade-up_0.6s_ease-out_both]">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 lg:space-y-3 min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500 dark:text-zinc-500">
                            {eyebrow}
                        </p>
                        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-zinc-900 dark:text-zinc-100 leading-[1.05] tracking-tight">
                            {title}
                        </h1>
                    </div>
                    {headerExtra && <div className="shrink-0 pt-1">{headerExtra}</div>}
                </div>
            </header>

            {errorMessage && (
                <div className="flex items-start gap-3 text-sm text-red-700 dark:text-red-300 border-l-2 border-red-700 dark:border-red-400 pl-4 py-2 animate-[fade-up_0.3s_ease-out_both]">
                    <span className="font-bold uppercase tracking-[0.3em] text-[10px] mt-0.5">
                        Error
                    </span>
                    <span className="font-serif">{errorMessage}</span>
                </div>
            )}

            <Section number="01" label="Masthead">
                <div className="space-y-8">
                    <div>
                        <label htmlFor="title" className={fieldLabelClass}>
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            required
                            placeholder="—"
                            autoComplete="off"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={`${inputClass} font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.1] py-4`}
                        />
                    </div>
                    <div>
                        <label htmlFor="subtitle" className={fieldLabelClass}>
                            Subtitle{" "}
                            <span className="text-zinc-400 dark:text-zinc-600">/ Optional</span>
                        </label>
                        <input
                            id="subtitle"
                            type="text"
                            placeholder="A second line, the kind that appears beneath the headline"
                            autoComplete="off"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            className={`${inputClass} text-xl sm:text-2xl`}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                        <div>
                            <label htmlFor="date" className={fieldLabelClass}>
                                Date{" "}
                                <span className="text-zinc-400 dark:text-zinc-600">/ Optional</span>
                            </label>
                            <input
                                id="date"
                                type="text"
                                inputMode="numeric"
                                placeholder="DD / MM / YYYY"
                                autoComplete="off"
                                value={formData.date}
                                onChange={handleDateChange}
                                className={`${inputClass} tabular-nums`}
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className={fieldLabelClass}>
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    id="category"
                                    required
                                    value={categoryId === "" ? "" : String(categoryId)}
                                    onChange={(e) =>
                                        setCategoryId(e.target.value ? Number(e.target.value) : "")
                                    }
                                    className={`${inputClass} appearance-none pr-8 cursor-pointer`}
                                >
                                    <option value="">Select…</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.isInternal ? `· ${c.name}` : c.name}
                                        </option>
                                    ))}
                                </select>
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"
                                >
                                    ▾
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            <Section number="02" label="Classification">
                <div className="space-y-8">
                    <div>
                        <p className={fieldLabelClass}>
                            Tags{" "}
                            <span className="text-zinc-400 dark:text-zinc-600">/ Optional</span>
                        </p>
                        <TagsInput
                            value={tags}
                            onChange={setTags}
                            placeholder="Press Enter or comma to add"
                        />
                    </div>
                    {isWhitenest && (
                        <div>
                            <p className={fieldLabelClass}>
                                Cast{" "}
                                <span className="text-zinc-400 dark:text-zinc-600">
                                    / Whitenest only
                                </span>
                            </p>
                            <CharacterPicker
                                value={characterIds}
                                onChange={setCharacterIds}
                                placeholder="Search characters by name"
                            />
                        </div>
                    )}
                </div>
            </Section>

            <Section number="03" label="Standfirst">
                <div>
                    <div className="flex items-baseline justify-between mb-1">
                        <label htmlFor="description" className={fieldLabelClass}>
                            One-line summary
                        </label>
                        <span
                            className={`text-[10px] font-bold uppercase tracking-[0.3em] tabular-nums ${
                                descriptionRemaining < 0
                                    ? "text-red-600 dark:text-red-400"
                                    : descriptionRemaining < 20
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-zinc-500 dark:text-zinc-500"
                            }`}
                        >
                            {formData.description.length} / {DESCRIPTION_LIMIT}
                        </span>
                    </div>
                    <textarea
                        id="description"
                        required
                        rows={3}
                        maxLength={DESCRIPTION_LIMIT}
                        placeholder="The standfirst — what this article is about, in a sentence."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`${inputClass} resize-none font-serif text-lg leading-relaxed`}
                    />
                </div>
            </Section>

            <Section number="04" label="Visual">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={triggerImagePicker}
                    aria-label={formData.image ? "Replace featured image" : "Upload featured image"}
                    className="group relative block w-full aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 cursor-pointer"
                >
                    {formData.image ? (
                        <Image
                            src={formData.image}
                            alt="Featured"
                            fill
                            sizes="(max-width: 768px) 100vw, 800px"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                            unoptimized={isLocalUrl(formData.image)}
                        />
                    ) : (
                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                            <span className="w-14 h-14 border border-current rounded-full flex items-center justify-center text-2xl font-serif">
                                +
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                                Add featured image
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                                JPEG · PNG · GIF · WebP
                            </span>
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
                <div className="mt-3 flex items-baseline justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                    <span>{formData.image ? "Featured image set" : "No image yet"}</span>
                    {formData.image ? (
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                            Remove
                        </button>
                    ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">
                            Click panel to upload
                        </span>
                    )}
                </div>
                <input
                    type="hidden"
                    name="image"
                    value={formData.image}
                    required={!isDraftCategory}
                />
            </Section>

            <Section number="05" label="Body">
                <div
                    id="editorjs"
                    className="min-h-[400px] -mx-2 px-2 text-lg md:text-xl leading-relaxed text-zinc-900 dark:text-zinc-100"
                />
                {!isReady && (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                        Loading editor…
                    </p>
                )}
            </Section>

            <footer className="flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 pt-10 border-t border-zinc-200 dark:border-zinc-800">
                <Link
                    href="/posts/new"
                    className={`${footerBtnBase} border-red-700/70 dark:border-red-400/60 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-700 dark:hover:border-red-400`}
                >
                    Discard
                </Link>
                <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className={`${footerBtnBase} border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer`}
                >
                    Preview
                </button>
                <button
                    type="submit"
                    disabled={!isReady || isSaving || isUploading}
                    className={`${footerBtnBase} border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 hover:border-zinc-800 dark:hover:bg-white dark:hover:border-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                >
                    {isDraftCategory
                        ? isSaving
                            ? "Saving draft…"
                            : "Save draft"
                        : isSaving
                          ? savingLabel
                          : submitLabel}
                </button>
            </footer>

            <PostPreviewSidebar
                content={previewContent}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
            />
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
        <section className="space-y-6 md:space-y-8 animate-[fade-up_0.6s_ease-out_both]">
            <header className="flex items-baseline gap-4 md:gap-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <span
                    className="font-serif text-4xl sm:text-5xl md:text-6xl text-zinc-300 dark:text-zinc-700 leading-none tabular-nums"
                    aria-hidden="true"
                >
                    {number}
                </span>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] sm:tracking-[0.5em] text-zinc-700 dark:text-zinc-300">
                    {label}
                </h2>
            </header>
            {children}
        </section>
    );
}
