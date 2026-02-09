'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/woocommerce';
import ProductCard from '@/components/product/ProductCard';
import { mapWooProduct } from '@/lib/mappers';
import { WooProduct } from '@/types/product';


interface FeaturedProductsProps {
    title?: ReactNode | string;
    products: Product[];
}

export default function FeaturedProducts({
    title = 'Estos productos te pueden interesar',
    products
}: FeaturedProductsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(4);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setItemsPerView(1);
            else if (window.innerWidth < 1024) setItemsPerView(2);
            else setItemsPerView(4);
        };
        // Initial set
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (direction === 'right') {
            setCurrentIndex((prev) =>
                prev + itemsPerView >= products.length ? 0 : prev + 1
            );
        } else {
            setCurrentIndex((prev) =>
                prev === 0 ? Math.max(0, products.length - itemsPerView) : prev - 1
            );
        }
    };

    const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView);

    // Filtrar primero todas las marcas válidas y luego tomar 60


    return (
        <div className="w-full bg-[var(--color-bg-light)] py-4">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-[5%]">
                {/* White container with straight corners */}
                <div className="relative bg-white py-8 px-8 shadow-sm">
                    <div className="w-full lg:w-[90%] mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl md:text-3xl font-bold italic">
                                    {title === 'Estos productos te pueden interesar' ? (
                                        <>
                                            <span className="text-[var(--color-pharma-blue)]">Estos productos</span>{' '}
                                            <span className="text-[var(--color-pharma-green)]">te pueden interesar</span>
                                        </>
                                    ) : (
                                        <span className="text-[var(--color-pharma-blue)]">{title}</span>
                                    )}
                                </h2>
                                <Link
                                    href="/tienda"
                                    className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors flex items-center gap-1"
                                >
                                    Ver más
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="w-full h-px bg-gray-300 mt-2"></div>
                        </div>

                        {/* Products Carousel */}
                        <div className="relative mb-12">
                            {/* Left Arrow */}
                            <button
                                onClick={() => scroll('left')}
                                className="absolute left-0 lg:left-auto lg:right-full lg:mr-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white hover:bg-slate-50 text-[var(--color-pharma-green)] rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md border border-gray-100"
                                aria-label="Anterior"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            {/* Products Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {visibleProducts.map((product) => {
                                    const mappedProduct = mapWooProduct(product as unknown as WooProduct);
                                    return (
                                        <div key={product.id} className="h-full">
                                            <ProductCard product={mappedProduct} />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Arrow */}
                            <button
                                onClick={() => scroll('right')}
                                className="absolute right-0 lg:right-auto lg:left-full lg:ml-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white hover:bg-slate-50 text-[var(--color-pharma-green)] rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md border border-gray-100"
                                aria-label="Siguiente"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Brands Section - REFACTORIZADA DESDE CERO */}

                    </div>
                </div>
            </div>
        </div>
    );
}
