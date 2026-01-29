'use client';
// Force Recompile

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Phone, Apple, User, Play } from 'lucide-react';
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

interface HeroSectionProps {
    slides: HeroSlide[];
    featuredProds?: MinimalProduct[];
}

export default function HeroSection({ slides, featuredProds = [] }: HeroSectionProps) {
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const swiperRef = useRef<SwiperType | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (category || brand) {
            const params = new URLSearchParams();
            if (category) params.set('category', category);
            if (brand) params.set('brand', brand);
            window.location.href = `/tienda?${params.toString()}`;
        }
    };

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

    // Use a slide image for the promo card if available, otherwise fallback
    const promoImage = slides.length > 1 ? slides[1].image : slides[0]?.image;

    return (
        <section className="w-full relative py-6">

            <div className="w-full mx-auto px-4 sm:px-6 lg:px-[5%]">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-auto lg:h-[420px]">

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
                                        <Image
                                            src={slide.image}
                                            alt={slide.title || 'PharmaPlus Offer'}
                                            fill
                                            priority={index === 0}
                                            fetchPriority={index === 0 ? "high" : "auto"}
                                            className="object-cover object-center"
                                            sizes="(max-width: 1024px) 100vw, 70vw"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Arrows - Hidden on Mobile, Visible on Desktop Group Hover */}
                        <div className="hidden lg:flex absolute inset-0 items-center justify-between px-4 z-20 pointer-events-none">
                            <button className="swiper-prev w-10 h-10 bg-white/80 hover:bg-white text-[var(--color-primary-blue)] rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 pointer-events-auto shadow-md" aria-label="Anterior diapositiva">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button className="swiper-next w-10 h-10 bg-white/80 hover:bg-white text-[var(--color-primary-blue)] rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 pointer-events-auto shadow-md" aria-label="Siguiente diapositiva">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Side Cards (30%) */}
                    <div className="lg:col-span-3 flex flex-col gap-4 h-auto lg:h-full">

                        {/* 1. Pill Reminder Access Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col justify-center items-center text-center group transition-all hover:shadow-md">
                            <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                <span className="text-3xl">💊</span>
                            </div>

                            <h3 className="text-[var(--color-pharma-blue)] font-bold text-lg mb-2">
                                Tu Pastillero Virtual
                            </h3>

                            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                                Organiza tus medicamentos, recibe recordatorios y nunca olvides una toma.
                            </p>

                            <Link href="/pastillero" className="w-full bg-[var(--color-pharma-blue)] hover:opacity-90 text-white font-bold py-2.5 rounded-full transition-all shadow-sm active:scale-95 text-sm flex items-center justify-center gap-2">
                                <Play className="w-4 h-4 fill-current" />
                                <span>Ingresar al Pastillero</span>
                            </Link>
                        </div>

                        {/* 2. Advertising Promo Card */}
                        <div className="bg-[#fff0f3] rounded-2xl relative overflow-hidden flex-1 shadow-sm group cursor-pointer">
                            {/* Content Overlay */}
                            <div className="absolute inset-0 z-10 p-6 flex flex-col justify-center items-start bg-gradient-to-r from-white/90 via-white/50 to-transparent">
                                <span className="bg-[#f03e3e] text-white text-[10px] font-bold px-2 py-1 rounded-full mb-2 uppercase tracking-wide">
                                    Oferta Especial
                                </span>
                                <h4 className="text-[#c92a2a] font-bold text-xl leading-tight mb-1">
                                    Vita C + Zinc
                                </h4>
                                <p className="text-gray-600 text-xs mb-3 max-w-[120px]">
                                    Fortalece tus defensas hoy mismo.
                                </p>
                                <button className="text-[#c92a2a] text-xs font-bold border-b border-[#c92a2a] hover:opacity-80">
                                    Ver productos
                                </button>
                            </div>

                            {/* Promo Image */}
                            {promoImage && (
                                <Image
                                    src={promoImage}
                                    alt="Promo"
                                    fill
                                    className="object-cover object-right group-hover:scale-105 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <style jsx global>{`
                /* Hide Swiper Pagination */
                .swiper-pagination-custom {
                    display: none;
                }
            `}</style>
        </section>
    );
}
