'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Product } from '@/types/woocommerce';
import { mapWooProduct } from '@/lib/mappers';
import { WooProduct } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface BeautySectionProps {
    products: Product[];
}

const SUBCATEGORIES = [
    { name: 'Ojos', image: '/placeholder-beauty-eyes.png', icon: '👁️' },
    { name: 'Rostro', image: '/placeholder-beauty-face.png', icon: '✨' },
    { name: 'Labios', image: '/placeholder-beauty-lips.png', icon: '💄' },
    { name: 'Uñas', image: '/placeholder-beauty-nails.png', icon: '💅' },
    { name: 'Accesorios', image: '/placeholder-beauty-acc.png', icon: '🖌️' },
    { name: 'Perfumes', image: '/placeholder-beauty-perfume.png', icon: '🧴' },
    { name: 'Electro', image: '/placeholder-beauty-electro.png', icon: '🔌' },
];

export default function BeautySection({ products }: BeautySectionProps) {
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    // If no specific beauty products, we might want to hide or fallback
    if (!products || products.length === 0) return null;

    return (
        <section className="w-full bg-[var(--color-bg-light)] py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-[5%]">
                <div className="bg-white shadow-sm p-6 md:p-8">
                    <div className="w-full lg:w-[90%] mx-auto">
                        {/* Header */}
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl md:text-3xl font-bold italic text-[var(--color-pharma-blue)]">
                                    Belleza
                                </h2>
                                <Link href="/categoria/belleza" className="text-xs font-medium text-gray-400 hover:text-[var(--color-pharma-blue)] flex items-center gap-1 transition-colors">
                                    Ver más <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="w-full h-px bg-gray-300 mt-2"></div>
                        </div>

                        {/* Subcategories Nav Row */}
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 mb-4">
                            {SUBCATEGORIES.map((cat, idx) => (
                                <Link
                                    key={idx}
                                    href={`/categoria/belleza/${cat.name.toLowerCase()}`}
                                    className="flex-shrink-0 flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-3 min-w-[140px] hover:shadow-md hover:border-purple-100 transition-all group"
                                >
                                    <span className="text-2xl">{cat.icon}</span>
                                    <span className="font-semibold text-gray-600 group-hover:text-purple-600 text-sm">{cat.name}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Products Carousel */}
                        <div className="relative group">
                            {/* Navigation Buttons */}
                            <button
                                ref={prevRef}
                                className="absolute left-0 lg:left-auto lg:right-full lg:mr-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center text-[var(--color-pharma-green)] hover:text-[var(--color-pharma-green)] transition-colors bg-white shadow-md rounded-full disabled:opacity-30 border border-gray-100"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <button
                                ref={nextRef}
                                className="absolute right-0 lg:right-auto lg:left-full lg:ml-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center text-[var(--color-pharma-green)] hover:text-[var(--color-pharma-green)] transition-colors bg-white shadow-md rounded-full disabled:opacity-30 border border-gray-100"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <Swiper
                                modules={[Navigation, Autoplay]}
                                spaceBetween={16}
                                slidesPerView={2}
                                loop={true}
                                navigation={{
                                    prevEl: prevRef.current,
                                    nextEl: nextRef.current,
                                }}
                                onBeforeInit={(swiper) => {
                                    // @ts-expect-error swiper styling
                                    swiper.params.navigation.prevEl = prevRef.current;
                                    // @ts-expect-error swiper styling
                                    swiper.params.navigation.nextEl = nextRef.current;
                                }}
                                autoplay={{
                                    delay: 6000,
                                    disableOnInteraction: false,
                                }}
                                breakpoints={{
                                    640: { slidesPerView: 2, spaceBetween: 20 },
                                    768: { slidesPerView: 3, spaceBetween: 24 },
                                    1024: { slidesPerView: 4, spaceBetween: 24 },
                                }}
                                className="py-2 px-1"
                            >
                                {products.map((product) => {
                                    const p = mapWooProduct(product as unknown as WooProduct);
                                    return (
                                        <SwiperSlide key={product.id} className="h-full pt-2 pb-2">
                                            <div className="h-full transform hover:-translate-y-1 transition-transform duration-300">
                                                <ProductCard product={p} />
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
