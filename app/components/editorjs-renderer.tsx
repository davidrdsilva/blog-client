import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";
import type { EditorJsBlock, EditorJsContent } from "@/app/types/post";
import isLocalUrl from "@/app/utils/is-local-url";

interface EditorJsRendererProps {
    content: EditorJsContent;
}

// Render HTML content safely (Editor.js inline tools produce HTML)
function HtmlContent({
    html,
    className,
    as: Tag = "span",
}: {
    html: string;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
}) {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: the content is sanitized on back-end
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderBlock(block: EditorJsBlock) {
    switch (block.type) {
        case "header": {
            const data = block.data as { text: string; level: number };
            const level = Math.min(Math.max(data.level, 2), 4) as number;
            const className = "mt-8 mb-4 font-bold text-zinc-900 dark:text-zinc-100";
            switch (level) {
                case 2:
                    return (
                        <HtmlContent
                            as="h2"
                            html={data.text}
                            className={`${className} text-3xl md:text-4xl`}
                        />
                    );
                case 3:
                    return (
                        <HtmlContent
                            as="h3"
                            html={data.text}
                            className={`${className} text-2xl md:text-3xl`}
                        />
                    );
                case 4:
                    return (
                        <HtmlContent
                            as="h4"
                            html={data.text}
                            className={`${className} text-xl md:text-2xl`}
                        />
                    );
                default:
                    return null;
            }
        }
        case "paragraph": {
            const data = block.data as { text: string };
            return (
                <HtmlContent
                    as="p"
                    html={data.text}
                    className="mb-4 text-lg md:text-2xl text-zinc-700 dark:text-zinc-300 leading-7 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline"
                />
            );
        }
        case "list": {
            type ListItem = string | { content: string; items?: ListItem[] };
            const data = block.data as { style: string; items: ListItem[] };
            const ListTag = data.style === "ordered" ? "ol" : "ul";
            const className =
                data.style === "ordered"
                    ? "mb-4 ml-6 text-lg md:text-2xl list-decimal space-y-2 text-zinc-700 dark:text-zinc-300"
                    : "mb-4 ml-6 text-lg md:text-2xl list-disc space-y-2 text-zinc-700 dark:text-zinc-300";

            const getItemText = (item: ListItem): string => {
                if (typeof item === "string") return item;
                return item.content;
            };

            return (
                <ListTag className={className}>
                    {data.items.map((item, index) => {
                        const text = getItemText(item);
                        return (
                            <li key={`item-${index}-${text.slice(0, 20)}`}>
                                <HtmlContent as="span" html={text} />
                            </li>
                        );
                    })}
                </ListTag>
            );
        }
        case "quote": {
            const data = block.data as { text: string; caption?: string };
            return (
                <blockquote className="mb-4 pl-4 border-l-4 border-zinc-300 dark:border-zinc-700 italic text-zinc-600 dark:text-zinc-400">
                    <HtmlContent as="p" html={data.text} />
                    {data.caption && (
                        <cite className="block mt-2 text-sm not-italic">— {data.caption}</cite>
                    )}
                </blockquote>
            );
        }
        case "code": {
            const data = block.data as { code: string };
            return (
                <pre className="mb-4 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-x-auto">
                    <code className="text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                        {data.code}
                    </code>
                </pre>
            );
        }
        case "image": {
            const data = block.data as {
                file?: { url: string };
                url?: string;
                caption?: string;
            };
            const imageUrl = data.file?.url || data.url || "";
            return (
                <figure className="mb-4">
                    <div className="relative w-full rounded-lg overflow-hidden">
                        <Image
                            src={imageUrl}
                            alt={data.caption || ""}
                            width={800}
                            height={0}
                            className="w-full h-auto"
                            // sizes="(max-width: 768px) 100vw, 800px"
                            unoptimized={isLocalUrl(imageUrl)}
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

export function EditorJsRenderer({ content }: EditorJsRendererProps) {
    if (!content?.blocks || content.blocks.length === 0) {
        return <p className="text-zinc-500 dark:text-zinc-500">No content available.</p>;
    }

    return (
        <div className="prose prose-zinc dark:prose-invert max-w-none">
            {content.blocks.map((block, index) => (
                <div key={block.id ?? `block-${index}`}>{renderBlock(block)}</div>
            ))}
        </div>
    );
}
