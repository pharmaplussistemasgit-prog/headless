import { getCategoryBySlug, getAllCategories } from '@/app/actions/products';
import { getCategoryTreeData } from '@/lib/woocommerce';
import ProductCard from '@/components/product/ProductCard';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Metadata } from 'next';
import Link from 'next/link';
import { getColdChainProducts } from '@/lib/business-logic';
import { ThermometerSnowflake, Info } from 'lucide-react';
import CategorySidebar from '@/components/category/CategorySidebar';

export const metadata: Metadata = {
    title: 'Cadena de Frío | PharmaPlus',
    description: 'Medicamentos refrigerados y especiales con control de temperatura garantizado.',
};

export default async function ColdChainPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const searchQuery = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;

    // Data Fetching
    const [products, categoryTree, category] = await Promise.all([
        getColdChainProducts(40, searchQuery),
        getCategoryTreeData(),
        getCategoryBySlug('cadena-de-frio')
    ]);

    // Fallback if category doesn't exist in WP
    const currentCategory = category || {
        id: 99999,
        name: 'Cadena de Frío',
        slug: 'cadena-de-frio',
        description: 'Productos refrigerados',
        count: 0,
        parent: 0
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            {/* Breadcrumbs */}
            <Breadcrumbs
                items={[
                    { label: 'Categorías', href: '#' },
                    { label: 'Cadena de Frío', href: `/categoria/cadena-de-frio` }
                ]}
            />

            <div className="flex flex-col md:flex-row gap-8 mt-6">

                {/* Sidebar Compartido con Lógica Virtual */}
                <CategorySidebar
                    currentCategory={currentCategory}
                    categoryTree={categoryTree}
                />

                {/* Main Content */}
                <main className="flex-1">
                    {/* Custom Header */}
                    <div className="bg-white rounded-2xl p-8 mb-8 border border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <ThermometerSnowflake className="w-48 h-48 text-blue-900" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                                <ThermometerSnowflake className="w-3.5 h-3.5" />
                                Especialidad Farmacéutica
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Cadena de Frío
                            </h1>
                            <p className="text-gray-500 max-w-2xl text-lg mb-6">
                                Selección especializada de medicamentos que requieren estricto control de temperatura.
                                Garantizamos la integridad del producto desde nuestra farmacia hasta tu hogar.
                            </p>

                            <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 max-w-xl">
                                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-800">
                                    <strong>Nota Importante:</strong> Estos productos se entregan en empaques térmicos especiales con geles refrigerantes para mantener la temperatura entre 2°C y 8°C.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Results Info and Clear Filter */}
                    {searchQuery && (
                        <div className="mb-6 flex items-center gap-4">
                            <h2 className="text-lg font-semibold text-gray-700">
                                Filtrando por: <span className="text-[var(--color-primary-blue)]">"{searchQuery}"</span>
                            </h2>
                            <Link
                                href="/categoria/cadena-de-frio"
                                className="text-sm text-red-500 hover:underline px-3 py-1 bg-white border border-red-100 rounded-full"
                            >
                                Borrar Filtro
                            </Link>
                        </div>
                    )}

                    {/* Products Grid */}
                    {products.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-700">
                                    Resultados ({products.length})
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl p-12 text-center border border-gray-100 border-dashed">
                            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                                <ThermometerSnowflake className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No encontramos productos</h3>
                            <p className="text-gray-500 mb-6">Intenta con otro término o verifica más tarde.</p>
                            {searchQuery && (
                                <Link
                                    href="/categoria/cadena-de-frio"
                                    className="text-[var(--color-action-blue)] font-bold hover:underline"
                                >
                                    Ver todos los productos de Cadena de Frío
                                </Link>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
