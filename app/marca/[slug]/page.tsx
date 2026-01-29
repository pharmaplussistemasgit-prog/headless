import { FEATURED_BRANDS } from '@/lib/brands-data';
import { getProducts } from '@/lib/woocommerce';
import ProductCard from '@/components/product/ProductCard';
import { mapWooProduct } from '@/lib/mappers';
import { WooProduct } from '@/types/product';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour

interface PageProps {
    params: Promise<{
        slug: string;
    }>
}

export default async function BrandPage({ params }: PageProps) {
    const { slug } = await params;

    // 1. Find Brand Configuration
    const brandConfig = FEATURED_BRANDS.find(b => b.slug === slug);

    // 2. Determine Search Query
    // Use mapped searchTerm if available, otherwise fallback to slug (replacing dashes)
    const searchQuery = brandConfig?.searchTerm || slug.replace(/-/g, ' ');
    const displayTitle = brandConfig?.title || slug.replace(/-/g, ' ').toUpperCase();

    // 3. Fetch Products
    const { products } = await getProducts({
        search: searchQuery,
        perPage: 20,
        orderby: 'popularity'
    });

    return (
        <div className="bg-[var(--color-bg-light)] min-h-screen pb-12">

            {/* Breadcrumb Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-[var(--color-pharma-blue)]">Inicio</Link>
                        <span>/</span>
                        <span className="font-bold text-gray-800 capitalize">{slug.replace(/-/g, ' ')}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Brand Header */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-6">
                    {brandConfig ? (
                        <div className="w-32 h-32 flex-shrink-0 bg-white border border-gray-100 rounded-lg flex items-center justify-center p-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={brandConfig.url}
                                alt={brandConfig.alt}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    ) : null}

                    <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
                            {displayTitle}
                        </h1>
                        <p className="text-gray-500">
                            Explora nuestra selección de productos de {searchQuery}.
                        </p>
                    </div>
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={mapWooProduct(product as unknown as WooProduct)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                        <p className="text-xl text-gray-500 mb-4">No encontramos productos para esta marca en este momento.</p>
                        <Link
                            href="/tienda"
                            className="inline-block px-6 py-2 bg-[var(--color-pharma-blue)] text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
                        >
                            Ver todos los productos
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
