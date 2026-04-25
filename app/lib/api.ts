import type { Category, CategoryWithCount, EditorJsContent, Post, Tag } from "@/app/types/post";

const API_BASE_URL = typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_URL || "" : "";

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
    category_id: number;
    category?: Category | null;
    tags?: Tag[] | null;
    createdAt: string;
    updatedAt: string;
}

interface CategoriesResponse {
    data: Category[];
}

interface CategoriesCountResponse {
    data: CategoryWithCount[];
}

interface TagsResponse {
    data: Tag[];
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

export interface Comment {
    id: string;
    postId: string;
    author: string;
    content: string;
    createdAt: string;
}

interface CommentsResponse {
    data: Comment[];
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
    categoryId?: number;
    tags?: string[];
}

// Request body for creating/updating posts
export interface CreatePostData {
    title: string;
    subtitle?: string;
    description: string;
    image: string;
    author: string;
    content?: EditorJsContent;
    date?: string;
    category_id: number;
    tags?: string[];
}

export interface UpdatePostData {
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    content?: EditorJsContent;
    date?: string;
    category_id?: number;
    tags?: string[];
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
        categoryId: apiPost.category_id,
        category: apiPost.category ?? undefined,
        tags: apiPost.tags ?? [],
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
): Promise<{ posts: Post[]; meta: PaginationMeta; error?: unknown }> {
    try {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.set("page", String(params.page));
        if (params.limit) searchParams.set("limit", String(params.limit));
        if (params.search) searchParams.set("search", params.search);
        if (params.author) searchParams.set("author", params.author);
        if (params.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
        if (params.categoryId) searchParams.set("category_id", String(params.categoryId));
        if (params.tags && params.tags.length > 0) {
            for (const tag of params.tags) {
                searchParams.append("tags", tag);
            }
        }

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
    } catch (error) {
        console.error("Error fetching posts:", error);

        return {
            posts: [],
            meta: {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                hasMore: false,
            },
            error,
        };
    }
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

// Get comments for a post
export async function getComments(postId: string): Promise<Comment[]> {
    const response = await fetch(`${API_BASE_URL}/api/comments?postId=${postId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await handleResponse<CommentsResponse>(response);
    return data.data || [];
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

// Helper function to check if error indicates API is down/unreachable
export function isAPIDownError(error: unknown): boolean {
    // Check for TypeError which fetch throws for network failures
    if (error instanceof TypeError) {
        // Common network error messages
        const networkErrorPatterns = [
            "fetch failed",
            "network request failed",
            "failed to fetch",
            "networkerror",
            "load failed",
            "ECONNREFUSED",
            "ENOTFOUND",
            "ETIMEDOUT",
            "ERR_CONNECTION_REFUSED",
        ];

        const errorMessage = error.message.toLowerCase();
        return networkErrorPatterns.some((pattern) => errorMessage.includes(pattern.toLowerCase()));
    }

    // Check for specific API errors that indicate server is down
    if (error instanceof APIClientError) {
        const downErrorCodes = ["SERVICE_UNAVAILABLE", "GATEWAY_TIMEOUT", "BAD_GATEWAY"];
        return downErrorCodes.includes(error.code);
    }

    return false;
}

// List categories with optional case-insensitive name search.
export async function getCategories(search?: string): Promise<Category[]> {
    try {
        const url = new URL(`${API_BASE_URL}/api/categories`, "http://placeholder");
        if (search) url.searchParams.set("search", search);
        const fetchUrl = `${API_BASE_URL}/api/categories${url.search}`;
        const response = await fetch(fetchUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });
        const data = await handleResponse<CategoriesResponse>(response);
        return data.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

// List tags with optional case-insensitive name search.
export async function getTags(search?: string): Promise<Tag[]> {
    try {
        const fetchUrl = search
            ? `${API_BASE_URL}/api/tags?search=${encodeURIComponent(search)}`
            : `${API_BASE_URL}/api/tags`;
        const response = await fetch(fetchUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });
        const data = await handleResponse<TagsResponse>(response);
        return data.data;
    } catch (error) {
        console.error("Error fetching tags:", error);
        return [];
    }
}

// Total posts grouped by category (used by the homepage categories strip).
export async function getPostCountByCategory(): Promise<CategoryWithCount[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts/count/by-category`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });
        const data = await handleResponse<CategoriesCountResponse>(response);
        return data.data;
    } catch (error) {
        console.error("Error fetching post count by category:", error);
        return [];
    }
}

// Export API base URL for Editor.js configuration
export const UPLOAD_ENDPOINT = `${API_BASE_URL}/api/upload`;
export const FETCH_URL_ENDPOINT = `${API_BASE_URL}/api/fetch-url`;
