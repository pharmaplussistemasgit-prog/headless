import { CartItem } from "@/types/cart";

export type PromotionType = 'buy_x_get_y' | 'percentage_discount' | 'fixed_amount' | 'tiered_amount' | 'fixed_price';

export interface Promotion {
    id: string;
    name: string;
    type: PromotionType;
    // Targeting
    targetProductIds?: number[]; // Specific product IDs
    targetProductSku?: string;   // Specific product SKU (New for ERP)
    targetCategorySlugs?: string[]; // Categories (e.g., 'laboratorio-genfar')
    stockMin?: number;

    // Constraints
    minQuantity?: number; // Min items in cart to trigger
    startDate?: string; // ISO Date
    endDate?: string;   // ISO Date

    // Logic for buy_x_get_y
    buyQuantity?: number; // e.g., 2
    getQuantity?: number; // e.g., 3 (Pay 2 Get 3)

    // Logic for percentage
    percentage?: number; // 0-100

    // Logic for fixed_price (B2B)
    fixedPrice?: number;

    // Logic for tiered_amount (B2C - ERP D2...D10)
    tiers?: Record<number, number>; // { 2: 500, 3: 1000 }
}

// Example Active Promotions - This would ideally come from an API/Config
export let ACTIVE_PROMOTIONS: Promotion[] = [
    {
        id: 'promo-3x2-genfar',
        name: 'Pague 2 Lleve 3 en Genfar',
        type: 'buy_x_get_y',
        targetCategorySlugs: ['laboratorio-genfar', 'genfar'],
        buyQuantity: 2,
        getQuantity: 3,
    },
    {
        id: 'promo-biogaia',
        name: 'Biogaia 15% OFF',
        type: 'percentage_discount',
        targetProductIds: [12345], // Example ID, replace with real ones
        percentage: 15
    }
];

export function setPromotions(promos: Promotion[]) {
    ACTIVE_PROMOTIONS = promos;
}

export function appendPromotions(promos: Promotion[]) {
    ACTIVE_PROMOTIONS = [...ACTIVE_PROMOTIONS, ...promos];
}

/**
 * Checks if a cart item matches a promotion's target criteria (Category or Product ID)
 */
function isItemEligible(item: CartItem, promo: Promotion): boolean {
    // 0. Check Product SKU (Primary for ERP)
    if (promo.targetProductSku && item.sku) {
        if (item.sku === promo.targetProductSku) return true;
    }

    // 1. Check Product ID
    if (promo.targetProductIds && promo.targetProductIds.length > 0) {
        if (promo.targetProductIds.includes(item.id)) return true;
    }

    // 2. Check Category Slug (Requires item to have category data or slug analysis)
    if (promo.targetCategorySlugs && promo.targetCategorySlugs.length > 0) {
        // Fallback: Check slug
        return promo.targetCategorySlugs.some(slug => item.slug.includes(slug));
    }

    return false;
}

export function calculateCartTotal(items: CartItem[]): { subtotal: number; discount: number; total: number; appliedPromos: string[] } {
    let subtotal = 0;
    let totalDiscount = 0;
    const appliedPromos: Set<string> = new Set();

    items.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    for (const promo of ACTIVE_PROMOTIONS) {
        // Date Check
        const now = new Date();
        if (promo.startDate && new Date(promo.startDate) > now) continue;
        if (promo.endDate && new Date(promo.endDate) < now) continue;

        items.forEach(item => {
            if (isItemEligible(item, promo)) {

                // --- BUY X GET Y ---
                if (promo.type === 'buy_x_get_y' && promo.buyQuantity && promo.getQuantity) {
                    const quantity = item.quantity;
                    if (quantity >= promo.getQuantity!) {
                        const sets = Math.floor(quantity / promo.getQuantity!);
                        const freeItemsPerSet = promo.getQuantity! - promo.buyQuantity!;
                        const totalFreeItems = sets * freeItemsPerSet;

                        const discountAmount = totalFreeItems * item.price;
                        totalDiscount += discountAmount;
                        appliedPromos.add(promo.name);
                    }
                }

                // --- PERCENTAGE ---
                if (promo.type === 'percentage_discount' && promo.percentage) {
                    const discountAmount = (item.price * item.quantity) * (promo.percentage! / 100);
                    totalDiscount += discountAmount;
                    appliedPromos.add(promo.name);
                }

                // --- B2B FIXED PRICE ---
                if (promo.type === 'fixed_price' && promo.fixedPrice !== undefined) {
                    // If fixed price is lower than regular price, the discount is the diff
                    if (promo.fixedPrice < item.price) {
                        const diffPerUnit = item.price - promo.fixedPrice;
                        totalDiscount += diffPerUnit * item.quantity;
                        appliedPromos.add(promo.name);
                    }
                }

                // --- B2C TIERED AMOUNT (D2, D3...) ---
                if (promo.type === 'tiered_amount' && promo.tiers) {
                    const quantity = item.quantity;
                    if (quantity >= 2) {
                        let currentItemDiscount = 0;
                        for (let i = 2; i <= quantity; i++) {
                            const tierKey = i <= 10 ? i : 0;
                            if (tierKey > 0 && promo.tiers[tierKey]) {
                                currentItemDiscount += promo.tiers[tierKey];
                            }
                        }
                        if (currentItemDiscount > 0) {
                            totalDiscount += currentItemDiscount;
                            appliedPromos.add(promo.name);
                        }
                    }
                }
            }
        });
    }

    // Safety: Discount cannot exceed subtotal
    totalDiscount = Math.min(totalDiscount, subtotal);

    return {
        subtotal,
        discount: totalDiscount,
        total: subtotal - totalDiscount,
        appliedPromos: Array.from(appliedPromos)
    };
}

// Function to check if a single product has active promo (for badges)
export function getProductPromo(product: any): string | null {
    // Adapter to check against ACTIVE_PROMOTIONS

    // Minimal CartItem for check
    const mockItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price ? parseFloat(product.price) : 0,
        quantity: 1,
        image: '',
        slug: product.slug,
        sku: product.sku // Added SKU check logic
    };

    for (const promo of ACTIVE_PROMOTIONS) {
        if (isItemEligible(mockItem, promo)) {
            if (promo.type === 'buy_x_get_y') return `${promo.buyQuantity}x${promo.getQuantity}`;
            if (promo.type === 'percentage_discount') return `-${promo.percentage}%`;
            if (promo.type === 'tiered_amount') return `Desc. Escalonado`;
            if (promo.type === 'fixed_price') return `Precio Convenio`;
        }
    }

    return null;
}
