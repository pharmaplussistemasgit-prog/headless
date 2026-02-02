import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterState } from '@/lib/filterUtils';
import { CategoryTree } from '@/types/woocommerce';
import CategorySidebar from './CategorySidebar';
import FilterAccordion from './FilterAccordion';
import { PriceSlider } from '@/components/ui/price-slider';

interface SmartFilterSidebarProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    className?: string;
    categoryTree?: CategoryTree[];
    currentCategory?: CategoryTree;
}

export default function SmartFilterSidebar({
    filters,
    onFilterChange,
    className = '',
    categoryTree = [],
    currentCategory
}: SmartFilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. ARCHETYPE DETECTION
    const hasChildren = currentCategory?.children && currentCategory.children.length > 0;
    const isColdChain = currentCategory?.slug.includes('cadena-de-frio') || currentCategory?.slug.includes('frio');
    const isMassive = (currentCategory?.count || 0) > 1000;

    // Toggle Handlers
    const toggleBrand = (brandName: string) => {
        const newBrands = filters.brands.map(b =>
            b.name === brandName ? { ...b, active: !b.active } : b
        );
        onFilterChange({ ...filters, brands: newBrands });
    };

    const toggleUsage = (usageId: string) => {
        const newUsage = filters.usage.map(u =>
            u.id === usageId ? { ...u, active: !u.active } : u
        );
        onFilterChange({ ...filters, usage: newUsage });
    };

    const toggleCondition = (conditionId: string) => {
        const newCond = filters.conditions.map(c =>
            c.id === conditionId ? { ...c, active: !c.active } : c
        );
        onFilterChange({ ...filters, conditions: newCond });
    };

    // New: Toggle Tag
    const toggleTag = (tagSlug: string) => {
        // Handle filterUtils having 'tags' property now
        if (!filters.tags) return;
        const newTags = filters.tags.map(t =>
            t.slug === tagSlug ? { ...t, active: !t.active } : t
        );
        onFilterChange({ ...filters, tags: newTags });
    };

    // Handle Price
    const handlePriceChange = ([min, max]: [number, number]) => {
        onFilterChange({
            ...filters,
            activePriceRange: { min, max }
        });
    };

    const hasActiveFilters =
        filters.brands.some(b => b.active) ||
        filters.usage.some(u => u.active) ||
        filters.conditions.some(c => c.active) ||
        (filters.tags && filters.tags.some(t => t.active)) ||
        filters.activePriceRange.min > filters.priceRange.min ||
        filters.activePriceRange.max < filters.priceRange.max;

    const clearAll = () => {
        onFilterChange({
            ...filters,
            brands: filters.brands.map(b => ({ ...b, active: false })),
            usage: filters.usage.map(u => ({ ...u, active: false })),
            conditions: filters.conditions.map(c => ({ ...c, active: false })),
            tags: filters.tags ? filters.tags.map(t => ({ ...t, active: false })) : [],
            activePriceRange: { ...filters.priceRange }
        });
    };

    // Map data for Accordions
    const brandItems = filters.brands.map(b => ({ id: b.name, label: b.name, count: b.count, active: b.active }));
    const usageItems = filters.usage.map(u => ({ id: u.id, label: u.label, count: u.count, active: u.active }));
    const conditionItems = filters.conditions.map(c => ({ id: c.id, label: c.label, count: c.count, active: c.active }));

    // Safety check for tags
    const tagItems = filters.tags
        ? filters.tags.map(t => ({ id: t.slug, label: t.name, count: t.count, active: t.active }))
        : [];

    // Helper for Currency
    const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    // Calculate if there are ANY available filters to show (even if not active)
    const hasAnyFilters =
        brandItems.length > 0 ||
        usageItems.length > 0 ||
        conditionItems.length > 0 ||
        tagItems.length > 0 ||
        hasActiveFilters ||
        filters.priceRange.max > filters.priceRange.min;

    if (!hasAnyFilters && !hasChildren && !isColdChain) {
        return null; // Don't render anything if completely empty
    }

    return (
        <div className={`space-y-6 ${className}`}>

            {/* MODULE 1: ADAPTIVE NAVIGATION */}
            {hasChildren && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                        <h3 className="font-outfit font-bold text-[var(--color-primary-blue)] text-sm flex items-center gap-2">
                            📍 Explorar Categoría
                        </h3>
                    </div>
                    <div className="p-4">
                        <CategorySidebar
                            currentCategory={currentCategory!}
                            categoryTree={categoryTree}
                            embedded={true}
                        />
                    </div>
                </div>
            )}

            {/* MODULE 2: SPECIALTY BADGES */}
            {isColdChain && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-3 shadow-sm">
                    <div className="text-3xl">❄️</div>
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm">Manejo Especial</h4>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                            Productos refrigerados con cadena de frío garantizada.
                            Envío especializado.
                        </p>
                    </div>
                </div>
            )}

            {/* MODULE 3: FILTERS CONTAINER */}
            {hasAnyFilters && (
                <div className="space-y-4">
                    {/* Header Actions */}
                    <div className="flex justify-between items-center px-1">
                        <h3 className="font-outfit font-bold text-gray-800 text-lg">Filtros</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearAll}
                                className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider transition-colors"
                            >
                                Borrar Todo
                            </button>
                        )}
                    </div>

                    {/* SMART MENUS */}
                    <div className="space-y-4 pt-2">



                        {/* 1. LABORATORIOS */}
                        {brandItems.length > 0 && (
                            <FilterAccordion
                                title="Laboratorios"
                                items={brandItems}
                                onToggle={toggleBrand}
                                searchable={true}
                                icon={<span className="text-lg">🧬</span>}
                            />
                        )}

                        {/* 2. FORMA DE USO */}
                        {usageItems.length > 0 && (
                            <FilterAccordion
                                title="Forma de Uso"
                                items={usageItems}
                                onToggle={toggleUsage}
                                icon={<span className="text-lg">💊</span>}
                            />
                        )}

                        {/* 3. CONDICIÓN / NECESIDAD */}
                        {conditionItems.length > 0 && (
                            <FilterAccordion
                                title="Necesidad / Condición"
                                items={conditionItems}
                                onToggle={toggleCondition}
                                icon={<span className="text-lg">🩺</span>}
                            />
                        )}

                        {/* 4. OTRAS ETIQUETAS (All Tags) */}
                        {tagItems.length > 0 && (
                            <FilterAccordion
                                title="Etiquetas"
                                items={tagItems}
                                onToggle={toggleTag}
                                searchable={true}
                                icon={<span className="text-lg">🏷️</span>}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
