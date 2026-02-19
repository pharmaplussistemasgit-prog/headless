import { WooProduct, MappedProduct } from "@/types/product";

/**
 * Función pura para transformar un producto de WooCommerce en un objeto limpio para la UI.
 * Maneja la extracción segura de metadatos farmacéuticos.
 */
export function mapWooProduct(p: WooProduct): MappedProduct {
    // Helper: Normalize key for comparison
    const normalize = (k: string) => k.toLowerCase().trim().replace(/_/g, '');

    // 1. Extraer Metadatos (Robust Strategy)
    const findValue = (keys: string[]) => {
        const normalizedKeys = keys.map(normalize);

        // A. Check meta_data
        if (p.meta_data && Array.isArray(p.meta_data)) {
            const meta = p.meta_data.find(m => normalizedKeys.includes(normalize(m.key)));
            if (meta && meta.value) return meta.value;
        }

        // B. Check attributes
        if (p.attributes && Array.isArray(p.attributes)) {
            const attr = p.attributes.find(a => normalizedKeys.includes(normalize(a.name)));
            if (attr && attr.options && attr.options.length > 0) return attr.options[0];
        }

        // C. Check top-level properties (some custom APIs)
        for (const key of keys) {
            if ((p as any)[key]) return (p as any)[key];
            const lowerKey = key.toLowerCase();
            if ((p as any)[lowerKey]) return (p as any)[lowerKey];
        }

        return null;
    };

    const brand = findValue(['_marca', 'Marca', 'Laboratorio', 'Brand', 'Manufacturer']);
    const invima = findValue(['_registro_invima', 'Registro Invima', 'Invima', 'Registro']);
    const productType = findValue(['_tipo_de_producto', 'Tipo de Producto', 'Tipo', 'Clasificación']);

    // 1b. Lógica de Receta Médica (Metadatos + Categorías + Palabras Clave)
    const rawRx = findValue(['_needs_rx', 'needs_rx', 'receta_medica', 'receta']);
    const isMetaRx = rawRx === 'true' || rawRx === true || rawRx === 'on' || rawRx === 'yes';

    const rxKeywords = [
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
    const rxCategories = ['antibioticos', 'medicamentos-controlados', 'formula-medica', 'bajo-formula'];

    const hasRxCategory = p.categories?.some(c => rxCategories.some(slug => c.slug.includes(slug)));
    const hasRxKeyword = rxKeywords.some(k => (p.name || '').toLowerCase().includes(k));

    const requiresRx = isMetaRx || hasRxCategory || hasRxKeyword;
    // ID: 3368, Slug: cadena-de-frio
    const hasColdChainCategory = p.categories?.some(c => c.slug === 'cadena-de-frio' || c.id === 3368);

    // 41-42: Category Logic (already defined above)

    // Legacy/Backup metadata check (kept for safety but Category is primary)
    const rawCold = findValue(['_cadena_de_frio', 'cadena_de_frio', 'refrigerado']);
    const isMetaDataCold = rawCold === 'true' || rawCold === true || rawCold === 'on' || rawCold === 'yes';

    const isRefrigerated = hasColdChainCategory || isMetaDataCold;

    // 2. Precios y Stock
    const price = parseInt(p.price || '0', 10);
    const regularPrice = parseInt(p.regular_price || p.price || '0', 10);
    const isOnSale = price < regularPrice;

    let discountPercentage = null;
    if (isOnSale && regularPrice > 0) {
        discountPercentage = Math.round(((regularPrice - price) / regularPrice) * 100);
    }

    const stock = p.stock_quantity;
    // Strict logic requested by user:
    // Product MUST have explicit stock quantity > 0 to be purchasable.
    // 'instock' status alone is NOT enough if quantity is null or 0.
    const isInStock = p.stock_status === 'instock' && stock !== null && stock > 0;
    const showExactStock = stock !== null && stock < 10 && stock > 0;

    // 3. Imágenes
    const images = (p.images || []).map(img => img.src);
    if (images.length === 0) images.push('/placeholder-product.png');

    // Promotion Data (PTC)
    let promotion = null;
    if (p.ptc_rule && p.ptc_rule.is_active) {
        promotion = {
            description: p.ptc_rule.display_label,
            rule: {
                itemId: p.sku || '',
                giftItemId: p.ptc_rule.gift_sku,
                buyQuantity: p.ptc_rule.buy_x,
                receiveQuantity: p.ptc_rule.get_y,
                startDate: '', // Not strictly needed for UI unless we show countdown
                endDate: '',   // Not strictly needed for UI unless we show countdown
            }
        };
    }

    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku || null,
        price,
        regularPrice,
        isOnSale,
        stock,
        isInStock,
        showExactStock,
        images,
        categories: p.categories || [],
        tags: p.tags || [],
        shortDescription: p.short_description || '', // Se enviará HTML crudo para renderizar con precaución o limpiar
        brand,
        invima,
        productType,
        requiresRx,
        isRefrigerated,
        discountPercentage,
        dateOnSaleFrom: p.date_on_sale_from || null,
        dateOnSaleTo: p.date_on_sale_to || null,
        averageRating: p.average_rating || null,
        ratingCount: p.rating_count || 0,
        promotion,
    };
}
