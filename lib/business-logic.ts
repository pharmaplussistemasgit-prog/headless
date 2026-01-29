import { Product } from "@/types/woocommerce";
import { getProducts } from "@/lib/woocommerce";
import { mapWooProduct } from "@/lib/mappers";
import { WooProduct, MappedProduct } from "@/types/product";

// Cold Chain category ID in WooCommerce
const COLD_CHAIN_CATEGORY_ID = 3368;

/**
 * Obtiene productos de cadena de frío desde la categoría oficial de WooCommerce.
 * Fallback a búsqueda por keywords si la categoría está vacía.
 */
export async function getColdChainProducts(limit: number = 40, specificSearch?: string): Promise<MappedProduct[]> {
    try {
        // If user is searching within cold chain
        if (specificSearch) {
            const res = await getProducts({
                category: COLD_CHAIN_CATEGORY_ID.toString(),
                search: specificSearch,
                perPage: limit
            });
            return res.products.map(p => {
                const mapped = mapWooProduct(p as unknown as WooProduct);
                mapped.isRefrigerated = true;
                return mapped;
            });
        }

        // Fetch from the actual cold chain category in WooCommerce
        const categoryRes = await getProducts({
            category: COLD_CHAIN_CATEGORY_ID.toString(),
            perPage: limit
        });

        // If category has products, use them
        if (categoryRes.products.length > 0) {
            return categoryRes.products.map(p => {
                const mapped = mapWooProduct(p as unknown as WooProduct);
                mapped.isRefrigerated = true;
                return mapped;
            });
        }

        // Fallback: If category is empty, try keyword searches
        console.log("[Cold Chain] Category empty, falling back to keyword search");
        const [insulinaRes, refrigerRes] = await Promise.all([
            getProducts({ search: 'insulina', perPage: Math.floor(limit / 2) }),
            getProducts({ search: 'refriger', perPage: Math.floor(limit / 2) }),
        ]);

        const allRawProducts = [...insulinaRes.products, ...refrigerRes.products];
        const seenIds = new Set<number>();
        const uniqueProducts: Product[] = [];

        for (const p of allRawProducts) {
            if (!seenIds.has(p.id)) {
                seenIds.add(p.id);
                uniqueProducts.push(p);
            }
        }

        return uniqueProducts.map(p => {
            const mapped = mapWooProduct(p as unknown as WooProduct);
            mapped.isRefrigerated = true;
            return mapped;
        });
    } catch (error) {
        console.error("Error fetching cold chain products:", error);
        return [];
    }
}

