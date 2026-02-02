import { unstable_cache } from "next/cache";

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://tienda.pharmaplus.com.co';

export interface BlogPost {
    id: number;
    date: string;
    slug: string;
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    _embedded?: {
        'wp:featuredmedia'?: Array<{ source_url: string }>;
        'author'?: Array<{ name: string }>;
    };
}

/**
 * Fetch posts from WordPress
 */
export const getPosts = unstable_cache(
    async (page = 1, perPage = 9): Promise<BlogPost[]> => {
        try {
            const res = await fetch(`${WP_API_URL}/wp-json/wp/v2/posts?_embed&per_page=${perPage}&page=${page}`);
            if (!res.ok) throw new Error('Failed to fetch posts');
            return await res.json();
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            return [];
        }
    },
    ['blog-posts-list'],
    { revalidate: 3600 }
);

/**
 * Fetch single post by slug
 */
export const getPostBySlug = unstable_cache(
    async (slug: string): Promise<BlogPost | null> => {
        try {
            const res = await fetch(`${WP_API_URL}/wp-json/wp/v2/posts?_embed&slug=${slug}`);
            if (!res.ok) throw new Error('Failed to fetch post');
            const posts = await res.json();
            return posts.length > 0 ? posts[0] : null;
        } catch (error) {
            console.error(`Error fetching post ${slug}:`, error);
            return null;
        }
    },
    ['blog-post-single'], // This key should ideally include slug but unstable_cache usage varies. 
    // For safer detailed cache, we rely on the function arguments which unstable_cache handles.
    { revalidate: 3600 }
);

export interface BlogCategory {
    id: number;
    count: number;
    description: string;
    link: string;
    name: string;
    slug: string;
    parent: number;
}

/**
 * Fetch categories from WordPress
 */
export const getCategories = unstable_cache(
    async (): Promise<BlogCategory[]> => {
        try {
            // Fetch up to 100 categories
            const res = await fetch(`${WP_API_URL}/wp-json/wp/v2/categories?per_page=100&hide_empty=true`);
            if (!res.ok) throw new Error('Failed to fetch categories');
            return await res.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },
    ['blog-categories'],
    { revalidate: 3600 }
);

/**
 * Get category by Slug
 */
export const getCategoryBySlug = unstable_cache(
    async (slug: string): Promise<BlogCategory | null> => {
        try {
            const res = await fetch(`${WP_API_URL}/wp-json/wp/v2/categories?slug=${slug}`);
            if (!res.ok) throw new Error('Failed to fetch category');
            const categories = await res.json();
            return categories.length > 0 ? categories[0] : null;
        } catch (error) {
            console.error(`Error fetching category ${slug}:`, error);
            return null;
        }
    },
    ['blog-category-slug'],
    { revalidate: 3600 }
);

/**
 * Get posts by Category ID
 */
export const getPostsByCategory = unstable_cache(
    async (categoryId: number, page = 1, perPage = 9): Promise<BlogPost[]> => {
        try {
            const res = await fetch(`${WP_API_URL}/wp-json/wp/v2/posts?_embed&categories=${categoryId}&per_page=${perPage}&page=${page}`);
            if (!res.ok) throw new Error('Failed to fetch posts by category');
            return await res.json();
        } catch (error) {
            console.error('Error fetching blog posts by category:', error);
            return [];
        }
    },
    ['blog-posts-category'],
    { revalidate: 3600 }
);
