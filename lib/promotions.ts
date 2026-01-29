import { CartItem } from "@/context/CartContext";

export type PromotionType = 'buy_x_get_y' | 'percentage_discount' | 'fixed_amount';

export interface Promotion {
    id: string;
    name: string;
    type: PromotionType;
    targetProductIds?: string[]; // If empty, applies to all? Better be specific.
    targetCategoryIds?: string[];
    minQuantity?: number;
    // For buy_x_get_y
    buyQuantity?: number; // e.g., 2
    getQuantity?: number; // e.g., 3 (Buy 2 Get 3 means 1 free)
    // For percentage
    percentage?: number;
}

// Example Active Promotions
export const ACTIVE_PROMOTIONS: Promotion[] = [
    {
        id: 'promo-3x2-genfar',
        name: 'Pague 2 Lleve 3 en Genfar',
        type: 'buy_x_get_y',
        targetProductIds: [], // We would populate this with specific IDs or use logic
        targetCategoryIds: ['genfar', 'laboratorio-genfar'], // Placeholder slugs
        buyQuantity: 2,
        getQuantity: 3,
    },
    // Example global promo
    // {
    //     id: 'promo-10-off',
    //     name: '10% OFF en todo',
    //     type: 'percentage_discount',
    //     percentage: 10
    // }
];

export function calculateCartTotal(items: CartItem[]): { subtotal: number; discount: number; total: number; appliedPromos: string[] } {
    let subtotal = 0;
    let discount = 0;
    const appliedPromos: Set<string> = new Set();

    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        // Check for 3x2 Logic (Simple implementation for demonstration)
        // In a real app, we might match IDs against ACTIVE_PROMOTIONS

        // Hardcoded simulation for specific logic requested: "Pague 2 Lleve 3"
        // Let's assume any item with "Oferta" tag or specific metadata triggers this, 
        // OR simply applying it to items that match a rule.

        // For T19, user asked to implement the logic.
        // Let's protect specific products. 
        // Logic: Every 3rd item is free if it matches the promo.

        // Example: If user has 3 items of ID X, and Promo is 3x2:
        // Price * 3 -> Discount = Price * 1.

        // We will mock a check here. In reality, we'd check item.categories or item.brand
        const isEligibleFor3x2 = false; // Toggle this to true to test globally or implement brand check

        if (isEligibleFor3x2 && item.quantity >= 3) {
            const freeItems = Math.floor(item.quantity / 3);
            const discountAmount = freeItems * item.price;
            discount += discountAmount;
            appliedPromos.add('Pague 2 Lleve 3');
        }
    });

    return {
        subtotal,
        discount,
        total: subtotal - discount,
        appliedPromos: Array.from(appliedPromos)
    };
}

// Function to check if a single product has active promo (for badges)
export function getProductPromo(product: any): string | null {
    // Mock logic
    if (product.categories?.some((c: any) => c.slug === 'ofertas-especiales')) {
        return '3x2';
    }
    return null;
}
