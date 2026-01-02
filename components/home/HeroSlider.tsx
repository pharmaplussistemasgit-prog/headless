'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export interface HeroSlide {
    id: string;
    image: string;
    title: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    theme?: 'light' | 'dark';
}

interface HeroSliderProps {
    slides: HeroSlide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
    return (
        <div className="w-full bg-[var(--color-bg-light)] py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next-custom',
                        prevEl: '.swiper-button-prev-custom',
                    }}
                    pagination={{
                        clickable: true,
                        el: '.swiper-pagination-custom',
                    }}
                    loop={true}
                    className="rounded-2xl overflow-hidden shadow-lg group"
                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id}>
                            <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-br from-purple-100 to-blue-50">
                                {/* Background Image */}
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />

                                {/* Overlay Content */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex items-center">
                                    <div className="max-w-7xl mx-auto px-8 md:px-16 w-full">
                                        <div className="max-w-xl">
                                            {/* Title */}
                                            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${slide.theme === 'dark' ? 'text-white' : 'text-[var(--color-pharma-blue)]'}`}>
                                                {slide.title}
                                            </h2>

                                            {/* Subtitle */}
                                            {slide.subtitle && (
                                                <p className={`text-base md:text-lg mb-6 ${slide.theme === 'dark' ? 'text-white/90' : 'text-gray-700'}`}>
                                                    {slide.subtitle}
                                                </p>
                                            )}

                                            {/* CTA Button */}
                                            {slide.ctaText && slide.ctaLink && (
                                                <Link
                                                    href={slide.ctaLink}
                                                    className="inline-block bg-[var(--color-pharma-green)] hover:bg-[#007a38] text-white font-semibold px-8 py-3 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                                >
                                                    {slide.ctaText}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}

                    {/* Custom Navigation Arrows - Appear on Hover */}
                    <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <svg className="w-6 h-6 text-[var(--color-pharma-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <svg className="w-6 h-6 text-[var(--color-pharma-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>

                    {/* Custom Pagination Dots */}
                    <div className="swiper-pagination-custom absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10"></div>
                </Swiper>
            </div>

            {/* Custom Pagination Styles */}
            <style jsx global>{`
                .swiper-pagination-custom .swiper-pagination-bullet {
                    width: 10px;
                    height: 10px;
                    background: white;
                    opacity: 0.5;
                    transition: all 0.3s;
                }
                .swiper-pagination-custom .swiper-pagination-bullet-active {
                    opacity: 1;
                    width: 30px;
                    border-radius: 5px;
                    background: var(--color-pharma-green);
                }
            `}</style>
        </div>
    );
}
