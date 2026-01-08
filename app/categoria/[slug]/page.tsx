import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsByCategory } from '@/app/actions/products';
import { getCategoryTreeData } from '@/lib/woocommerce';
import CategorySidebar from '@/components/category/CategorySidebar';
import ProductCard from '@/components/product/ProductCard';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) return { title: 'Categoría no encontrada' };

    return {
        title: `${category.name} | PharmaPlus`,
        description: `Compra productos de ${category.name} en línea. Envíos a todo el país.`,
    };
}

export default async function CategoryPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const minPrice = typeof resolvedSearchParams.min_price === 'string' ? resolvedSearchParams.min_price : undefined;
    const maxPrice = typeof resolvedSearchParams.max_price === 'string' ? resolvedSearchParams.max_price : undefined;
    const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;

    const category = await getCategoryBySlug(slug);

    if (!category) {
        notFound();
    }

    const [{ products, totalPages }, categoryTree] = await Promise.all([
        getProductsByCategory(category.id, { minPrice, maxPrice, page, perPage: 12 }),
        getCategoryTreeData()
    ]);

    // Helper to build pagination links
    const getPageUrl = (newPage: number) => {
        const params = new URLSearchParams();
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);
        params.set('page', newPage.toString());
        return `/categoria/${slug}?${params.toString()}`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <Breadcrumbs
                items={[
                    { label: 'Categorías', href: '#' },
                    { label: category.name, href: `/categoria/${category.slug}` }
                ]}
            />

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Dinámico */}
                <CategorySidebar
                    currentCategory={category}
                    categoryTree={categoryTree}
                />

                {/* Main Content */}
                <main className="flex-1">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[var(--color-primary-blue)] mb-2 capitalize">
                            {category.name}
                        </h1>
                        {category.description && (
                            <p className="text-gray-500">{category.description}</p>
                        )}
                        <p className="text-sm text-gray-400 mt-2">
                            Mostrando {products.length} productos (Página {page} de {totalPages})
                        </p>
                    </div>

                    {/* Active Filters Display */}
                    {(minPrice || maxPrice) && (
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-500">Filtros activos:</span>
                            {minPrice && <span className="bg-blue-50 text-[var(--color-primary-blue)] px-2 py-1 rounded text-xs border border-blue-100">Min: ${parseInt(minPrice).toLocaleString()}</span>}
                            {maxPrice && <span className="bg-blue-50 text-[var(--color-primary-blue)] px-2 py-1 rounded text-xs border border-blue-100">Max: ${parseInt(maxPrice).toLocaleString()}</span>}
                            <Link href={`/categoria/${slug}`} className="text-xs text-red-400 hover:underline">Limpiar</Link>
                        </div>
                    )}

                    {/* Products Grid */}
                    {products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-6">
                                    <Link
                                        href={page > 1 ? getPageUrl(page - 1) : '#'}
                                        aria-disabled={page <= 1}
                                        className={`px-6 py-2.5 rounded-full font-extrabold transition-all flex items-center gap-2 shadow-sm ${page <= 1
                                            ? 'bg-gray-50 border-2 border-gray-100 text-gray-300 pointer-events-none'
                                            : 'bg-white border-2 border-[var(--color-pharma-blue)] text-[var(--color-pharma-blue)] hover:bg-blue-50 hover:shadow-md active:scale-95'
                                            }`}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        Anterior
                                    </Link>

                                    <span className="text-[var(--color-pharma-blue)] font-bold px-6 py-2.5 bg-blue-50/50 rounded-full">
                                        Página {page} de {totalPages}
                                    </span>

                                    <Link
                                        href={page < totalPages ? getPageUrl(page + 1) : '#'}
                                        aria-disabled={page >= totalPages}
                                        className={`px-6 py-2.5 rounded-full font-extrabold transition-all flex items-center gap-2 shadow-sm ${page >= totalPages
                                            ? 'bg-gray-50 border-2 border-gray-100 text-gray-300 pointer-events-none'
                                            : 'bg-[var(--color-pharma-blue)] border-2 border-[var(--color-pharma-blue)] text-white hover:bg-[var(--color-blue-classic)] hover:border-[var(--color-blue-classic)] hover:shadow-md active:scale-95'
                                            }`}
                                    >
                                        Siguiente
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-100 border-dashed">
                            <div className="text-5xl mb-4">💊</div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No encontramos productos</h3>
                            <p className="text-gray-500 mb-6">
                                {(minPrice || maxPrice)
                                    ? "Intenta ajustar los filtros de precio."
                                    : "Esta categoría parece estar vacía por el momento."}
                            </p>
                            <Link href="/" className="text-[var(--color-action-blue)] font-bold hover:underline">
                                Volver al Inicio
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
