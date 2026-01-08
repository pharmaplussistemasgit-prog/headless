'use client';

import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CategoryTree } from '@/types/woocommerce';
import { MappedCategory } from '@/types/product';
import { VIRTUAL_SUBCATEGORIES } from '@/lib/constants';

interface CategorySidebarProps {
    currentCategory: MappedCategory;
    categoryTree: CategoryTree[];
}

export default function CategorySidebar({ currentCategory, categoryTree }: CategorySidebarProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Estado para el filtro de precio
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

    // Encontrar el contexto de la categoría actual en el árbol
    const findCategoryContext = (tree: CategoryTree[], targetId: number): { siblings: CategoryTree[], children: CategoryTree[], parent: CategoryTree | null } | null => {
        for (const node of tree) {
            if (node.id === targetId) {
                return { siblings: tree, children: node.children || [], parent: null };
            }
            if (node.children && node.children.length > 0) {
                const foundInChildren = findCategoryContext(node.children, targetId);
                if (foundInChildren) {
                    // Si se encontró en los hijos, y el padre era null en el retorno recursivo, entonces 'node' es el padre directo
                    if (!foundInChildren.parent) {
                        return { ...foundInChildren, parent: node, siblings: node.children };
                    }
                    return foundInChildren;
                }
            }
        }
        return null; // No encontrado en este nivel
    };

    // Buscamos el nodo activo para determinar qué mostrar
    // 1. Si tiene hijos -> Mostrar Hijos
    // 2. Si no tiene hijos -> Mostrar Hermanos (y marcar activo)
    const context = findCategoryContext(categoryTree, currentCategory.id);

    let categoriesToShow: CategoryTree[] = [];
    let title = "Categorías";
    let backLink: { href: string, label: string } | null = null;

    if (context) {
        if (context.children && context.children.length > 0) {
            categoriesToShow = context.children;
            title = currentCategory.name; // "Explora [Categoría]"
            if (context.parent) {
                backLink = { href: `/categoria/${context.parent.slug}`, label: `Volver a ${context.parent.name}` };
            } else {
                backLink = { href: `/`, label: `Volver al Inicio` }; // O a una página de "Todas las categorías"
            }
        } else {
            // Es una hoja (no tiene hijos), mostramos sus hermanos
            categoriesToShow = context.siblings;
            if (context.parent) {
                title = context.parent.name;
                backLink = { href: `/categoria/${context.parent.slug}`, label: `Volver a ${context.parent.name}` };
            } else {
                // Caso raro: Root sin hijos, mostramos roots
                title = "Categorías Principales";
            }
        }
    } else {
        // Fallback: mostrar raíces si algo falla
        categoriesToShow = categoryTree;
    }

    // Lógica para Subcategorías Virtuales (e.g., Cadena de Frío)
    // Si estamos en una categoría que tiene virtuales definidas, las mostramos en lugar de (o además de) lo estándar.
    // Asumimos que si hay virtuales, queremos que el usuario navegue por ellas.
    const virtuals = VIRTUAL_SUBCATEGORIES[currentCategory.slug];
    const hasVirtuals = virtuals && virtuals.length > 0;

    // Si hay virtuales, reemplazamos 'categoriesToShow' con una estructura adaptada
    // Nota: Esto es visual. Los links deben funcionar como filtros.
    const displayItems = hasVirtuals ? virtuals.map(v => ({
        id: Math.random(), // ID temporal
        name: v.name,
        slug: currentCategory.slug, // Mantenemos el slug de categoría base
        parent: currentCategory.id,
        count: 0,
        isVirtual: true,
        query: v.query
    })) : categoriesToShow;

    // Ajustamos título si usamos virtuales
    if (hasVirtuals) {
        title = `Explora ${currentCategory.name}`;
    }

    const handlePriceFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (minPrice) params.set('min_price', minPrice);
        else params.delete('min_price');

        if (maxPrice) params.set('max_price', maxPrice);
        else params.delete('max_price');

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border-2 border-[var(--color-pharma-blue)] shadow-[0_0_15px_rgba(0,80,216,0.1)] p-6 sticky top-24">

                {backLink && (
                    <Link href={backLink.href} className="text-xs text-gray-400 hover:text-[var(--color-primary-blue)] mb-4 flex items-center transition-colors">
                        ← {backLink.label}
                    </Link>
                )}

                <h3 className="font-bold text-[var(--color-primary-blue)] mb-4 pb-2 border-b border-gray-100">
                    {title}
                </h3>

                <ul className="space-y-2 mb-8">
                    {displayItems.map((item: any) => (
                        <li key={item.id}>
                            <Link
                                href={item.isVirtual
                                    ? `/categoria/${item.slug}?search=${item.query}`
                                    : `/categoria/${item.slug}`}
                                className={`block py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                                    // Highlight logic: if virtual, check search param. If standard, check slug.
                                    (item.isVirtual
                                        ? searchParams.get('search') === item.query
                                        : item.slug === currentCategory.slug)
                                        ? 'bg-blue-50 text-[var(--color-primary-blue)]'
                                        : 'text-gray-600 hover:text-[var(--color-action-blue)] hover:bg-gray-50'
                                    }`}
                            >
                                {item.name}
                                {!item.isVirtual && item.count ? <span className="text-xs text-gray-300 ml-1">({item.count})</span> : null}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Filtros */}
                <div className="pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-sm text-gray-700 mb-3">Precio</h4>
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            type="number"
                            placeholder="Min"
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:border-[var(--color-action-blue)] focus:outline-none"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:border-[var(--color-action-blue)] focus:outline-none"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handlePriceFilter}
                        className="w-full py-1.5 text-sm bg-[var(--color-pharma-blue)] text-white rounded-md hover:bg-[var(--color-blue-classic)] transition-colors shadow-sm"
                    >
                        Filtrar
                    </button>
                </div>

            </div>
        </aside>
    );
}
