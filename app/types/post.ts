export interface EditorJsBlock {
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
