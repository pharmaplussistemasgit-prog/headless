'use server';

import { getWooApi, wcFetchRaw } from "@/lib/woocommerce";
import { mapWooProduct } from "@/lib/mappers";
import { MappedProduct, MappedCategory, WooCategory } from "@/types/product";

export async function getHomeProducts(): Promise<MappedProduct[]> {
    try {
        const api = getWooApi();
        const response = await api.get("products", {
            per_page: 10,
            status: 'publish',
            stock_status: 'instock'
        });

        if (response.status === 200) {
            return response.data.map((p: any) => mapWooProduct(p));
        }
        return [];
    } catch (error) {
        console.error("Error fetching home products:", error);
        return [];
    }
}

export async function getProductBySlug(slug: string): Promise<MappedProduct | null> {
    try {
        const api = getWooApi();
        const response = await api.get("products", {
            slug: slug,
        });

        if (response.status === 200 && response.data.length > 0) {
            return mapWooProduct(response.data[0]);
        }
        return null;
    } catch (error) {
        console.error(`Error fetching product by slug ${slug}:`, error);
        return null;
    }
}

// category logic
export async function getCategoryBySlug(slug: string): Promise<MappedCategory | null> {
    try {
        // Optimizing with wcFetchRaw for ISR Caching
        const { data } = await wcFetchRaw<WooCategory[]>("products/categories", {
            slug: slug
        });

        if (data && data.length > 0) {
            const cat = data[0];
            return {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                count: cat.count,
                parent: cat.parent
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching category by slug ${slug}:`, error);
        return null;
    }
}

export async function getProductsByCategory(categoryId: number, options: {
    minPrice?: string;
    maxPrice?: string;
    page?: number;
    perPage?: number;
} = {}): Promise<{ products: MappedProduct[], totalPages: number }> {
    try {
        const params: any = {
            category: categoryId.toString(),
            per_page: options.perPage || 12,
            status: 'publish',
            stock_status: 'instock', // Strict filter: No OOS products
            page: options.page || 1
        };

        if (options.minPrice) params.min_price = options.minPrice;
        if (options.maxPrice) params.max_price = options.maxPrice;

        // Use wcFetchRaw to enable Next.js ISR Caching (default 10 mins)
        // This fixes the slow 4s loading time on repeated visits
        const { data, headers } = await wcFetchRaw<any[]>("products", params);

        const totalPages = parseInt(headers.get("x-wp-totalpages") || "1");
        return {
            products: data.map((p: any) => mapWooProduct(p)),
            totalPages
        };
    } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        return { products: [], totalPages: 0 };
    }
}

export async function getAllCategories(): Promise<MappedCategory[]> {
    try {
        const api = getWooApi();
        const response = await api.get("products/categories", {
            per_page: 20,
            parent: 0, // Solo categorías padre por defecto
            hide_empty: true
        });

        if (response.status === 200) {
            return response.data.map((cat: WooCategory) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                count: cat.count,
                parent: cat.parent
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching all categories:", error);
        return [];
    }
}

export async function searchProducts(query: string): Promise<MappedProduct[]> {
    try {
        if (!query || query.length < 3) return [];

        const api = getWooApi();
        const isSingleTerm = !query.trim().includes(' ');

        // Parallel requests: Standard Search + Explicit SKU (if applicable)
        const requests: Promise<any>[] = [
            api.get("products", {
                search: query,
                per_page: 12,
                status: 'publish',
                stock_status: 'instock' // Strict stock
            })
        ];

        if (isSingleTerm) {
            requests.push(
                api.get("products", {
                    sku: query.trim(),
                    status: 'publish'
                })
            );
        }

        const responses = await Promise.all(requests);
        const searchResults = responses[0]?.status === 200 ? responses[0].data : [];
        const skuResults = (isSingleTerm && responses[1]?.status === 200) ? responses[1].data : [];

        // Merge and Deduplicate
        const uniqueProducts = new Map();

        // Prioritize SKU match (put it first)
        skuResults.forEach((p: any) => uniqueProducts.set(p.id, p));
        searchResults.forEach((p: any) => {
            if (!uniqueProducts.has(p.id)) {
                uniqueProducts.set(p.id, p);
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Array.from(uniqueProducts.values()).map((p: any) => mapWooProduct(p));

    } catch (error) {
        console.error(`Error searching products for query "${query}":`, error);
        return [];
    }
}
