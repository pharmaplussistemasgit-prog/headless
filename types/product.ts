export interface WooProduct {
    id: number;
    name: string;
    slug: string;
    price: string;
    regular_price: string;
    sale_price: string;
    status: string;
    stock_status: 'instock' | 'outofstock' | 'onbackorder';
    stock_quantity: number | null;
    short_description: string;
    description: string;
    images: { src: string; alt: string }[];
    meta_data: { key: string; value: any }[];
    attributes: { id: number; name: string; options: string[] }[];
    sku: string;
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
    average_rating?: string;
    rating_count?: number;
    date_on_sale_from?: string | null;
    date_on_sale_to?: string | null;
}

export interface MappedProduct {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    type?: string;
    price: number;
    regularPrice: number;
    isOnSale: boolean;
    stock: number | null;
    isInStock: boolean;
    showExactStock: boolean; // Si es < 10
    images: string[];
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
    shortDescription: string; // HTML limpio o texto
    description?: string; // HTML completo

    // Atributos Farmacéuticos
    brand: string | null;
    invima: string | null;
    productType: string | null;
    requiresRx: boolean;
    isRefrigerated: boolean;

    // UI Helpers
    discountPercentage: number | null;
    dateOnSaleFrom: string | null;
    dateOnSaleTo: string | null;
    averageRating: string | null;
    ratingCount: number | null;

    // Promotion Data (PTC - "Pague X Lleve Y")
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

export interface WooCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent: number;
    count: number;
}

export interface MappedCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    count: number;
    parent: number;
}
