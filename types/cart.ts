export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    variationId?: number;
    attributes?: Record<string, string>;
    slug: string;
    sku?: string; // T19: ERP Support
    categories?: { id: number; name: string; slug: string }[];
    requiresPrescription?: boolean;

    promotion?: {
        description: string;
        rule: {
            itemId: string;
            giftItemId: string;
            buyQuantity: number;
            receiveQuantity: number;
            startDate: string;
            endDate: string;
        };
    } | null;
}
