'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Tag } from 'lucide-react';
import { CategoryTree } from '@/types/woocommerce';
import { getCategoryStyle } from '@/lib/category-styles';

interface MegaMenuProps {
    isOpen: boolean;
    categories: CategoryTree[];
    onClose: () => void;
}

export default function MegaMenu({ isOpen, categories, onClose }: MegaMenuProps) {
    const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(categories.length > 0 ? categories[0].id : null);
    const [hoveredSubCategoryId, setHoveredSubCategoryId] = useState<number | null>(null);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.99 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-0 w-[90vw] max-w-5xl bg-white rounded-b-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex h-[480px]"
                    onMouseLeave={onClose}
                >
                    {/* COL 1: PARENT CATEGORIES (Sidebar) */}
                    <div className="w-[260px] bg-white flex flex-col py-2 overflow-y-auto custom-scrollbar relative z-20 transition-all duration-300">
                        {categories.map((cat) => {
                            const catStyle = getCategoryStyle(cat.slug);
                            const Icon = catStyle.icon;
                            const isActive = hoveredCategoryId === cat.id;

                            return (
                                <Link
                                    key={cat.id}
                                    href={`/categoria/${cat.slug}`}
                                    onMouseEnter={() => {
                                        setHoveredCategoryId(cat.id);
                                        setHoveredSubCategoryId(null);
                                    }}
                                    onClick={onClose}
                                    className={`
                                        group relative px-4 py-2.5 cursor-pointer flex items-center justify-between transition-all duration-200 border-l-[3px]
                                        ${isActive
                                            ? `bg-[var(--bg-light)] ${catStyle.borderColor}`
                                            : 'hover:bg-[var(--bg-light)] border-transparent'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                                            ${isActive ? catStyle.bgColor : 'bg-slate-50 group-hover:bg-white inset-shadow-sm'}
                                        `}>
                                            <Icon className={`w-4 h-4 transition-colors ${isActive ? catStyle.iconColor : 'text-slate-500 group-hover:text-slate-700'}`} />
                                        </div>
                                        <span className={`text-[13px] capitalize transition-colors leading-snug ${isActive ? 'font-semibold text-[var(--color-text-dark)]' : 'font-medium text-[var(--color-text-body)] group-hover:text-[var(--color-text-dark)]'}`}>
                                            {cat.name.toLowerCase()}
                                        </span>
                                    </div>

                                    <ChevronRight className={`
                                        w-3.5 h-3.5 transition-all duration-200 
                                        ${isActive ? `${catStyle.iconColor} translate-x-0 opacity-100` : 'text-slate-400 opacity-50 group-hover:opacity-100 group-hover:text-slate-500'}
                                    `} />
                                </Link>
                            );
                        })}
                    </div>

                    {/* COL 2: CHILDREN (Level 2) */}
                    <div className="w-[280px] bg-[var(--bg-light)] border-r border-gray-100/50 overflow-y-auto custom-scrollbar relative z-10">
                        {categories.map((parentCat) => (
                            <div
                                key={parentCat.id}
                                className={hoveredCategoryId === parentCat.id ? 'flex flex-col h-full animate-fadeIn' : 'hidden'}
                            >
                                {/* Sticky Header */}
                                <div className="sticky top-0 bg-[var(--bg-light)]/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-100 mb-2">
                                    <Link
                                        href={`/categoria/${parentCat.slug}`}
                                        className="group flex items-center justify-between"
                                        onClick={onClose}
                                    >
                                        <div>
                                            <h3 className={`text-[14px] font-bold capitalize leading-tight ${getCategoryStyle(parentCat.slug).textColor}`}>
                                                {parentCat.name.toLowerCase()}
                                            </h3>
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                                                Ver todo
                                            </span>
                                        </div>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all bg-white shadow-sm group-hover:scale-105`}>
                                            <ChevronRight className={`w-3.5 h-3.5 ${getCategoryStyle(parentCat.slug).iconColor}`} />
                                        </div>
                                    </Link>
                                </div>

                                {/* Children List */}
                                <div className="px-2 pb-4 space-y-0.5">
                                    {parentCat.children && parentCat.children.length > 0 ? (
                                        parentCat.children.map(child => {
                                            const isChildActive = hoveredSubCategoryId === child.id;
                                            const parentStyle = getCategoryStyle(parentCat.slug);
                                            return (
                                                <Link
                                                    key={child.id}
                                                    href={`/categoria/${child.slug}`}
                                                    onMouseEnter={() => setHoveredSubCategoryId(child.id)}
                                                    onClick={onClose}
                                                    className={`
                                                        px-3 py-2 rounded-md cursor-pointer flex items-center justify-between transition-all duration-150 border border-transparent
                                                        ${isChildActive
                                                            ? 'bg-white shadow-xs border-gray-100'
                                                            : 'hover:bg-white hover:border-gray-50' // Light hover effect
                                                        }
                                                    `}
                                                >
                                                    <span className={`text-[12.5px] capitalize transition-colors ${isChildActive ? `font-semibold ${parentStyle.textColor}` : 'font-medium text-[var(--color-text-body)] hover:text-[var(--color-text-dark)]'}`}>
                                                        {child.name.toLowerCase()}
                                                    </span>
                                                    {child.children && child.children.length > 0 && (
                                                        <ChevronRight className={`w-3 h-3 transition-transform ${isChildActive ? `${parentStyle.iconColor} translate-x-0.5` : 'text-slate-300'}`} />
                                                    )}
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 px-6 text-center mt-4 opacity-70">
                                            <Tag className="w-5 h-5 opacity-40 mb-2" />
                                            <p className="text-[11px] font-light">Categoría directa</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* COL 3: GRANDCHILDREN (Level 3) */}
                    <div className="flex-1 bg-white p-0 overflow-y-auto custom-scrollbar relative">
                        {(() => {
                            const activeParent = categories.find(c => c.id === hoveredCategoryId);
                            const activeChild = activeParent?.children?.find(c => c.id === hoveredSubCategoryId);

                            if (!hoveredCategoryId) return null;

                            if (!activeChild) {
                                // Empty State when no subcategory is hovered
                                return (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 p-10 bg-white">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 opacity-20 ${getCategoryStyle(activeParent?.slug || '').bgColor}`}>
                                            {(() => {
                                                const Icon = getCategoryStyle(activeParent?.slug || '').icon;
                                                return <Icon className={`w-10 h-10 ${getCategoryStyle(activeParent?.slug || '').iconColor}`} />;
                                            })()}
                                        </div>
                                        <p className="text-[13px] font-light text-slate-400">Selecciona una subcategoría</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="h-full animate-fadeIn flex flex-col">
                                    {/* Header */}
                                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-6 py-4 border-b border-gray-50 flex justify-between items-end">
                                        <div>
                                            <Link
                                                href={`/categoria/${activeChild.slug}`}
                                                className="hover:underline"
                                                onClick={onClose}
                                            >
                                                <h3 className="text-[16px] font-semibold text-[var(--color-text-dark)] mb-0.5 leading-none">
                                                    {activeChild.name}
                                                </h3>
                                            </Link>
                                            <p className="text-[11px] font-light text-slate-500">Explora las opciones disponibles</p>
                                        </div>
                                        {/* "Ver todo" small link kept as auxiliary, but not as big button */}
                                        <Link
                                            href={`/categoria/${activeChild.slug}`}
                                            className={`text-[11px] font-medium hover:underline flex items-center gap-1 ${getCategoryStyle(activeParent?.slug || '').textColor}`}
                                            onClick={onClose}
                                        >
                                            Ver todo
                                            <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    </div>

                                    {/* Content (Grandchildren or Empty) */}
                                    <div className="p-6">
                                        {activeChild.children && activeChild.children.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                {activeChild.children.map(grandChild => (
                                                    <Link
                                                        key={grandChild.id}
                                                        href={`/categoria/${grandChild.slug}`}
                                                        className="py-1.5 px-2 rounded hover:bg-slate-50 text-[13px] text-[var(--color-text-body)] hover:text-[var(--color-text-dark)] group transition-all flex items-center justify-between"
                                                        onClick={onClose}
                                                    >
                                                        <span className="font-light group-hover:font-normal transition-all">{grandChild.name}</span>
                                                        <ChevronRight className="w-3 h-3 text-slate-200 group-hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100" />
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            // NO BUTTON. Just a subtle message or nothing.
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <p className="text-sm text-gray-400 italic">
                                                    Navega a la categoría para ver productos
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
