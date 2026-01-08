import { Product } from "@/types/woocommerce";
import { getProducts } from "@/lib/woocommerce";
import { mapWooProduct } from "@/lib/mappers";
import { WooProduct, MappedProduct } from "@/types/product";

/**
 * Obtiene y agrega productos de cadena de frío desde múltiples búsquedas.
 * Estrategia: Buscar por palabras clave fuertes y deduplicar.
 */
export async function getColdChainProducts(limit: number = 20, specificSearch?: string): Promise<MappedProduct[]> {
    try {
        if (specificSearch) {
            const res = await getProducts({ search: specificSearch, perPage: limit });
            return res.products.map(p => {
                const mapped = mapWooProduct(p as unknown as WooProduct);
                mapped.isRefrigerated = true;
                return mapped;
            });
        }

        // 1. Ejecutar búsquedas en paralelo para máxima cobertura
        const [insulinaRes, refrigerRes, vacunaRes] = await Promise.all([
            getProducts({ search: 'insulina', perPage: limit }),
            getProducts({ search: 'refriger', perPage: limit }),
            getProducts({ search: 'never', perPage: limit }) // Para 'nevera'
        ]);

        // 2. Combinar resultados crudos
        const allRawProducts = [
            ...insulinaRes.products,
            ...refrigerRes.products,
            ...vacunaRes.products
        ];

        // 3. Deduplicar por ID
        const seenIds = new Set<number>();
        const uniqueProducts: Product[] = [];

        for (const p of allRawProducts) {
            if (!seenIds.has(p.id)) {
                seenIds.add(p.id);
                uniqueProducts.push(p);
            }
        }

        // 4. Mapear a formato de UI y forzar flag de refrigerado
        // (Ya que sabemos que estos son de frío por la búsqueda)
        const mappedProducts = uniqueProducts.map(p => {
            const mapped = mapWooProduct(p as unknown as WooProduct);
            mapped.isRefrigerated = true; // Forzar visualmente
            return mapped;
        });

        return mappedProducts;
    } catch (error) {
        console.error("Error fetching cold chain products:", error);
        return [];
    }
}
