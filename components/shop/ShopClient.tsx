'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { FiltersSidebar } from '@/components/shop/FiltersSidebar';
import { SlidersHorizontal, X, ArrowRight } from 'lucide-react';
import { Category, Product, Tag, AttributeWithTerms } from '@/types/woocommerce';

interface ShopClientProps {
    initialProducts: Product[];
    categories: Category[];
    tags: Tag[];
    attributes: AttributeWithTerms[];
}

export function ShopClient({ initialProducts, categories, tags, attributes }: ShopClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // UI states
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Construct selected filters object from searchParams
    const selectedFilters = {
        category: searchParams.getAll('category'),
        tag: searchParams.getAll('tag'),
        search: searchParams.get('q') || undefined,
        price_min: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
        price_max: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
        attr_linea: searchParams.getAll('attr_linea'),
        attr_color: searchParams.getAll('attr_color'),
        attr_talla: searchParams.getAll('attr_talla'),
    };

    // Convert searchParams to record for the Sidebar helper
    // We manually construct this to match what FiltersSidebar expects
    const currentParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        // If multiple values exist, we take the last one or handled by getAll above
        // This record is mostly for non-array params reconstruction in simple links
        currentParams[key] = value;
    });

    // Prevent body scroll when mobile filter is open
    useEffect(() => {
        if (isMobileFiltersOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            setIsMobileFiltersOpen(false);
        };
    }, [isMobileFiltersOpen, searchParams]);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Header / Top Bar */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-[var(--color-primary-blue)] flex items-center gap-2">
                            Tienda
                            <span className="text-gray-500 font-medium text-sm normal-case">[{initialProducts.length} productos]</span>
                        </h1>
                    </div>

                    {/* Mobile Filter Button */}
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 text-[var(--color-primary-blue)] font-semibold rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <span>Filtros</span>
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>

                    {/* Reset Filters Link (Desktop) */}
                    {(selectedFilters.category?.length || selectedFilters.search) ? (
                        <button
                            onClick={() => router.push('/tienda')}
                            className="hidden md:block text-sm text-[var(--color-action-blue)] font-semibold hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-start gap-8">

                {/* DESKTOP SIDEBAR - PERMANENTLY VISIBLE */}
                <div className="hidden md:block w-72 flex-shrink-0 sticky top-24">
                    <FiltersSidebar
                        categories={categories}
                        tags={tags}
                        attributes={attributes}
                        selected={selectedFilters}
                        currentParams={currentParams}
                    />
                </div>

                {/* MAIN CONTENT GRID */}
                <main className="flex-1 w-full">
                    {initialProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <h2 className="text-xl font-semibold text-[var(--color-primary-blue)] mb-2">Sin resultados</h2>
                            <p className="text-gray-500 mb-6">No encontramos productos con estos filtros.</p>
                            <button
                                onClick={() => router.push('/tienda')}
                                className="px-6 py-2 bg-[var(--color-primary-blue)] text-white font-medium rounded-full hover:bg-[var(--color-dark-blue)] transition-colors shadow-md"
                            >
                                Ver todos los productos
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {initialProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={{
                                        id: product.id,
                                        name: product.name,
                                        slug: product.slug,
                                        sku: product.sku || '',
                                        price: Number(product.price || 0),
                                        regularPrice: Number(product.regular_price || 0),
                                        isOnSale: product.sale_price !== product.regular_price && !!product.sale_price,
                                        stock: product.stock_quantity || 0,
                                        isInStock: product.stock_status === 'instock',
                                        showExactStock: (product.stock_quantity || 0) < 10,
                                        images: product.images?.map(img => img.src) || [],
                                        categories: product.categories || [],
                                        shortDescription: product.short_description || '',
                                        brand: product.attributes?.find((a: any) => a.name.toLowerCase() === 'marca')?.options[0] || null,
                                        invima: null,
                                        productType: null,
                                        requiresRx: false,
                                        isRefrigerated: false,
                                        discountPercentage: product.sale_price ? Math.round(((Number(product.regular_price) - Number(product.sale_price)) / Number(product.regular_price)) * 100) : null
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* MOBILE FILTER DRAWER */}
            {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileFiltersOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative w-[320px] h-full bg-white shadow-2xl overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-[var(--color-primary-blue)]">Filtros</h2>
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4">
                            <FiltersSidebar
                                categories={categories}
                                tags={tags}
                                attributes={attributes}
                                selected={selectedFilters}
                                currentParams={currentParams}
                            />
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="w-full py-3 bg-[var(--color-action-green)] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <span>Ver {initialProducts.length} Resultados</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
