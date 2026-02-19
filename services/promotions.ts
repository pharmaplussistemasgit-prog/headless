/**
 * Servicio de Promociones "Pague X Lleve Y"
 * 
 * ESTADO ACTUAL: Mock con datos hardcodeados
 * 
 * PRÓXIMOS PASOS:
 * 1. Agregar tabla `item_ptc` a CUSTOM_API en WordPress
 * 2. Reemplazar MOCK_PROMOTIONS con fetch real a:
 *    GET /wp-json/custom-api/v1/item-ptc
 * 
 * Ver documentación completa en:
 * - docs/erp_wordpress_api_complete.md
 * - docs/plan_desarrollo_31_puntos.md (Punto 19)
 */

import type { PromotionRule, ActivePromotion } from '@/types/promotion';

/**
 * MOCK: Datos de ejemplo basados en el Snippet #21
 * Estos datos simulan la tabla wp_item_ptc del ERP
 */
const MOCK_PROMOTIONS: PromotionRule[] = [
    {
        itemId: '4652', // NASAMIST HIPERTONICO
        giftItemId: '68146',
        buyQuantity: 2,
        receiveQuantity: 1,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
    },
    {
        itemId: '3294', // Producto ejemplo
        giftItemId: '76205',
        buyQuantity: 1,
        receiveQuantity: 1,
        startDate: '2026-01-01',
        endDate: '2026-06-30',
    },
    {
        itemId: '68146',
        giftItemId: '4652',
        buyQuantity: 3,
        receiveQuantity: 2,
        startDate: '2026-02-01',
        endDate: '2026-12-31',
    },
];

/**
 * Verifica si una promoción está activa en la fecha actual
 */
function isPromotionActive(rule: PromotionRule): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(rule.startDate);
    const end = new Date(rule.endDate);

    return today >= start && today <= end;
}

/**
 * Genera texto descriptivo de la promoción
 */
function getPromotionDescription(rule: PromotionRule): string {
    if (rule.buyQuantity === 1 && rule.receiveQuantity === 1) {
        return '🎁 Pague 1 Lleve 2';
    }
    if (rule.buyQuantity === 2 && rule.receiveQuantity === 1) {
        return '🎁 Pague 2 Lleve 3';
    }
    if (rule.buyQuantity === 3 && rule.receiveQuantity === 2) {
        return '🎁 Pague 3 Lleve 5';
    }

    return `🎁 Pague ${rule.buyQuantity} Lleve ${rule.buyQuantity + rule.receiveQuantity}`;
}


import { wcFetchRaw } from '@/lib/woocommerce';

/**
 * Obtiene todas las promociones activas desde la API real
 */
export async function getActivePromotions(): Promise<ActivePromotion[]> {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Llamada a la API con filtro de fechas validas
        const { data } = await wcFetchRaw<any[]>('item-ptc', {
            fecha_valida: today
        }, 3600, 'custom-api/v1'); // Cache 1 hora

        if (!Array.isArray(data)) {
            console.error('Invalid API response for promotions:', data);
            return [];
        }

        const activePromotions: ActivePromotion[] = [];

        for (const item of data) {
            // Mapear respuesta SQL a nuestra estructura
            const rule: PromotionRule = {
                itemId: item.ITEM_ID,
                giftItemId: item.ITEM_ID_RECAMBIO,
                buyQuantity: Number(item.POR_COMPRA_DE),
                receiveQuantity: Number(item.RECIBE_PTC),
                startDate: item.FECHA_INICIO,
                endDate: item.FECHA_FIN,
                maxQuantity: item.TOPE_MAXIMO ? Number(item.TOPE_MAXIMO) : undefined
            };

            // Validar fechas nuevamente por seguridad (aunque la API ya filtra)
            if (isPromotionActive(rule)) {
                activePromotions.push({
                    sku: rule.itemId,
                    rule,
                    description: getPromotionDescription(rule),
                });
            }
        }

        return activePromotions;

    } catch (error) {
        console.error('Error fetching active promotions:', error);
        // Fallback a MOCK solo en desarrollo si falla la API
        if (process.env.NODE_ENV === 'development') {
            console.warn('Falling back to MOCK promotions due to API error');
            const mockPromos: ActivePromotion[] = [];
            for (const rule of MOCK_PROMOTIONS) {
                if (isPromotionActive(rule)) {
                    mockPromos.push({
                        sku: rule.itemId,
                        rule,
                        description: getPromotionDescription(rule),
                    });
                }
            }
            return mockPromos;
        }
        return [];
    }
}


/**
 * Verifica si un producto específico tiene promoción activa
 */
export async function getPromotionForProduct(sku: string): Promise<ActivePromotion | null> {
    const promotions = await getActivePromotions();
    return promotions.find(p => p.sku === sku) || null;
}

/**
 * Obtiene todos los SKUs con promociones activas
 * Útil para filtrar productos en la página de ofertas
 */
export async function getPromotedProductSkus(): Promise<string[]> {
    const promotions = await getActivePromotions();
    return promotions.map(p => p.sku);
}
