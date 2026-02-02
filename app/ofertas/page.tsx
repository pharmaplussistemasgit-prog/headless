import { Suspense } from 'react';
import ProductGrid from '@/components/category/ProductGrid';
import { getOnSaleProducts } from '@/lib/woocommerce';
import { Metadata } from 'next';
import { mapWooProduct } from '@/lib/mappers';

export const metadata: Metadata = {
    title: 'Mundo Ofertas | PharmaPlus',
    description: 'Encuentra las mejores promociones, descuentos y ofertas especiales en PharmaPlus.',
};

// We fetch strictly "Offer" products (on_sale: true).
async function OffersContent() {
    // Strategy: Fetch products that heavily strictly comply with on_sale = true
    const { products: rawProducts } = await getOnSaleProducts(1, 24);
    const products = rawProducts.map((p: any) => mapWooProduct(p));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-pharma-blue)] mb-4">Mundo Ofertas</h1>
                <p className="text-slate-600 max-w-2xl">
                    Aprovecha nuestras promociones especiales "Pague X Lleve Y" y descuentos exclusivos pensados para tu bienestar.
                </p>
            </div>

            {/* 
              In the future, we should verify filteredProducts via `getProductPromo` 
              before rendering to only show actual promos.
            */}
            <ProductGrid products={products} />
        </div>
    );
}

export default function OffersPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando ofertas...</div>}>
                <OffersContent />
            </Suspense>
        </div>
    );
}
