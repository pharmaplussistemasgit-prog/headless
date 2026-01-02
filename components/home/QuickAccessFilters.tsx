'use client';

import Link from 'next/link';
import { Pill, Heart, Baby, Eye, Apple, Sparkles, ShoppingBag, Stethoscope } from 'lucide-react';

interface CategoryFilter {
    id: string;
    name: string;
    slug: string;
    icon: React.ElementType;
    color: string;
}

const CATEGORY_FILTERS: CategoryFilter[] = [
    {
        id: '1',
        name: 'Medicamentos',
        slug: 'medicamentos',
        icon: Pill,
        color: 'text-blue-600',
    },
    {
        id: '2',
        name: 'Dermocosmética',
        slug: 'dermocosmetica',
        icon: Sparkles,
        color: 'text-purple-600',
    },
    {
        id: '3',
        name: 'Cuidado Personal',
        slug: 'cuidado-personal',
        icon: Heart,
        color: 'text-pink-600',
    },
    {
        id: '4',
        name: 'Nutrición',
        slug: 'nutricion',
        icon: Apple,
        color: 'text-green-600',
    },
    {
        id: '5',
        name: 'Salud Visual',
        slug: 'salud-visual',
        icon: Eye,
        color: 'text-cyan-600',
    },
    {
        id: '6',
        name: 'Bebé y Mamá',
        slug: 'bebe-mama',
        icon: Baby,
        color: 'text-yellow-600',
    },
    {
        id: '7',
        name: 'Bienestar',
        slug: 'bienestar',
        icon: Stethoscope,
        color: 'text-teal-600',
    },
    {
        id: '8',
        name: 'Más Categorías',
        slug: 'tienda',
        icon: ShoppingBag,
        color: 'text-gray-600',
    },
];

export default function QuickAccessFilters() {
    return (
        <div className="w-full bg-white border-b border-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Title */}
                <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-pharma-blue)] mb-6 text-center md:text-left">
                    Explora por Categoría
                </h2>

                {/* Category Grid - Desktop / Horizontal Scroll - Mobile */}
                <div className="relative">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-3">
                        {CATEGORY_FILTERS.map((category) => {
                            const IconComponent = category.icon;

                            return (
                                <Link
                                    key={category.id}
                                    href={`/categoria/${category.slug}`}
                                    className="group flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-[var(--color-pharma-blue)] hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
                                >
                                    {/* Icon Circle */}
                                    <div className={`w-14 h-14 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center mb-3 transition-colors ${category.color}`}>
                                        <IconComponent className="w-7 h-7" />
                                    </div>

                                    {/* Category Name */}
                                    <span className="text-xs md:text-sm font-medium text-[var(--color-text-body)] group-hover:text-[var(--color-pharma-blue)] text-center transition-colors leading-tight">
                                        {category.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile: Horizontal Scroll Hint */}
                <div className="md:hidden mt-4 text-center">
                    <p className="text-xs text-gray-400">
                        Desliza para ver más categorías →
                    </p>
                </div>
            </div>
        </div>
    );
}
