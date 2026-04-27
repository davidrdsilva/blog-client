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
    isInternal: boolean;
}

export interface APICategory {
    id: number;
    name: string;
    is_internal: boolean;
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
    characters: Character[];
    totalViews: number;
    whitenestChapterNumber?: number;
}

export interface CharacterSkills {
    melee: number;
    guns: number;
    stealth: number;
    persuasion: number;
    intellect: number;
    endurance: number;
}

export interface Character {
    id: string;
    fullName: string;
    shortName: string;
    description: string;
    occupation: string;
    location: string;
    portrait: string;
    skills: CharacterSkills;
}

export interface WhitenestChapterRef {
    id: string;
    title: string;
    whitenestChapterNumber: number;
}

export interface WhitenestChapterSummary {
    id: string;
    title: string;
    image: string;
    tags: Tag[];
    whitenestChapterNumber: number;
}

export interface WhitenestChapter {
    chapter: Post;
    previous?: WhitenestChapterRef;
    next?: WhitenestChapterRef;
    cast: Character[];
}

export interface APICharacter {
    id: string;
    full_name: string;
    short_name: string;
    description: string;
    occupation: string;
    location: string;
    portrait: string;
    skills: CharacterSkills;
    createdAt: string;
    updatedAt: string;
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
    category?: APICategory | null;
    tags?: Tag[] | null;
    characters?: APICharacter[] | null;
    total_views: number;
    whitenest_chapter_number?: number | null;
    createdAt: string;
    updatedAt: string;
}
