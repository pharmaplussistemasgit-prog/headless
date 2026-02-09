/**
 * Tipos para el sistema de promociones "Pague X Lleve Y"
 * Basado en la tabla wp_item_ptc del ERP
 */

export interface PromotionRule {
    /** SKU del producto base que activa la promoción */
    itemId: string;

    /** SKU del producto que se regala */
    giftItemId: string;

    /** Cantidad mínima a comprar para activar la promoción */
    buyQuantity: number;

    /** Cantidad de productos de regalo que se reciben */
    receiveQuantity: number;

    /** Fecha de inicio de la promoción (YYYY-MM-DD) */
    startDate: string;

    /** Fecha de fin de la promoción (YYYY-MM-DD) */
    endDate: string;

    /** ID único de la promoción (opcional, para futuro uso con API real) */
    id?: number;
}

export interface ActivePromotion {
    /** SKU del producto */
    sku: string;

    /** Regla de promoción activa */
    rule: PromotionRule;

    /** Texto descriptivo de la promoción */
    description: string;
}
