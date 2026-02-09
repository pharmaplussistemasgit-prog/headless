import { Suspense } from 'react';
import ProductGrid from '@/components/category/ProductGrid';
import { getProducts } from '@/lib/woocommerce';
import { Metadata } from 'next';
import { mapWooProduct } from '@/lib/mappers';
import { enrichProductsWithPromotions } from '@/lib/enrichProducts';
import { getPromotedProductSkus } from '@/services/promotions';

export const metadata: Metadata = {
    title: 'Mundo Ofertas - Promociones Pague X Lleve Y | PharmaPlus',
    description: 'Aprovecha nuestras promociones especiales "Pague X Lleve Y". Compra más, ahorra más en productos seleccionados con stock disponible.',
};

/**
 * Mundo Ofertas - Página de Promociones PTC
 * 
 * LÓGICA IMPLEMENTADA:
 * 1. Obtiene SKUs con promociones activas desde services/promotions.ts
 * 2. Filtra productos por SKU para obtener solo los promocionados
 * 3. Aplica filtro estricto de stock (instock only)
 * 4. Enriquece productos con datos de promoción
 * 
 * PRÓXIMOS PASOS (cuando API real esté disponible):
 * - Reemplazar mock en services/promotions.ts con fetch a:
 *   GET /wp-json/custom-api/v1/item-ptc
 */
async function OffersContent() {
    // 1. Obtener SKUs de productos con promociones activas
    const promotedSkus = await getPromotedProductSkus();

    if (promotedSkus.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h1 className="text-3xl font-bold text-[var(--color-pharma-blue)] mb-4">Mundo Ofertas</h1>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    No hay promociones activas en este momento. Vuelve pronto para descubrir nuestras ofertas especiales.
                </p>
            </div>
        );
    }

    // 2. Obtener productos por SKU con filtro de stock
    // NOTA: WooCommerce API no soporta filtro directo por múltiples SKUs,
    // por lo que obtenemos todos los productos en stock y filtramos después
    const { products: rawProducts } = await getProducts({
        perPage: 100,
        stockStatus: 'instock', // CRÍTICO: Solo productos con stock
        orderby: 'popularity',
    });

    // 3. Mapear productos
    const allProducts = rawProducts.map((p: any) => mapWooProduct(p));

    // 4. Filtrar solo productos con promociones activas
    const promotedProducts = allProducts.filter(
        product => product.sku && promotedSkus.includes(product.sku)
    );

    // 5. Enriquecer con datos de promoción
    const enrichedProducts = await enrichProductsWithPromotions(promotedProducts);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-pharma-blue)] mb-4">
                    🎁 Mundo Ofertas
                </h1>
                <p className="text-slate-600 max-w-2xl">
                    Aprovecha nuestras promociones especiales <strong>"Pague X Lleve Y"</strong>.
                    Compra más unidades y recibe productos adicionales gratis.
                    Todas las promociones aplican solo para productos con stock disponible.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
                    <span className="text-lg">🎯</span>
                    {enrichedProducts.length} {enrichedProducts.length === 1 ? 'producto' : 'productos'} con promoción activa
                </div>
            </div>

            {enrichedProducts.length > 0 ? (
                <ProductGrid products={enrichedProducts} />
            ) : (
                <div className="text-center py-12 text-slate-500">
                    <p>No hay productos con promociones activas en este momento.</p>
                </div>
            )}
        </div>
    );
}

export default function OffersPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Suspense fallback={
                <div className="p-12 text-center text-slate-500">
                    <div className="animate-pulse">Cargando promociones...</div>
                </div>
            }>
                <OffersContent />
            </Suspense>
        </div>
    );
}
