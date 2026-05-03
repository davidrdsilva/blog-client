import Link from "next/link";
import type { ReactNode } from "react";
import { GalleryImage } from "@/app/components/image-gallery";
import type { EditorJsBlock, EditorJsContent } from "@/app/types/post";

type EditorJsVariant = "article" | "whitenest";

interface EditorJsRendererProps {
    content: EditorJsContent;
    variant?: EditorJsVariant;
}

const TEXT_BLOCK_TYPES = new Set(["header", "paragraph", "list", "quote", "code"]);

function escAttr(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escText(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Editor.js inline tools (bold, italic, link, marker) emit HTML; embed it raw.
// Block tools (code) emit plain text; escape it.
function blockToHtml(block: EditorJsBlock, variant: EditorJsVariant): string | null {
    switch (block.type) {
        case "header": {
            const data = block.data as { text: string; level: number };
            const level = Math.min(Math.max(data.level, 2), 4);
            const base = "mt-8 mb-4 text-zinc-900 dark:text-zinc-100";
            let cls: string;
            if (level === 2) {
                cls =
                    variant === "whitenest"
                        ? `${base} font-serif text-3xl md:text-4xl uppercase text-center`
                        : `${base} font-serif text-3xl md:text-4xl uppercase`;
            } else if (level === 3) {
                cls = `${base} font-serif text-2xl md:text-3xl uppercase`;
            } else {
                cls =
                    variant === "whitenest"
                        ? "text-xl md:text-2xl uppercase font-bold text-right"
                        : "font-serif text-xl md:text-2xl uppercase";
            }
            return `<h${level} class="${escAttr(cls)}">${data.text}</h${level}>`;
        }
        case "paragraph": {
            const data = block.data as { text: string };
            const spacing = variant === "whitenest" ? "indent-8 mb-1" : "mb-4";
            const cls = `${spacing} text-xl md:text-2xl text-zinc-700 dark:text-zinc-300 leading-normal [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline`;
            return `<p class="${escAttr(cls)}">${data.text}</p>`;
        }
        case "list": {
            type ListItem = string | { content: string; items?: ListItem[] };
            const data = block.data as { style: string; items: ListItem[] };
            const tag = data.style === "ordered" ? "ol" : "ul";
            const cls =
                data.style === "ordered"
                    ? "mb-4 ml-6 text-xl md:text-2xl leading-normal list-decimal space-y-2 text-zinc-700 dark:text-zinc-300"
                    : "mb-4 ml-6 text-xl md:text-2xl leading-normal list-disc space-y-2 text-zinc-700 dark:text-zinc-300";
            const items = data.items
                .map((item) => {
                    const text = typeof item === "string" ? item : item.content;
                    return `<li><span>${text}</span></li>`;
                })
                .join("");
            return `<${tag} class="${escAttr(cls)}">${items}</${tag}>`;
        }
        case "quote": {
            const data = block.data as { text: string; caption?: string };
            const inner = `<div class="font-serif text-2xl md:text-4xl text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight"><p>${data.text}</p></div>`;
            const caption = data.caption
                ? `<cite class="block font-bold uppercase tracking-widest text-xs text-zinc-500 dark:text-zinc-400 not-italic mt-4">— ${escText(data.caption)}</cite>`
                : "";
            const wrapperCls = "my-10 pl-6 md:pl-8 border-l-[3px] border-black dark:border-white";
            return `<blockquote class="${escAttr(wrapperCls)}">${inner}${caption}</blockquote>`;
        }
        case "code": {
            const data = block.data as { code: string };
            const preCls = "mb-4 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-x-auto";
            const codeCls = "text-sm text-zinc-900 dark:text-zinc-100 font-mono";
            return `<pre class="${escAttr(preCls)}"><code class="${escAttr(codeCls)}">${escText(data.code)}</code></pre>`;
        }
        default:
            return null;
    }
}

function renderMediaBlock(block: EditorJsBlock): ReactNode {
    switch (block.type) {
        case "image": {
            const data = block.data as {
                file?: { url: string };
                url?: string;
                caption?: string;
            };
            const imageUrl = data.file?.url || data.url || "";
            return (
                <figure className="mb-4">
                    <div className="relative w-fit mx-auto flex justify-center rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <GalleryImage
                            src={imageUrl}
                            alt={data.caption || ""}
                            width={0}
                            height={0}
                            className="max-w-full max-h-[500px] object-contain"
                            sizes="(max-width: 768px) 100vw, 800px"
                            style={{ width: "auto", height: "auto" }}
                        />
                        <div className="absolute bottom-0 left-0 w-full pl-2 bg-zinc-900/50 text-sm text-white py-2">
                            <Link href={imageUrl} target="_blank" rel="noopener noreferrer">
                                See image in full size
                            </Link>
                        </div>
                    </div>
                    {data.caption && (
                        <figcaption className="mt-2 text-center text-zinc-500 dark:text-zinc-500">
                            {data.caption}
                        </figcaption>
                    )}
                </figure>
            );
        }
        case "video": {
            const data = block.data as { file?: { url: string }; caption?: string };
            const videoUrl = data.file?.url ?? "";
            if (!videoUrl) return null;
            return (
                <figure className="mb-4">
                    <video
                        src={videoUrl}
                        controls
                        preload="metadata"
                        className="w-full rounded-lg max-h-[500px] bg-zinc-100 dark:bg-zinc-900"
                    >
                        <track kind="captions" />
                    </video>
                    {data.caption && (
                        <figcaption className="mt-2 text-center text-zinc-500 dark:text-zinc-500">
                            {data.caption}
                        </figcaption>
                    )}
                </figure>
            );
        }
        case "linkTool": {
            const data = block.data as {
                link: string;
                meta?: { title?: string; description?: string; image?: { url: string } };
            };
            return (
                <div className="mb-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <a
                        href={data.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {data.meta?.title || data.link}
                    </a>
                    {data.meta?.description && (
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            {data.meta.description}
                        </p>
                    )}
                </div>
            );
        }
        default:
            return null;
    }
}

type Run =
    | { kind: "html"; html: string; key: string }
    | { kind: "node"; node: ReactNode; key: string };

// Long chapters (~400+ blocks) caused hydration mismatches because the RSC
// payload couldn't stay in sync with the streamed HTML at that tree size.
// Collapsing consecutive text-only blocks into a single dangerouslySetInnerHTML
// string keeps the RSC tree small while preserving rendering.
function buildRuns(blocks: EditorJsBlock[], variant: EditorJsVariant): Run[] {
    const runs: Run[] = [];
    let buffer: string[] = [];
    let chunkIndex = 0;

    const flushText = () => {
        if (buffer.length === 0) return;
        const html = buffer.map((b) => `<div>${b}</div>`).join("");
        runs.push({ kind: "html", html, key: `text-${chunkIndex++}` });
        buffer = [];
    };

    for (const block of blocks) {
        if (TEXT_BLOCK_TYPES.has(block.type)) {
            const html = blockToHtml(block, variant);
            if (html !== null) {
                buffer.push(html);
                continue;
            }
        }
        flushText();
        runs.push({
            kind: "node",
            node: renderMediaBlock(block),
            key: block.id ?? `m-${chunkIndex++}`,
        });
    }
    flushText();
    return runs;
}

export function EditorJsRenderer({ content, variant = "article" }: EditorJsRendererProps) {
    if (!content?.blocks || content.blocks.length === 0) {
        return <p className="text-zinc-500 dark:text-zinc-500">No content available.</p>;
    }

    const runs = buildRuns(content.blocks, variant);

    return (
        <div className="prose prose-zinc dark:prose-invert max-w-none">
            {runs.map((run) =>
                run.kind === "html" ? (
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: server-composed prose chunk; inline content is sanitized on back-end
                    <div key={run.key} dangerouslySetInnerHTML={{ __html: run.html }} />
                ) : (
                    <div key={run.key}>{run.node}</div>
                )
            )}
        </div>
    );
}
