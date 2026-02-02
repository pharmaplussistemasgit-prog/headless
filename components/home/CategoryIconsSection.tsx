'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { CategoryTree } from '@/types/woocommerce';
import { getCategoryStyle } from '@/lib/category-styles';

interface CategoryIconsSectionProps {
    categories?: CategoryTree[];
}

export default function CategoryIconsSection({ categories = [] }: CategoryIconsSectionProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [itemsPerView, setItemsPerView] = useState(8);

    // If no categories provided, don't render anything (or could render skeleton)
    const validCategories = categories.length > 0 ? categories : [];

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setItemsPerView(3);
            } else {
                setItemsPerView(8);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (isTransitioning || validCategories.length <= itemsPerView) return;

        setIsTransitioning(true);
        if (direction === 'right') {
            setCurrentIndex((prev) => (prev + 1) % validCategories.length);
        } else {
            setCurrentIndex((prev) => (prev - 1 + validCategories.length) % validCategories.length);
        }

        setTimeout(() => setIsTransitioning(false), 600);
    };

    // Auto-scroll logic
    useEffect(() => {
        if (validCategories.length <= itemsPerView) return;

        const interval = setInterval(() => {
            if (!isTransitioning) {
                setCurrentIndex((prev) => (prev + 1) % validCategories.length);
            }
        }, 5000); // 5s for better UX

        return () => clearInterval(interval);
    }, [isTransitioning, validCategories.length, itemsPerView]);

    const getVisibleCategories = () => {
        if (validCategories.length === 0) return [];
        const visible = [];
        for (let i = 0; i < itemsPerView; i++) {
            visible.push(validCategories[(currentIndex + i) % validCategories.length]);
        }
        return visible;
    };

    const visibleCategories = getVisibleCategories();

    if (validCategories.length === 0) return null;

    return (
        <div className="w-full bg-[var(--color-bg-light)] py-4">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-[5%]">
                <div className="relative bg-white py-6 px-8 lg:px-16 overflow-hidden shadow-sm" style={{ borderRadius: '7px 50px 7px 50px' }}>

                    {/* Left Arrow - Only if needed */}
                    {validCategories.length > itemsPerView && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-1 lg:left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-gray-600 transition-all hover:scale-110 shadow-sm"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                        </button>
                    )}

                    <div className="w-full lg:w-[90%] mx-auto">
                        <div className={`grid gap-2 lg:gap-4 transition-all duration-600 ease-in-out`}
                            style={{ gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))` }}>
                            {visibleCategories.map((category, index) => {
                                const style = getCategoryStyle(category.slug);
                                const Icon = style.icon;

                                return (
                                    <Link
                                        key={`${category.id}-${currentIndex}-${index}`}
                                        href={`/categoria/${category.slug}`}
                                        className="flex flex-col items-center gap-3 group cursor-pointer animate-fadeIn"
                                    >
                                        <div className={`w-20 h-20 rounded-full ${style.bgColor} group-hover:bg-white group-hover:shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-transparent hover:border-gray-100`}>
                                            <Icon className={`w-8 h-8 ${style.iconColor}`} strokeWidth={1.5} />
                                        </div>

                                        <span className="text-sm font-medium text-slate-600 group-hover:text-[var(--color-pharma-blue)] text-center leading-tight transition-colors duration-300 capitalize">
                                            {category.name.toLowerCase()}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Arrow */}
                    {validCategories.length > itemsPerView && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-gray-600 transition-all hover:scale-110 shadow-sm"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
            `}</style>
        </div>
    );
}
