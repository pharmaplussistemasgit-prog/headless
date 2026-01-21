'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import SmartFilterSidebar from '@/components/category/SmartFilterSidebar';
import { analyzeProductsForFilters, applyFilters, FilterState } from '@/lib/filterUtils';
import { CategoryTree } from '@/types/woocommerce';

interface CategoryCatalogueProps {
    initialProducts: any[];
    categoryName: string;
    categorySlug: string;
    page: number;
    totalPages: number;
    searchParams?: { [key: string]: string | string[] | undefined };
    categoryTree: CategoryTree[];
}

export default function CategoryCatalogue({
    initialProducts,
    categoryName,
    categorySlug,
    page,
    totalPages,
    searchParams,
    categoryTree
}: CategoryCatalogueProps) {

    // Helper to build pagination links
    const getPageUrl = (newPage: number) => {
        const params = new URLSearchParams();
        if (searchParams?.min_price) params.set('min_price', searchParams.min_price as string);
        if (searchParams?.max_price) params.set('max_price', searchParams.max_price as string);
        params.set('page', newPage.toString());
        return `/categoria/${categorySlug}?${params.toString()}`;
    };

    // Initialize filters based on the loaded products
    const initialFilterState = useMemo(() => analyzeProductsForFilters(initialProducts), [initialProducts]);
    const [filters, setFilters] = useState<FilterState>(initialFilterState);

    // Recalculate filters if initialProducts changes (e.g. pagination)
    useEffect(() => {
        setFilters(analyzeProductsForFilters(initialProducts));
    }, [initialProducts]);

    // Apply active filters to the product list
    const filteredProducts = useMemo(() => {
        return applyFilters(initialProducts, filters);
    }, [initialProducts, filters]);

    const hasActiveFilters =
        filters.brands.some(b => b.active) ||
        filters.usage.some(u => u.active) ||
        filters.conditions.some(c => c.active);

    // Find the real active category node from the tree
    const activeCategoryNode = useMemo(() => {
        const findInTree = (nodes: CategoryTree[]): CategoryTree | null => {
            for (const node of nodes) {
                if (node.slug === categorySlug) return node;
                if (node.children) {
                    const found = findInTree(node.children);
                    if (found) return found;
                }
            }
            return null;
        };

        // Special case: Try to match by slug or partial slug if needed
        return findInTree(categoryTree) || {
            name: categoryName,
            slug: categorySlug,
            id: 0,
            count: 0,
            description: '',
            parent: 0,
            children: []
        } as CategoryTree;
    }, [categoryTree, categorySlug, categoryName]);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Dinámico (Adaptive System) */}
            <div className="w-full md:w-64 flex-shrink-0">
                <SmartFilterSidebar
                    filters={filters}
                    onFilterChange={setFilters}
                    categoryTree={categoryTree}
                    currentCategory={activeCategoryNode}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--color-primary-blue)] mb-2 capitalize">
                        {categoryName}
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Mostrando {filteredProducts.length} de {initialProducts.length} productos cargados
                    </p>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Pagination Controls (Server Side Navigation) */}
                        {totalPages > 1 && !hasActiveFilters && (
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

                        {hasActiveFilters && totalPages > 1 && (
                            <div className="mt-8 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100 text-center">
                                Nota: Los filtros se aplican a los productos de la página actual. Navega a otras páginas para ver más productos.
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-100 border-dashed">
                        <div className="text-5xl mb-4">🧪</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No hay productos con estos filtros</h3>
                        <p className="text-gray-500 mb-6">
                            Intenta ajustar tus criterios de búsqueda o limpiar los filtros.
                        </p>
                        <button
                            onClick={() => setFilters(initialFilterState)}
                            className="text-[var(--color-pharma-blue)] font-semibold hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
