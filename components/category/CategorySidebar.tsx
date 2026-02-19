'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { CategoryTree } from '@/types/woocommerce';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CategorySidebarProps {
    currentCategory: CategoryTree;
    categoryTree: CategoryTree[];
    embedded?: boolean;
}

export default function CategorySidebar({ currentCategory, categoryTree, embedded = false }: CategorySidebarProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);

    const renderCategoryItem = (item: CategoryTree, depth: number = 0) => {
        const isActive = pathname.includes(item.slug);

        return (
            <div key={item.id} className="w-full">
                <Link
                    href={`/categoria/${item.slug}`}
                    className={`
                        group flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200
                        ${isActive ? 'bg-blue-50/50' : 'hover:bg-gray-50'}
                    `}
                    style={{ marginLeft: depth > 0 ? `${depth * 1}rem` : '0' }}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Radio indicator */}
                        <div className={`
                            w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                            ${isActive
                                ? 'border-[var(--pharma-blue)] bg-[var(--pharma-blue)] shadow-[0_0_8px_rgba(0,80,216,0.2)]'
                                : 'border-gray-200 bg-white group-hover:border-[var(--pharma-blue)]'}
                        `}>
                            {isActive && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                        </div>

                        {/* Label */}
                        <span className={`
                            text-[13px] uppercase truncate
                            ${depth === 0
                                ? 'font-bold text-slate-700 tracking-tight'
                                : 'font-normal text-slate-500'}
                            ${isActive ? 'text-[var(--pharma-blue)]' : ''}
                        `}>
                            {item.name}
                        </span>
                    </div>

                    {/* Count */}
                    <span className="text-xs font-bold text-slate-300 ml-2">
                        {item.count}
                    </span>
                </Link>

                {/* Vertical line and children */}
                {item.children && item.children.length > 0 && (
                    <div className="relative ml-[1.35rem] py-1">
                        {/* Subtle vertical line for hierarchy */}
                        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-100" />
                        <div className="space-y-0.5">
                            {item.children.map(child => renderCategoryItem(child, depth + 1))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden">
            {/* Header 'DEPARTAMENTOS' */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 px-3 bg-white"
            >
                <h3 className="text-[15px] font-black text-[#1e3a8a] uppercase tracking-wide">
                    Departamentos
                </h3>
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[var(--pharma-blue)]">
                    {isOpen ? <ChevronUp size={14} strokeWidth={3} /> : <ChevronDown size={14} strokeWidth={3} />}
                </div>
            </button>

            {/* Tree Content */}
            {isOpen && (
                <div className="p-1 space-y-1">
                    {categoryTree.map(cat => renderCategoryItem(cat))}
                </div>
            )}
        </div>
    );
}
