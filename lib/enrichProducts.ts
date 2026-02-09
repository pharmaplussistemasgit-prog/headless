/**
 * Enriquece productos mapeados con información de promociones PTC
 * 
 * Esta función toma un array de productos ya mapeados y les agrega
 * la información de promociones activas desde el servicio de promociones.
 * 
 * USO:
 * ```typescript
 * const products = rawProducts.map(mapWooProduct);
 * const enrichedProducts = await enrichProductsWithPromotions(products);
 * ```
 */

import type { MappedProduct } from '@/types/product';
import { getActivePromotions } from '@/services/promotions';

export async function enrichProductsWithPromotions(
    products: MappedProduct[]
): Promise<MappedProduct[]> {
    // Obtener todas las promociones activas
    const activePromotions = await getActivePromotions();

    // Crear un mapa SKU -> Promoción para búsqueda rápida
    const promotionMap = new Map(
        activePromotions.map(promo => [promo.sku, promo])
    );

    // Enriquecer cada producto con su promoción si existe
    return products.map(product => {
        if (!product.sku) return product;

        const promotion = promotionMap.get(product.sku);

        if (promotion) {
            return {
                ...product,
                promotion: {
                    description: promotion.description,
                    rule: promotion.rule,
                },
            };
        }

        return product;
    });
}
