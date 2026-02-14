import type { EditorJsContent, Post } from "@/app/types/post";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// API response types matching the backend spec
interface APIPost {
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

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}

interface PostsResponse {
    data: APIPost[];
    meta: PaginationMeta;
}

interface SinglePostResponse {
    data: APIPost;
}

interface APIError {
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
}

// Query parameters for listing posts
export interface GetPostsParams {
    page?: number;
    limit?: number;
    search?: string;
    author?: string;
    sortBy?: "date" | "title" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
}

// Request body for creating/updating posts
export interface CreatePostData {
    title: string;
    subtitle?: string;
    description: string;
    image: string;
    author: string;
    content?: EditorJsContent;
}

export interface UpdatePostData {
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    content?: EditorJsContent;
}

// Transform API post to frontend Post type
function transformPost(apiPost: APIPost): Post {
    return {
        id: apiPost.id,
        title: apiPost.title,
        subtitle: apiPost.subtitle ?? undefined,
        description: apiPost.description,
        image: apiPost.image,
        date: new Date(apiPost.date),
        author: apiPost.author,
        content: apiPost.content ?? undefined,
    };
}

// Custom error class for API errors
export class APIClientError extends Error {
    code: string;
    details?: Record<string, string[]>;

    constructor(code: string, message: string, details?: Record<string, string[]>) {
        super(message);
        this.name = "APIClientError";
        this.code = code;
        this.details = details;
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as APIError | null;
        throw new APIClientError(
            errorData?.error?.code || "UNKNOWN_ERROR",
            errorData?.error?.message || `Request failed with status ${response.status}`,
            errorData?.error?.details
        );
    }
    return response.json();
}

// Get paginated list of posts
export async function getPosts(
    params: GetPostsParams = {}
): Promise<{ posts: Post[]; meta: PaginationMeta }> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.author) searchParams.set("author", params.author);
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/posts${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store", // Prevent Next.js from caching during build
    });

    const data = await handleResponse<PostsResponse>(response);

    return {
        posts: data.data.map(transformPost),
        meta: data.meta,
    };
}

// Get a single post by ID
export async function getPost(id: string): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await handleResponse<SinglePostResponse>(response);
    return transformPost(data.data);
}

// Create a new post
export async function createPost(postData: CreatePostData): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
    });

    const data = await handleResponse<SinglePostResponse>(response);
    return transformPost(data.data);
}

// Update an existing post
export async function updatePost(id: string, postData: UpdatePostData): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
    });

    const data = await handleResponse<SinglePostResponse>(response);
    return transformPost(data.data);
}

// Delete a post
export async function deletePost(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "DELETE",
    });

    if (!response.ok && response.status !== 204) {
        const errorData = (await response.json().catch(() => null)) as APIError | null;
        throw new APIClientError(
            errorData?.error?.code || "DELETE_FAILED",
            errorData?.error?.message || "Failed to delete post"
        );
    }
}

// Export API base URL for Editor.js configuration
export const UPLOAD_ENDPOINT = `${API_BASE_URL}/api/upload`;
export const FETCH_URL_ENDPOINT = `${API_BASE_URL}/api/fetch-url`;
