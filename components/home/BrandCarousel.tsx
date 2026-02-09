'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { FEATURED_BRANDS } from '@/lib/brands-data';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

export default function BrandCarousel() {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-left">
                    <h2 className="inline-block text-2xl md:text-3xl font-bold text-[var(--color-pharma-blue)] border-b-4 border-[var(--color-pharma-green)] pb-1 mb-4">
                        Compra Por Marca
                    </h2>
                </div>

                <div className="relative group">
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        spaceBetween={20}
                        slidesPerView={2}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        loop={true}
                        navigation={{
                            nextEl: '.brands-next',
                            prevEl: '.brands-prev',
                        }}
                        breakpoints={{
                            640: { slidesPerView: 3, spaceBetween: 20 },
                            768: { slidesPerView: 4, spaceBetween: 30 },
                            1024: { slidesPerView: 6, spaceBetween: 40 },
                        }}
                        className="w-full h-32 flex items-center"
                    >
                        {FEATURED_BRANDS.map((brand, idx) => (
                            <SwiperSlide key={`carousel-${idx}`} className="flex items-center justify-center">
                                <Link
                                    href={brand.slug ? `/tienda/laboratorio/${brand.slug}` : `/tienda?search=${encodeURIComponent(brand.title)}`}
                                    className="flex items-center justify-center w-full h-24 hover:scale-105 transition-transform duration-300 group/brand"
                                    title={brand.title}
                                >
                                    <div className="relative w-full h-full flex items-center justify-center p-2 bg-white rounded-xl border border-gray-50 hover:border-gray-200 transition-colors shadow-sm overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={brand.url}
                                            alt={brand.alt}
                                            className="max-w-[140px] max-h-[70px] w-auto h-auto object-contain transition-all"
                                            loading="lazy"
                                            onError={(e) => {
                                                // Fallback to text if image fails
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    const textFallback = document.createElement('span');
                                                    textFallback.className = 'text-xs font-bold text-[var(--color-pharma-blue)] text-center px-2';
                                                    textFallback.innerText = brand.title;
                                                    parent.appendChild(textFallback);
                                                }
                                            }}
                                        />
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation Arrows */}
                    <button className="brands-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 w-10 h-10 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--color-pharma-blue)] transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
                        <ChevronLeft size={24} />
                    </button>
                    <button className="brands-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 w-10 h-10 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--color-pharma-blue)] transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
}
