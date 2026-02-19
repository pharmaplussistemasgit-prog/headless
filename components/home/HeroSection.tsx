'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

export interface MinimalProduct {
    id: number;
    name: string;
    slug: string;
    price?: string;
    regular_price?: string;
    images: { src: string; name?: string; alt?: string }[];
    categories?: { id: number; name: string }[];
}

export interface HeroSlide {
    id: string;
    image: string;
    title: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    discount?: string;
    bgColor?: string;
}

export interface HeroBanner {
    image: string;
    title?: string;
    link?: string;
}

interface HeroSectionProps {
    slides: HeroSlide[];
    featuredProds?: MinimalProduct[];
    bannerTop?: HeroBanner;
    bannerBottom?: HeroBanner;
}

export function HeroSection({ slides, bannerTop, bannerBottom }: HeroSectionProps) {
    const swiperRef = useRef<SwiperType | null>(null);

    const handleMouseEnter = () => {
        if (swiperRef.current && swiperRef.current.autoplay) {
            swiperRef.current.autoplay.stop();
        }
    };

    const handleMouseLeave = () => {
        if (swiperRef.current && swiperRef.current.autoplay) {
            swiperRef.current.autoplay.start();
        }
    };

    return (
        <section className="w-full relative py-6">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-[5%]">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-auto lg:min-h-[440px]">

                    {/* LEFT COLUMN: Main Slider (70%) */}
                    <div
                        className="lg:col-span-7 relative group h-[300px] lg:h-full rounded-2xl overflow-hidden shadow-sm"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Swiper
                            onSwiper={(swiper) => (swiperRef.current = swiper)}
                            modules={[Autoplay, Navigation]}
                            spaceBetween={0}
                            slidesPerView={1}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            loop={true}
                            navigation={{ nextEl: '.swiper-next', prevEl: '.swiper-prev' }}
                            className="w-full h-full"
                        >
                            {slides.map((slide, index) => (
                                <SwiperSlide key={slide.id}>
                                    <div className="relative w-full h-full bg-gray-100">
                                        <Link href={slide.ctaLink || '#'} className="block w-full h-full relative">
                                            <Image
                                                src={slide.image}
                                                alt={slide.title || 'PharmaPlus Offer'}
                                                fill
                                                priority={index === 0}
                                                className="object-cover object-center"
                                                sizes="(max-width: 1024px) 100vw, 70vw"
                                            />
                                        </Link>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Arrows */}
                        <div className="hidden lg:flex absolute inset-0 items-center justify-between px-4 z-20 pointer-events-none">
                            <button className="swiper-prev w-10 h-10 bg-white/80 hover:bg-white text-[var(--color-primary-blue)] rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 pointer-events-auto shadow-md">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button className="swiper-next w-10 h-10 bg-white/80 hover:bg-white text-[var(--color-primary-blue)] rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 pointer-events-auto shadow-md">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Advertising Banners (30%) */}
                    <div className="lg:col-span-3 flex flex-col gap-6 h-auto lg:h-full">

                        {/* 1. Banner Publicitario Arriba */}
                        <div className="relative rounded-2xl overflow-hidden flex-1 shadow-sm group cursor-pointer aspect-[16/9] lg:aspect-auto min-h-[180px]">
                            {bannerTop ? (
                                <Link href={bannerTop.link || '#'} className="block w-full h-full relative">
                                    <Image
                                        src={bannerTop.image}
                                        alt={bannerTop.title || "Banner Publicitario"}
                                        fill
                                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, 30vw"
                                    />
                                </Link>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-300 border border-dashed border-gray-200">
                                    <span className="text-xs font-medium uppercase tracking-widest">Banner Arriba</span>
                                </div>
                            )}
                        </div>

                        {/* 2. Banner Publicitario Abajo */}
                        <div className="relative rounded-2xl overflow-hidden flex-1 shadow-sm group cursor-pointer aspect-[16/9] lg:aspect-auto min-h-[180px]">
                            {bannerBottom ? (
                                <Link href={bannerBottom.link || '#'} className="block w-full h-full relative">
                                    <Image
                                        src={bannerBottom.image}
                                        alt={bannerBottom.title || "Banner Publicitario"}
                                        fill
                                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, 30vw"
                                    />
                                </Link>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-300 border border-dashed border-gray-200">
                                    <span className="text-xs font-medium uppercase tracking-widest">Banner Abajo</span>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
