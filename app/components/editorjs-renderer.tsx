import Image from "next/image";
import type { EditorJsBlock, EditorJsContent } from "@/app/types/post";

interface EditorJsRendererProps {
    content: EditorJsContent;
}

function renderBlock(block: EditorJsBlock) {
    switch (block.type) {
        case "header": {
            const data = block.data as { text: string; level: number };
            const level = Math.min(Math.max(data.level, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
            const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
            switch (HeadingTag) {
                case "h1":
                    return (
                        <h1 className="mt-8 mb-4 font-bold text-zinc-900 dark:text-zinc-100">
                            {data.text}
                        </h1>
                    );
                case "h2":
                    return (
                        <h2 className="mt-8 mb-4 font-bold text-zinc-900 dark:text-zinc-100">
                            {data.text}
                        </h2>
                    );
                case "h3":
                    return (
                        <h3 className="mt-8 mb-4 font-bold text-zinc-900 dark:text-zinc-100">
                            {data.text}
                        </h3>
                    );
                case "h4":
                    return (
                        <h4 className="mt-8 mb-4 font-bold text-zinc-900 dark:text-zinc-100">
                            {data.text}
                        </h4>
                    );
                case "h5":
                    return (
                        <h5 className="mt-8 mb-4 font-bold text-zinc-900 dark:text-zinc-100">
                            {data.text}
                        </h5>
                    );
                case "h6":
                    return (
                        <h6 className="mt-8 mb-4 font-bold text-zinc-900 dark:text-zinc-100">
                            {data.text}
                        </h6>
                    );
            }
        }
        case "paragraph": {
            const data = block.data as { text: string };
            return <p className="mb-4 text-zinc-700 dark:text-zinc-300 leading-7">{data.text}</p>;
        }
        case "list": {
            const data = block.data as { style: string; items: string[] };
            const ListTag = data.style === "ordered" ? "ol" : "ul";
            const className =
                data.style === "ordered"
                    ? "mb-4 ml-6 list-decimal space-y-2 text-zinc-700 dark:text-zinc-300"
                    : "mb-4 ml-6 list-disc space-y-2 text-zinc-700 dark:text-zinc-300";
            return (
                <ListTag className={className}>
                    {data.items.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ListTag>
            );
        }
        case "quote": {
            const data = block.data as { text: string; caption?: string };
            return (
                <blockquote className="mb-4 pl-4 border-l-4 border-zinc-300 dark:border-zinc-700 italic text-zinc-600 dark:text-zinc-400">
                    <p>{data.text}</p>
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
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <Image
                            src={imageUrl}
                            alt={data.caption || ""}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 800px"
                        />
                    </div>
                    {data.caption && (
                        <figcaption className="mt-2 text-sm text-center text-zinc-500 dark:text-zinc-500">
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
                <div key={index}>{renderBlock(block)}</div>
            ))}
        </div>
    );
}
