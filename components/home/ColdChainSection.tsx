'use client';
import { useRef } from 'react';
import { Snowflake, Info, ThermometerSnowflake, ChevronRight, ChevronLeft } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

import { Product } from '@/types/woocommerce';
import ProductCard from '@/components/product/ProductCard';
import { mapWooProduct } from '@/lib/mappers';
import { WooProduct } from '@/types/product';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ColdChainSectionProps {
    products: Product[];
}

export default function ColdChainSection({ products }: ColdChainSectionProps) {
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    // Filter for products that have the cold chain meta flag OR matching keywords
    const coldProducts = products.filter(p => {
        // 1. Check explicit meta (if added later)
        const coldMeta = p.meta_data?.find(m => m.key === '_cadena_de_frio' || m.key === 'cadena_frio');
        if (coldMeta && (coldMeta.value === 'yes' || coldMeta.value === 'true' || coldMeta.value === 'on' || coldMeta.value === '1' || coldMeta.value === true)) return true;

        // 2. Keyword fallback (Name or Description)
        const searchStr = (p.name + ' ' + (p.short_description || '')).toLowerCase();
        const keywords = ['refriger', 'frio', 'frío', 'never', 'insulina', 'vacuna', 'pen', 'vial', 'ampolla'];
        return keywords.some(k => searchStr.includes(k));
    });

    if (coldProducts.length === 0) return null;

    return (
        <section className="relative w-full py-16 overflow-hidden">
            {/* Thematic Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-blue-50/50 to-white pointer-events-none" />

            {/* Decorative Animated Elements */}
            <div className="absolute -top-20 -right-20 opacity-[0.04] pointer-events-none animate-[spin_60s_linear_infinite]">
                <Snowflake className="w-[500px] h-[500px] text-blue-900" />
            </div>

            <div className="absolute top-20 left-10 opacity-[0.06] pointer-events-none animate-[bounce_12s_infinite]">
                <Snowflake className="w-24 h-24 text-sky-400" />
            </div>

            <div className="absolute bottom-10 left-1/3 opacity-[0.04] pointer-events-none animate-[pulse_4s_ease-in-out_infinite]">
                <Snowflake className="w-32 h-32 text-blue-500" />
            </div>

            <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-[5%]">
                <div className="w-full lg:w-[90%] mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-white p-3 rounded-2xl shadow-blue-100 shadow-lg border border-blue-100 flex items-center justify-center">
                                <ThermometerSnowflake className="w-8 h-8 text-blue-500 animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                                        Cadena de Frío
                                    </h2>
                                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                                        Control de Temperatura
                                    </span>
                                </div>
                                <p className="text-gray-500 max-w-lg text-sm leading-relaxed">
                                    Medicamentos especiales que requieren refrigeración continua garantizada para mantener su efectividad y seguridad.
                                </p>

                                <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 font-medium bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100">
                                    <Info className="w-3.5 h-3.5" />
                                    <span>Estos productos se envían en empaques térmicos especiales.</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="hidden md:flex items-center gap-2">
                            <button
                                ref={prevRef}
                                className="w-10 h-10 rounded-full border border-blue-100 bg-white text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                ref={nextRef}
                                className="w-10 h-10 rounded-full border border-blue-100 bg-white text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Products Carousel */}
                    <div className="relative group">
                        <Swiper
                            modules={[Navigation, Autoplay]}
                            spaceBetween={20}
                            slidesPerView={2}
                            loop={true}
                            navigation={{
                                prevEl: prevRef.current,
                                nextEl: nextRef.current,
                            }}
                            onBeforeInit={(swiper) => {
                                // @ts-expect-error Swiper navigation params
                                swiper.params.navigation.prevEl = prevRef.current;
                                // @ts-expect-error Swiper navigation params
                                swiper.params.navigation.nextEl = nextRef.current;
                            }}
                            autoplay={{
                                delay: 4000,
                                disableOnInteraction: false,
                            }}
                            breakpoints={{
                                640: { slidesPerView: 2, spaceBetween: 20 },
                                768: { slidesPerView: 3, spaceBetween: 24 },
                                1024: { slidesPerView: 4, spaceBetween: 24 },
                                1280: { slidesPerView: 5, spaceBetween: 24 },
                            }}
                            className="py-4 px-1"
                        >
                            {coldProducts.map((product) => {
                                const mappedProduct = mapWooProduct(product as unknown as WooProduct);
                                // Force isRefrigerated to true
                                mappedProduct.isRefrigerated = true;

                                return (
                                    <SwiperSlide key={product.id} className="h-full pt-2 pb-8">
                                        <div className="h-full transform hover:-translate-y-1 transition-transform duration-300">
                                            <ProductCard product={mappedProduct} />
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    </div>

                    {/* Mobile View All Button */}
                    <div className="mt-8 md:hidden text-center">
                        <Button variant="outline" className="w-full border-blue-200 text-blue-700" asChild>
                            <Link href="/categoria/medicamentos?feature=cold-chain">
                                Ver todo el catálogo
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
