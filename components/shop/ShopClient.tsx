'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { FiltersSidebar } from '@/components/shop/FiltersSidebar';
import {
    SlidersHorizontal,
    X,
    ArrowRight,
    Filter,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Heart,
    Sparkles,
    Baby,
    Apple,
    Dumbbell,
    Sun,
    Cross,
    BriefcaseMedical,
    SprayCan,
    Smile,
    Zap,
    Flame
} from "lucide-react";
import { Category, Product, Tag, AttributeWithTerms } from '@/types/woocommerce';
import { ProductAttribute } from '@/types/woocommerce';

// Helper to get category styles
const getCategoryStyle = (slug: string) => {
    switch (slug.toLowerCase()) {
        case 'salud-y-medicamentos':
        case 'medicamentos':
            return { icon: Heart, color: 'text-red-500', bg: 'bg-red-100' };
        case 'dermocosmetico':
        case 'belleza':
            return { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-100' };
        case 'cuidado-personal':
            return { icon: SprayCan, color: 'text-blue-500', bg: 'bg-blue-100' };
        case 'bebe':
        case 'maternidad':
            return { icon: Baby, color: 'text-pink-500', bg: 'bg-pink-100' };
        case 'nutricion':
        case 'alimentos':
            return { icon: Apple, color: 'text-green-500', bg: 'bg-green-100' };
        case 'salud-visual':
            return { icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100' };
        case 'bienestar-sexual':
            return { icon: Flame, color: 'text-rose-500', bg: 'bg-rose-100' };
        default:
            return { icon: Cross, color: 'text-[var(--color-primary-blue)]', bg: 'bg-blue-50' };
    }
};

interface ShopClientProps {
    initialProducts: Product[];
    categories: Category[];
    tags: Tag[];
    attributes: AttributeWithTerms[];
    totalPages: number;
    currentPage: number;
}

export function ShopClient({ initialProducts, categories, tags, attributes, totalPages, currentPage }: ShopClientProps) {
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

    // Attributes robust mapping: If no global attributes are passed (id > 0),
    // we extract them from the products themselves (local attributes id = 0 or missing globals)
    const finalAttributes = useMemo(() => {
        if (attributes && attributes.length > 0) return attributes;

        // Fallback: Extract from products
        const attrMap = new Map<string, { id: number; name: string; slug: string; options: Set<string> }>();

        initialProducts.forEach(p => {
            p.attributes.forEach(a => {
                const key = a.name.toLowerCase();
                if (!attrMap.has(key)) {
                    attrMap.set(key, {
                        id: a.id,
                        name: a.name,
                        slug: a.name.toLowerCase().replace(/\s+/g, '-'),
                        options: new Set()
                    });
                }
                a.options.forEach(opt => attrMap.get(key)?.options.add(opt));
            });
        });

        // Convert locally extracted map to AttributeWithTerms[]
        const extracted: AttributeWithTerms[] = [];
        attrMap.forEach((val) => {
            // Only include robust attributes like Marca/Laboratorio for now to avoid noise
            if (['marca', 'laboratorio', 'color', 'talla'].includes(val.name.toLowerCase())) {
                extracted.push({
                    attribute: { id: val.id || 0, name: val.name, slug: val.slug, options: [] },
                    terms: Array.from(val.options).map((opt, idx) => ({
                        id: idx, // Fake ID for local term
                        name: opt,
                        slug: opt.toLowerCase().replace(/\s+/g, '-'),
                        count: 0 // We could compute count but 0 is fine for now
                    }))
                });
            }
        });

        // If "Marca" or "Laboratorio" found, priorize them
        return extracted;
    }, [attributes, initialProducts]);

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

            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-[100px] py-8 flex items-start gap-8">

                {/* DESKTOP SIDEBAR - STANDARD STICKY */}
                <div className="hidden md:block w-64 flex-shrink-0 sticky top-24 h-fit">
                    <FiltersSidebar
                        categories={categories}
                        tags={tags}
                        attributes={finalAttributes}
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
                                className="px-6 py-2 bg-[var(--color-pharma-blue)] text-white font-medium rounded-full hover:bg-[var(--color-blue-classic)] transition-colors shadow-md"
                            >
                                Ver todos los productos
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                                        tags: product.tags || [],
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-6">
                            {/* Prev Button */}
                            <button
                                disabled={currentPage <= 1}
                                onClick={() => router.push(`?${new URLSearchParams({ ...currentParams, page: (currentPage - 1).toString() }).toString()}`)}
                                className={`px-6 py-2.5 rounded-full font-extrabold transition-all flex items-center gap-2 shadow-sm ${currentPage <= 1
                                    ? 'bg-gray-50 border-2 border-gray-100 text-gray-300 cursor-not-allowed'
                                    : 'bg-white border-2 border-[var(--color-pharma-blue)] text-[var(--color-pharma-blue)] hover:bg-blue-50 hover:shadow-md active:scale-95'
                                    }`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Anterior
                            </button>

                            {/* Page Info */}
                            <span className="text-[var(--color-pharma-blue)] font-bold px-6 py-2.5 bg-blue-50/50 rounded-full">
                                Página {currentPage} de {totalPages}
                            </span>

                            {/* Next Button */}
                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() => router.push(`?${new URLSearchParams({ ...currentParams, page: (currentPage + 1).toString() }).toString()}`)}
                                className={`px-6 py-2.5 rounded-full font-extrabold transition-all flex items-center gap-2 shadow-sm ${currentPage >= totalPages
                                    ? 'bg-gray-50 border-2 border-gray-100 text-gray-300 cursor-not-allowed'
                                    : 'bg-[var(--color-pharma-blue)] border-2 border-[var(--color-pharma-blue)] text-white hover:bg-[var(--color-blue-classic)] hover:border-[var(--color-blue-classic)] hover:shadow-md active:scale-95'
                                    }`}
                            >
                                Siguiente
                                <ChevronRight className="w-5 h-5" />
                            </button>
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
                                attributes={finalAttributes}
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
