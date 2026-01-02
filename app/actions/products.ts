'use server';

import { getWooApi } from "@/lib/woocommerce";
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
        const api = getWooApi();
        const response = await api.get("products/categories", {
            slug: slug
        });

        if (response.status === 200 && response.data.length > 0) {
            const cat = response.data[0] as WooCategory;
            return {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                count: cat.count
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching category by slug ${slug}:`, error);
        return null;
    }
}

export async function getProductsByCategory(categoryId: number): Promise<MappedProduct[]> {
    try {
        const api = getWooApi();
        const response = await api.get("products", {
            category: categoryId.toString(),
            per_page: 20, // Página de categoría usualmente muestra más
            status: 'publish'
        });

        if (response.status === 200) {
            return response.data.map((p: any) => mapWooProduct(p));
        }
        return [];
    } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        return [];
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
                count: cat.count
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching all categories:", error);
        return [];
    }
}
