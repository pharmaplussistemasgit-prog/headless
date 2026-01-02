'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Product } from '@/types/woocommerce';

interface FlashDealsProps {
    title?: string;
    products: Product[];
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function FlashDeals({
    title = 'Mundo Ofertas',
    products
}: FlashDealsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerView = 2;

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
                {/* White container */}
                <div className="relative bg-white py-8 px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold italic">
                            <span className="text-[var(--color-pharma-blue)]">Mundo</span>{' '}
                            <span className="text-[var(--color-pharma-green)]">Ofertas</span>
                        </h2>
                        <div className="w-full h-px bg-gray-300 mt-2"></div>
                    </div>

                    {/* Flash Deals Carousel */}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {visibleProducts.map((product) => {
                                const discount = getDiscountPercentage(product);
                                const stock = product.stock_quantity || 100;

                                return (
                                    <FlashDealCard
                                        key={product.id}
                                        product={product}
                                        discount={discount}
                                        stock={stock}
                                    />
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

// Flash Deal Card Component - EXACT copy of reference with PharmaPlus colors
function FlashDealCard({ product, discount, stock }: { product: Product; discount: number; stock: number }) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 1, hours: 7, minutes: 10, seconds: 17 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                let { days, hours, minutes, seconds } = prev;

                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                } else if (days > 0) {
                    days--;
                    hours = 23;
                    minutes = 59;
                    seconds = 59;
                }

                return { days, hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const stockPercentage = (stock / 100) * 100;

    return (
        <div className="relative bg-white rounded-2xl p-5 border-3 border-[var(--color-pharma-green)] shadow-md hover:shadow-lg transition-all duration-300">
            {/* Discount Badge */}
            <div className="absolute top-4 left-4 bg-[var(--color-pharma-green)] text-white font-bold text-sm px-3 py-1.5 rounded-full z-10">
                {discount}%
            </div>

            {/* Add Button */}
            <button className="absolute top-4 right-4 w-10 h-10 bg-[var(--color-pharma-blue)] hover:bg-[#005a9c] text-white rounded-full flex items-center justify-center transition-all z-10">
                <Plus className="w-5 h-5" />
            </button>

            {/* Content Grid */}
            <div className="grid grid-cols-[180px_1fr] gap-4 mt-2">
                {/* Product Image */}
                <div className="flex items-center justify-center">
                    <Image
                        src={product.images[0]?.src || '/placeholder-image.png'}
                        alt={product.name}
                        width={160}
                        height={160}
                        className="object-contain w-full h-auto"
                    />
                </div>

                {/* Product Info */}
                <div className="flex flex-col justify-between py-2">
                    {/* Product Name */}
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-2">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-3">
                        {product.sale_price && product.regular_price ? (
                            <>
                                <div className="text-2xl font-bold text-[var(--color-pharma-blue)] mb-1">
                                    ${parseFloat(product.sale_price).toLocaleString('es-CO')}
                                </div>
                                <div className="text-sm text-gray-400 line-through mb-1">
                                    ${parseFloat(product.regular_price).toLocaleString('es-CO')}
                                </div>
                            </>
                        ) : product.price ? (
                            <div className="text-2xl font-bold text-[var(--color-pharma-blue)]">
                                ${parseFloat(product.price).toLocaleString('es-CO')}
                            </div>
                        ) : null}
                    </div>

                    {/* Countdown Section */}
                    <div>
                        <div className="text-center mb-2">
                            <p className="text-sm font-bold text-gray-900">¡No lo dejes pasar!</p>
                            <p className="text-xs text-gray-600">Tiempo restante:</p>
                        </div>

                        {/* Countdown Boxes */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            <CountdownBox value={timeLeft.days} label="Días" />
                            <CountdownBox value={timeLeft.hours} label="Hrs" />
                            <CountdownBox value={timeLeft.minutes} label="Mins" />
                            <CountdownBox value={timeLeft.seconds} label="Seg" />
                        </div>

                        {/* Stock Bar */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold bg-[var(--color-pharma-green)] text-white px-2 py-0.5 rounded">
                                    ¡Aprovecha!
                                </span>
                                <span className="text-xs text-gray-600">{stock} disponibles</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className="bg-[var(--color-pharma-green)] h-1.5 rounded-full transition-all"
                                    style={{ width: `${stockPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Countdown Box - Simple with border
function CountdownBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="bg-white rounded-lg p-1.5 border-2 border-gray-300 text-center">
            <div className="text-xl font-bold text-gray-900">
                {String(value).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-gray-600 font-medium">
                {label}
            </div>
        </div>
    );
}
