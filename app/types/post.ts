export interface EditorJsBlock {
    id?: string;
    type: string;
    data: Record<string, unknown>;
}

export interface EditorJsContent {
    blocks: EditorJsBlock[];
    time?: number;
    version?: string;
}

export interface Post {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    image: string;
    date: Date;
    author: string;
    content?: EditorJsContent;
}

export interface APIPost {
    id: string;
    title: string;
    subtitle: string | null;
    description: string;
    image: string;
    date: string;
    author: string;
    content: EditorJsContent | null;
    createdAt: string;
    updatedAt: string;
}
