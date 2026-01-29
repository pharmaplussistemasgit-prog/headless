import { CartItem } from "@/context/CartContext";
import { Product } from "@/types/woocommerce";
import { WooProduct } from "@/types/product";

/**
 * Detects if a product requires cold chain (refrigeration).
 * Checks metadata first, then falls back to keyword matching.
 */
export function isRefrigerated(product: Product | WooProduct | CartItem): boolean {
    if (!product) return false;

    // 1. Check explicit meta (if available in Product/WooProduct)
    if ('meta_data' in product && product.meta_data) {
        const coldMeta = product.meta_data.find((m: any) => m.key === '_cadena_de_frio' || m.key === 'cadena_frio');
        if (coldMeta && (coldMeta.value === 'yes' || coldMeta.value === 'true' || coldMeta.value === 'on' || coldMeta.value === '1' || coldMeta.value === true)) {
            return true;
        }
    }

    // 2. Keyword fallback (Name or Description)
    // Note: CartItem only has 'name' and 'slug', usually enough.
    const name = product.name || '';
    const description = 'short_description' in product ? product.short_description || '' : '';

    // Keywords for cold chain
    const keywords = ['refriger', 'frio', 'frío', 'never', 'insulina', 'vacuna', 'pen', 'vial', 'ampolla'];
    const searchStr = (name + ' ' + description).toLowerCase();

    return keywords.some(k => searchStr.includes(k));
}

/**
 * Detects if a product requires medical prescription.
 */
export function requiresMedicalPrescription(product: Product | WooProduct | CartItem): boolean {
    if (!product) return false;

    // 1. Check explicit meta (if available) - Assuming 'requires_prescription' or similar
    if ('meta_data' in product && product.meta_data) {
        const rxMeta = product.meta_data.find((m: any) => m.key === '_requires_prescription' || m.key === 'requires_prescription');
        if (rxMeta && (rxMeta.value === 'yes' || rxMeta.value === 'true' || rxMeta.value === '1')) {
            return true;
        }
    }

    // 2. Keyword fallback
    const name = product.name || '';
    const description = 'short_description' in product ? product.short_description || '' : '';

    // Keywords for prescription
    const keywords = ['antibiotico', 'antibiótico', 'bajo formula', 'bajo fórmula', 'controlado', 'venta bajo formula'];
    const searchStr = (name + ' ' + description).toLowerCase();

    return keywords.some(k => searchStr.includes(k));
}

export const COLD_CHAIN_FEE = 6500;
