'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface CategoryBubble {
    id: string;
    name: string;
    slug: string;
    emoji: string;
    bgColor: string;
}

const CATEGORIES: CategoryBubble[] = [
    {
        id: '1',
        name: 'Medicamentos',
        slug: 'medicamentos',
        emoji: '💊',
        bgColor: 'bg-blue-50',
    },
    {
        id: '2',
        name: 'Cuidado Piel',
        slug: 'cuidado-piel',
        emoji: '🧴',
        bgColor: 'bg-purple-50',
    },
    {
        id: '3',
        name: 'Bebés',
        slug: 'bebes',
        emoji: '🍼',
        bgColor: 'bg-pink-50',
    },
    {
        id: '4',
        name: 'Aseo Personal',
        slug: 'aseo',
        emoji: '🧼',
        bgColor: 'bg-cyan-50',
    },
    {
        id: '5',
        name: 'Ofertas',
        slug: 'ofertas',
        emoji: '🏷️',
        bgColor: 'bg-red-50',
    },
    {
        id: '6',
        name: 'Nutrición',
        slug: 'nutricion',
        emoji: '🍎',
        bgColor: 'bg-green-50',
    },
    {
        id: '7',
        name: 'Salud Sexual',
        slug: 'salud-sexual',
        emoji: '❤️',
        bgColor: 'bg-rose-50',
    },
    {
        id: '8',
        name: 'Tiendas',
        slug: 'tiendas',
        emoji: '🏪',
        bgColor: 'bg-orange-50',
    },
    {
        id: '9',
        name: 'Blog',
        slug: 'blog',
        emoji: '📝',
        bgColor: 'bg-yellow-50',
    },
];

export default function CategoryIconsSection() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [itemsPerView, setItemsPerView] = useState(8);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setItemsPerView(3);
            } else {
                setItemsPerView(8);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        if (direction === 'right') {
            setCurrentIndex((prev) => (prev + 1) % CATEGORIES.length);
        } else {
            setCurrentIndex((prev) => (prev - 1 + CATEGORIES.length) % CATEGORIES.length);
        }

        setTimeout(() => setIsTransitioning(false), 600);
    };

    // Auto-scroll every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isTransitioning) {
                setCurrentIndex((prev) => (prev + 1) % CATEGORIES.length);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [isTransitioning]);

    // Get visible categories (3 or 8 at a time, looping)
    const getVisibleCategories = () => {
        const visible = [];
        for (let i = 0; i < itemsPerView; i++) {
            visible.push(CATEGORIES[(currentIndex + i) % CATEGORIES.length]);
        }
        return visible;
    };

    const visibleCategories = getVisibleCategories();

    return (
        <div className="w-full bg-[var(--color-bg-light)] py-4">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-[5%]">
                {/* Rounded: top-left=10px, top-right=50px, bottom-right=10px, bottom-left=50px */}
                <div className="relative bg-white py-6 px-8 lg:px-16 overflow-hidden" style={{ borderRadius: '7px 50px 7px 50px' }}>
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-1 lg:left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-gray-600 transition-all hover:scale-110 shadow-sm"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>

                    {/* Categories Grid - 3 items Mobile / 8 items Desktop with smooth transition */}
                    <div className="w-full lg:w-[90%] mx-auto">
                        <div className="grid grid-cols-3 lg:grid-cols-8 gap-2 lg:gap-4 transition-all duration-600 ease-in-out">
                            {visibleCategories.map((category, index) => (
                                <Link
                                    key={`${category.id}-${currentIndex}-${index}`}
                                    href={`/categoria/${category.slug}`}
                                    className="flex flex-col items-center gap-3 group cursor-pointer animate-fadeIn"
                                >
                                    {/* Emoji Icon Container - Larger */}
                                    <div className={`w-20 h-20 rounded-full ${category.bgColor} group-hover:bg-white group-hover:shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 text-5xl`}>
                                        {category.emoji}
                                    </div>

                                    {/* Category Name */}
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-[var(--color-pharma-blue)] text-center leading-tight transition-colors duration-300">
                                        {category.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-gray-600 transition-all hover:scale-110"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Fade-in animation */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
