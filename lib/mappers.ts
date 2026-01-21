import { WooProduct, MappedProduct } from "@/types/product";

/**
 * Función pura para transformar un producto de WooCommerce en un objeto limpio para la UI.
 * Maneja la extracción segura de metadatos farmacéuticos.
 */
export function mapWooProduct(p: WooProduct): MappedProduct {
    // 1. Extraer Metadatos
    const getMeta = (key: string) => p.meta_data?.find(m => m.key === key)?.value;

    const brand = getMeta('_marca') || getMeta('Marca') || null;
    const invima = getMeta('_registro_invima') || null;
    const productType = getMeta('_tipo_de_producto') || null;

    // Manejo robusto de booleanos que pueden venir como strings "yes", "on", "true"
    const rawRx = getMeta('_needs_rx');
    const requiresRx = rawRx === 'true' || rawRx === true || rawRx === 'on' || rawRx === 'yes';

    const rawCold = getMeta('_cadena_de_frio');
    const isRefrigerated = rawCold === 'true' || rawCold === true || rawCold === 'on' || rawCold === 'yes';

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
        discountPercentage
    };
}
