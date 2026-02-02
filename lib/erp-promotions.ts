import { Promotion } from "./promotions";

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WOOCOMMERCE_API_URL || 'https://pharma-plus.demo';

// B2C Discount Rule Structure from ERP (wp_descuento_call)
interface ErpDiscountCall {
    ID: string;
    DESCUENTO_ID: string;
    ITEM_ID: string; // SKU
    FECHA_INICIO: string;
    FECHA_FINAL: string;
    // Dynamic tiered discounts D2..D10
    D2?: string;
    D3?: string;
    D4?: string;
    D5?: string;
    D6?: string;
    D7?: string;
    D8?: string;
    D9?: string;
    D10?: string;
}

// B2B Discount Rule Structure from ERP (wp_cliente_descuento_item)
interface ErpClientDiscount {
    ID: string;
    CLIENTE_ID: string;
    CONVENIO_ID: string;
    ITEM_ID: string; // SKU or ID?
    VALOR: string; // Fixed price logic? Or discount amount?
    PORCENTAJE_COM: string;
    FECHA_INICIAL: string;
    FECHA_FINAL: string;
    // ... other fields from CSV
}

/**
 * Fetch B2C Tiered Discounts (Public/General)
 * Endpoint: /wp-json/custom-api/v1/descuento-call
 */
export async function fetchB2CPromotions(): Promise<Promotion[]> {
    try {
        const res = await fetch(`${API_URL}/wp-json/custom-api/v1/descuento-call`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) throw new Error('Failed to fetch B2C promotions');

        const data: ErpDiscountCall[] = await res.json();

        // Transform ERP rules to our generic Promotion structure
        return data.map(rule => ({
            id: `b2c-${rule.ID}`,
            name: `Descuento Escalonado ${rule.ITEM_ID}`,
            type: 'tiered_amount', // We need to handle this new type in promotions.ts
            targetProductSku: rule.ITEM_ID, // We need to match by SKU
            startDate: rule.FECHA_INICIO,
            endDate: rule.FECHA_FINAL,
            tiers: extractTiers(rule)
        }));

    } catch (error) {
        console.warn('EMP Promotions: Backend endpoint not reachable. Run [erp_promotions_endpoint_snippet.php] in WordPress to enable.', error);
        return [];
    }
}

/**
 * Fetch B2B Client Specific Discounts
 * Endpoint: /wp-json/custom-api/v1/cliente-descuento-item?CLIENTE_ID=x
 */
export async function fetchB2BPromotions(clienteId: string): Promise<Promotion[]> {
    try {
        const res = await fetch(`${API_URL}/wp-json/custom-api/v1/cliente-descuento-item?CLIENTE_ID=${clienteId}`, {
            cache: 'no-store' // Always fresh for strict B2B rules
        });

        if (!res.ok) throw new Error('Failed to fetch B2B promotions');

        const data: ErpClientDiscount[] = await res.json();

        return data.map(rule => ({
            id: `b2b-${rule.ID}`,
            name: `Convenio ${rule.CONVENIO_ID}`,
            type: 'fixed_price', // or percentage_discount depending on logic
            targetProductSku: rule.ITEM_ID,
            startDate: rule.FECHA_INICIAL,
            endDate: rule.FECHA_FINAL,
            fixedPrice: parseFloat(rule.VALOR) > 0 ? parseFloat(rule.VALOR) : undefined,
            percentage: parseFloat(rule.PORCENTAJE_COM) > 0 ? parseFloat(rule.PORCENTAJE_COM) : undefined
        }));

    } catch (error) {
        console.error('Error fetching B2B promotions:', error);
        return [];
    }
}

// Helper to parse D2...D10
function extractTiers(rule: ErpDiscountCall): Record<number, number> {
    const tiers: Record<number, number> = {};
    for (let i = 2; i <= 10; i++) {
        const key = `D${i}` as keyof ErpDiscountCall;
        const val = rule[key];
        if (val && !isNaN(parseFloat(val as string))) {
            tiers[i] = parseFloat(val as string);
        }
    }
    return tiers;
}
