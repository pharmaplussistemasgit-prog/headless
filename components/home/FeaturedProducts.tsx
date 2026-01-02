'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/woocommerce';

interface FeaturedProductsProps {
    title?: string;
    products: Product[];
}

export default function FeaturedProducts({
    title = '¡Hola ! Estos productos te pueden interesar',
    products
}: FeaturedProductsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerView = 4;

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

    // Calculate discount percentage
    const getDiscountPercentage = (product: Product) => {
        if (product.sale_price && product.regular_price) {
            const discount = ((parseFloat(product.regular_price) - parseFloat(product.sale_price)) / parseFloat(product.regular_price)) * 100;
            return Math.round(discount);
        }
        return 0;
    };

    return (
        <div className="w-full bg-[var(--color-bg-light)] py-4">
            <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* White container with straight corners */}
                <div className="relative bg-white py-8 px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-pharma-blue)]">
                            {title}
                        </h2>
                        <Link
                            href="/tienda"
                            className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors flex items-center gap-1"
                        >
                            Ver más
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Products Carousel */}
                    <div className="relative">
                        {/* Left Arrow */}
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-slate-50 hover:bg-slate-100 text-gray-600 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {visibleProducts.map((product) => {
                                const discount = getDiscountPercentage(product);
                                const hasPromotion = product.meta_data?.find(m => m.key === '_promotion_label')?.value;

                                return (
                                    <Link
                                        key={product.id}
                                        href={`/producto/${product.slug}`}
                                        className="group relative bg-white overflow-hidden hover:shadow-lg transition-all duration-300"
                                    >
                                        {/* Discount Badge */}
                                        {discount > 0 && (
                                            <div className="absolute top-3 right-3 z-10 bg-yellow-400 text-gray-900 font-bold text-sm px-3 py-1 rounded-full">
                                                {discount}%
                                            </div>
                                        )}

                                        {/* Product Image */}
                                        <div className="relative aspect-square bg-white p-4 flex items-center justify-center">
                                            <Image
                                                src={product.images[0]?.src || '/placeholder-image.png'}
                                                alt={product.name}
                                                width={300}
                                                height={300}
                                                className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4 space-y-2">
                                            {/* Product Name */}
                                            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[var(--color-pharma-blue)] transition-colors">
                                                {product.name}
                                            </h3>

                                            {/* Price */}
                                            <div className="flex items-baseline gap-2">
                                                {product.sale_price && product.regular_price ? (
                                                    <>
                                                        <span className="text-lg font-bold text-[var(--color-pharma-blue)]">
                                                            ${parseFloat(product.sale_price).toLocaleString('es-CO')}
                                                        </span>
                                                        <span className="text-sm text-gray-400 line-through">
                                                            ${parseFloat(product.regular_price).toLocaleString('es-CO')}
                                                        </span>
                                                    </>
                                                ) : product.price ? (
                                                    <span className="text-lg font-bold text-[var(--color-pharma-blue)]">
                                                        ${parseFloat(product.price).toLocaleString('es-CO')}
                                                    </span>
                                                ) : null}
                                            </div>

                                            {/* Promotion Label */}
                                            {hasPromotion && (
                                                <div className="bg-yellow-100 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-md inline-block">
                                                    {String(hasPromotion)}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-slate-50 hover:bg-slate-100 text-gray-600 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            aria-label="Siguiente"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
