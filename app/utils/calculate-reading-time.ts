import type { Post } from "@/app/types/post";

export function calculateReadingTime(post: Post): string {
    let textContent = "";

    if (post.content?.blocks?.length) {
        textContent = post.content.blocks
            .map((block) => {
                const data = block.data || {};
                let text = "";
                if (typeof data.text === "string") text += `${data.text} `;
                if (Array.isArray(data.items)) text += `${data.items.join(" ")} `;
                if (typeof data.caption === "string") text += `${data.caption} `;
                return text;
            })
            .join(" ");
    } else {
        textContent = post.description || "";
    }

    // Strip HTML tags commonly found in Editor.js strings (like <b>, <i>, <a>)
    const cleanText = textContent.replace(/<[^>]*>/g, " ");
    const wordCount = cleanText.split(/\s+/).filter((word) => word.length > 0).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));

    return `${minutes} min read`;
}
