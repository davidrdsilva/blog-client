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

export interface Category {
    id: number;
    name: string;
}

export interface Tag {
    id: string;
    name: string;
}

export interface CategoryWithCount {
    id: number;
    name: string;
    total_posts: number;
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
    categoryId: number;
    category?: Category;
    tags: Tag[];
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
    category_id: number;
    category?: Category | null;
    tags?: Tag[] | null;
    createdAt: string;
    updatedAt: string;
}
