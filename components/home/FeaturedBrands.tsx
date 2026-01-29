'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FEATURED_BRANDS } from '@/lib/brands-data';

export default function FeaturedBrands() {
    return (
        <section className="py-10 bg-white border-t border-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    Productos <span className="text-[var(--color-pharma-blue)]">Destacados</span>
                </h2>

                {/* Horizontal Marquee Container with "Diagonal" Style - Auto Scroll */}
                <div className="relative group/slider overflow-hidden py-4">
                    {/* Gradient Masks for fade effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                    <div className="flex gap-6 animate-scroll-slow px-4 w-max hover:[animation-play-state:paused] items-center">
                        {/* Triple the list for smoother infinite loop */}
                        {[...FEATURED_BRANDS, ...FEATURED_BRANDS, ...FEATURED_BRANDS].map((brand, index) => (
                            <Link
                                key={`marquee-${index}`}
                                href={brand.slug ? `/marca/${brand.slug}` : '/tienda'}
                                className="flex-shrink-0 relative group"
                                title={brand.title}
                            >
                                {/* Diagonal Card Background "Ad Style" */}
                                <div className="w-52 h-36 md:w-64 md:h-40 bg-white border border-gray-200 shadow-sm rounded-xl transform -skew-x-3 hover:skew-x-0 hover:scale-105 hover:shadow-xl hover:border-[var(--color-pharma-blue)] transition-all duration-300 flex items-center justify-center overflow-hidden relative">

                                    {/* Background Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-white opacity-50"></div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    {/* Ad Badge (Marketing Style) - Reverse Skew */}
                                    <div className="absolute top-2 right-2 transform skew-x-3 group-hover:skew-x-0 transition-transform duration-300 z-20">
                                        <span className="bg-[var(--color-pharma-yellow)] text-[var(--color-pharma-blue)] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                            Destacado
                                        </span>
                                    </div>

                                    {/* Logo Container */}
                                    <div className="transform skew-x-3 group-hover:skew-x-0 transition-transform duration-300 w-4/5 h-3/5 flex items-center justify-center z-10 p-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={brand.url}
                                            alt={brand.alt}
                                            className="max-w-full max-h-full object-contain filter grayscale-0 group-hover:scale-110 transition-all duration-500"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* CTA Overlay (Hover) - "Ver Productos" */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-pharma-blue)] py-1.5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center skew-x-3 group-hover:skew-x-0">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            Ver Productos <span className="text-[var(--color-pharma-yellow)]">→</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <style jsx>{`
                        @keyframes scroll {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-33.33%); } /* Move 1/3 of the total width (since we have 3 sets) */
                        }
                        .animate-scroll-slow {
                            animation: scroll 60s linear infinite; /* Very slow smooth scroll */
                        }
                    `}</style>
                </div>
            </div>
        </section>
    );
}
