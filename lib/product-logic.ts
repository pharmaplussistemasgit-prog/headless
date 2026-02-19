import { CartItem } from "@/types/cart";
import { Product } from "@/types/woocommerce";
import { WooProduct } from "@/types/product";

/**
 * Detects if a product requires cold chain (refrigeration).
 * Checks metadata first, then falls back to keyword matching.
 */
export function isRefrigerated(product: Product | WooProduct | CartItem): boolean {
    if (!product) return false;

    // 1. Check Categories (Primary Source of Truth as per user request)
    // Works for both WooProduct/Product (has 'categories') and CartItem (now has 'categories')
    if ('categories' in product && Array.isArray(product.categories)) {
        const hasCategory = product.categories.some((c: any) => c.slug === 'cadena-de-frio');
        if (hasCategory) return true;
    }

    // 2. Check explicit meta (Legacy/Backup)
    if ('meta_data' in product && product.meta_data) {
        const coldMeta = product.meta_data.find((m: any) => m.key === '_cadena_de_frio' || m.key === 'cadena_frio');
        if (coldMeta && (coldMeta.value === 'yes' || coldMeta.value === 'true' || coldMeta.value === 'on' || coldMeta.value === '1' || coldMeta.value === true)) {
            return true;
        }
    }

    // 3. Keywords Removed as per user request ("nos basamos netamente en la categoria")
    return false;
}

/**
 * Detects if a product requires medical prescription.
 */
export function requiresMedicalPrescription(product: Product | WooProduct | CartItem): boolean {
    if (!product) return false;

    // 0. Use Explicit Property if available (from CartItem or MappedProduct)
    if ('requiresPrescription' in product && typeof product.requiresPrescription === 'boolean') {
        return product.requiresPrescription;
    }
    if ('requiresRx' in product && typeof product.requiresRx === 'boolean') {
        return product.requiresRx;
    }

    // 1. Check explicit meta (fallback for raw WooProduct)
    if ('meta_data' in product && product.meta_data) {
        const rxMeta = product.meta_data.find((m: any) =>
            m.key === '_requires_prescription' ||
            m.key === 'requires_prescription' ||
            m.key === '_needs_rx' // Match with mappers.ts
        );
        if (rxMeta && (rxMeta.value === 'yes' || rxMeta.value === 'true' || rxMeta.value === '1' || rxMeta.value === 'on')) {
            return true;
        }
    }

    // 2. Keyword fallback
    const name = product.name || '';
    const description = 'short_description' in product ? product.short_description || '' : '';

    // Keywords for prescription
    const keywords = [
        'antibiotico', 'antibiótico', 'bajo formula', 'bajo fórmula', 'controlado', 'venta bajo formula', 'formula medica',
        // Antibióticos Comunes
        'amoxicilina', 'clavulanico', 'ciprofloxacina', 'doxiciclina', 'azitromicina',
        'cefalexina', 'clindamicina', 'metronidazol', 'nitrofurantoina', 'claritromicina',
        'levofloxacina', 'eritromicina', 'gentamicina', 'trimetoprim', 'sulfametoxazol',
        'ampicilina', 'penicilina', 'rifampicina',
        // Controlados / Psiquiatría / Dolor Fuerte
        'tramadol', 'codeina', 'alprazolam', 'clonazepam', 'diazepam', 'lorazepam', 'midazolam', 'zolpidem',
        'morfina', 'oxicodona', 'hidrocodona', 'metadona', 'fentanilo',
        'pregabalina', 'gabapentina',
        // Dermatológicos Fuertes
        'isotretinoina',
        // Disfunción (A veces requiere)
        'sildenafil', 'tadalafil', 'vardenafil'
    ];
    const searchStr = (name + ' ' + description).toLowerCase();

    return keywords.some(k => searchStr.includes(k));
}

export const COLD_CHAIN_FEE = 12000;
