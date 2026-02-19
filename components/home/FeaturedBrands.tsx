'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { FEATURED_BRANDS } from '@/lib/brands-data';
import { BRAND_LOGOS } from '@/lib/brands-logos';

export default function FeaturedBrands() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            checkScroll(); // Check initially
            return () => container.removeEventListener('scroll', checkScroll);
        }
    }, [FEATURED_BRANDS.length]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-12 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header with Nav Controls */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Nuestras <span className="text-[var(--color-pharma-blue)]">Marcas</span>
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm md:text-base">
                            Encuentra tus productos favoritos de los mejores laboratorios farmacéuticos.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Navigation Arrows (Desktop) */}
                        <div className="hidden md:flex gap-2 mr-4">
                            <button
                                onClick={() => scroll('left')}
                                disabled={!canScrollLeft}
                                className={`p-2 rounded-full border transition-all ${canScrollLeft
                                    ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[var(--color-pharma-blue)] hover:text-[var(--color-pharma-blue)] cursor-pointer shadow-sm'
                                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                    }`}
                                aria-label="Anterior"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                disabled={!canScrollRight}
                                className={`p-2 rounded-full border transition-all ${canScrollRight
                                    ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[var(--color-pharma-blue)] hover:text-[var(--color-pharma-blue)] cursor-pointer shadow-sm'
                                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                    }`}
                                aria-label="Siguiente"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* View All Link */}
                        <Link
                            href="/laboratorios"
                            className="text-[var(--color-pharma-blue)] font-bold text-sm md:text-base hover:text-[var(--color-pharma-green)] transition-colors flex items-center gap-1 group"
                        >
                            Ver todas
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Scrollable Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-4 py-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >

                    {FEATURED_BRANDS.map((brand, index) => {
                        const isEven = index % 2 === 0;
                        // Alternating styles
                        const borderColor = isEven ? 'border-blue-100' : 'border-green-100';
                        const hoverBorder = isEven ? 'group-hover:border-[var(--color-pharma-blue)]' : 'group-hover:border-[var(--color-pharma-green)]';
                        const textColor = isEven ? 'text-[var(--color-pharma-blue)]' : 'text-[var(--color-pharma-green)]';
                        const bgHover = isEven ? 'group-hover:bg-blue-50' : 'group-hover:bg-green-50';
                        const shadowColor = isEven ? 'hover:shadow-blue-100' : 'hover:shadow-green-100';

                        return (
                            <Link
                                key={`${brand.slug}-${index}`}
                                href={`/laboratorios/${brand.slug}`}
                                className={`snap-start flex-shrink-0 w-36 md:w-48 group bg-white rounded-xl border-2 ${borderColor} ${hoverBorder} ${bgHover} shadow-sm hover:shadow-xl ${shadowColor} transition-all duration-300 flex flex-col items-center justify-between p-4 h-32 md:h-40 relative overflow-hidden`}
                            >
                                {/* Decorative circle for "vivid" look */}
                                <div className={`absolute -top-6 -right-6 w-12 h-12 rounded-full ${isEven ? 'bg-blue-50' : 'bg-green-50'} group-hover:scale-[8] transition-transform duration-500 opacity-20`}></div>

                                <div className="w-full h-full flex items-center justify-center relative z-10">
                                    {(BRAND_LOGOS[brand.slug] || (brand.url && brand.url.length > 5)) ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={BRAND_LOGOS[brand.slug] || brand.url}
                                            alt={brand.title || 'Marca'}
                                            className="max-w-[80%] max-h-20 md:max-h-24 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-90 group-hover:opacity-100 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <span className={`text-center font-extrabold ${textColor} text-sm md:text-base line-clamp-3 leading-tight uppercase tracking-tight`}>
                                            {brand.title}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}


                    {/* "See More" Card at the end */}
                    <Link
                        href="/laboratorios"
                        className="snap-start flex-shrink-0 w-36 md:w-48 group bg-gray-50 rounded-xl border border-gray-100 border-dashed hover:border-[var(--color-pharma-blue)] hover:bg-blue-50 transition-all duration-300 flex flex-col items-center justify-center p-4 h-32 md:h-40 cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <ArrowRight className="w-5 h-5 text-[var(--color-pharma-blue)]" />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-gray-500 group-hover:text-[var(--color-pharma-blue)]">
                            Ver más marcas
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
