'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { FEATURED_BRANDS } from '@/lib/brands-data';

export default function BrandCarousel() {
    return (
        <section className="py-16 bg-white border-t border-gray-50">
            <div className="container mx-auto px-4 mb-10">
                <div className="flex flex-col items-center justify-center relative">
                    <div className="absolute left-0 w-full h-px bg-gray-100 top-1/2 -z-10"></div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-500 uppercase tracking-[0.2em] bg-white px-8 text-center mb-4">
                        Laboratorios Aliados
                    </h2>
                    <Link
                        href="/laboratorios"
                        className="bg-white px-6 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-widest hover:border-[var(--color-pharma-blue)] hover:text-[var(--color-pharma-blue)] transition-all transform hover:scale-105 shadow-sm"
                    >
                        Ver todos los laboratorios
                    </Link>
                </div>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden group">
                {/* Gradient Masks for fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                {/* Scrolling Track */}
                <div className="flex gap-12 animate-scroll-slow px-4 w-max hover:[animation-play-state:paused] items-center">
                    {/* Triple list for smoother infinite loop */}
                    {[...FEATURED_BRANDS, ...FEATURED_BRANDS, ...FEATURED_BRANDS].map((brand, idx) => (
                        <Link
                            key={`carousel-${idx}`}
                            href={brand.slug ? `/marca/${brand.slug}` : '/tienda'}
                            className="flex-shrink-0 w-44 h-24 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 group/item"
                            title={brand.title}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={brand.url}
                                alt={brand.alt}
                                className="max-w-full max-h-full object-contain filter transition-all duration-300 opacity-90 group-hover/item:opacity-100 group-hover/item:scale-110"
                                loading="lazy"
                            />
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-scroll-slow {
                    animation: scroll 150s linear infinite;
                }
                .group:hover .animate-scroll-slow {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
