'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/woocommerce';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface FlashDealsProps {
    title?: ReactNode | string;
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

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="w-full bg-[var(--color-bg-light)] py-6">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-[5%]">
                {/* White container */}
                <div className="relative bg-white py-8 px-4 lg:px-6 rounded-3xl shadow-sm">
                    <div className="w-full lg:w-[98%] mx-auto">
                        {/* Header */}
                        <div className="mb-6 flex items-end justify-between">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold italic">
                                    <span className="text-[var(--color-pharma-blue)]">Mundo</span>{' '}
                                    <span className="text-[var(--color-pharma-green)]">Ofertas</span>
                                </h2>
                                <div className="w-24 h-1 bg-[var(--color-pharma-green)] mt-2 rounded-full"></div>
                            </div>
                            <Link href="/ofertas" className="text-sm font-bold text-[var(--color-pharma-blue)] hover:underline hidden sm:block">
                                Ver todas las ofertas →
                            </Link>
                        </div>

                        {/* Flash Deals Carousel */}
                        <div className="relative flash-deals-swiper-container">
                            <Swiper
                                modules={[Navigation, Autoplay]}
                                spaceBetween={20}
                                slidesPerView={1}
                                navigation
                                autoplay={{
                                    delay: 6000,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true
                                }}
                                breakpoints={{
                                    640: { slidesPerView: 1 },
                                    768: { slidesPerView: 1 }, // Tablet still 1 per row for better horizontal layout fit
                                    1024: { slidesPerView: 2 }, // Desktop 2 columns
                                    1280: { slidesPerView: 2 }
                                }}
                                className="pb-10"
                            >
                                {products.map((product) => {
                                    const discount = getDiscountPercentage(product);
                                    const stock = product.stock_quantity || 100;

                                    return (
                                        <SwiperSlide key={product.id} className="h-auto">
                                            <FlashDealCard
                                                product={product}
                                                discount={discount}
                                                stock={stock}
                                            />
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        </div>

                        <div className="text-center mt-4 sm:hidden">
                            <Link href="/ofertas" className="text-sm font-bold text-[var(--color-pharma-blue)] hover:underline">
                                Ver todas las ofertas →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper
const getDiscountPercentage = (product: Product) => {
    if (product.sale_price && product.regular_price) {
        const discount = ((parseFloat(product.regular_price) - parseFloat(product.sale_price)) / parseFloat(product.regular_price)) * 100;
        return Math.round(discount);
    }
    return 0;
};

// Date Formatter Helper
const formatDate = (dateString?: string) => {
    if (!dateString) return '...'; // Fallback
    try {
        const date = new Date(dateString);
        // Fix timezone offset issue if needed (Woo usually sends UTC or Local)
        // Simple formatter: "21 De Feb 2025"
        return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    } catch (e) {
        return '';
    }
};

// Flash Deal Card Component (Horizontal Layout)
function FlashDealCard({ product, discount, stock }: { product: Product; discount: number; stock: number }) {
    // Logic for Countdown
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const { addItem } = useCart();

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: parseFloat(product.sale_price || product.price || '0'),
            image: product.images[0]?.src || '/placeholder.png',
            quantity: 1,
            slug: product.slug,
            sku: product.sku
        });
        toast.success(`¡Agregado con oferta! ${product.name}`);
    };

    useEffect(() => {
        // Determine End Date logic
        let endDate: Date;

        if (product.date_on_sale_to) {
            // Real Data
            endDate = new Date(product.date_on_sale_to);
            if (product.date_on_sale_to.length === 10) {
                endDate.setHours(23, 59, 59);
            }
        } else {
            // MOCK DATA (Unique per product ID)
            // Seed based on Product ID to ensure every product has a DIFFERENT time
            // We'll create a cycle so it's consistent for that product
            const now = new Date();
            const idLast2 = product.id % 100;
            // Generate distinct hours remaining: (ID % 24) + 2 hours minimum
            const hoursRemaining = (idLast2 % 24) + 2;
            const minutesRemaining = (idLast2 * 3) % 60;

            endDate = new Date(now);
            endDate.setHours(now.getHours() + hoursRemaining);
            endDate.setMinutes(now.getMinutes() + minutesRemaining);
        }

        const calculateTimeLeft = () => {
            const difference = +endDate - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                // Restart mock timer for visual continuity if it was mock, or null if real
                // Keeping it simple: just show 00
                setTimeLeft(null);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [product.date_on_sale_to, product.id]);


    const stockPercentage = (stock / (stock + 20)) * 100;

    return (
        <div className="relative bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col sm:flex-row group min-h-[300px]">

            {/* Left Column: Image (40-45%) */}
            <div className="w-full sm:w-[45%] flex flex-col relative justify-center items-center bg-gray-50 rounded-xl p-4 mb-4 sm:mb-0">
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 z-10">
                    {discount > 0 && (
                        <span className="bg-[#FF4D8D] text-white font-bold text-xs px-2 py-1 rounded-full shadow-sm animate-pulse">
                            -{discount}%
                        </span>
                    )}
                </div>

                <Link href={`/producto/${product.slug}`} className="relative w-full h-48 sm:h-full min-h-[180px] flex items-center justify-center">
                    <Image
                        src={product.images[0]?.src || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>
            </div>

            {/* Right Column: Info & Actions (55-60%) */}
            <div className="w-full sm:w-[55%] pl-0 sm:pl-5 flex flex-col justify-between">

                {/* Header Info */}
                <div>
                    <Link href={`/producto/${product.slug}`} className="block mb-2">
                        {/* Ensure strict height for Title to allow alignment */}
                        <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 leading-tight hover:text-[var(--color-pharma-blue)] transition-colors min-h-[2.5em]">
                            {product.name}
                        </h3>
                    </Link>

                    {/* Price Block */}
                    <div className="mb-4">
                        {product.sale_price && product.regular_price ? (
                            <div className="flex flex-col">
                                <span className="text-2xl lg:text-3xl font-black text-[var(--color-pharma-green)]">
                                    ${parseFloat(product.sale_price).toLocaleString('es-CO')}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                    Precio Normal: ${parseFloat(product.regular_price).toLocaleString('es-CO')}
                                </span>
                            </div>
                        ) : (
                            <span className="text-2xl font-black text-[var(--color-pharma-green)]">
                                ${parseFloat(product.price || '0').toLocaleString('es-CO')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions & Timer */}
                <div className="flex flex-col gap-3">

                    {/* Timer */}
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                            Termina en:
                        </p>

                        {/* Date Range Display (New Request) */}
                        <div className="text-[10px] text-gray-400 font-medium mb-2 flex items-center gap-1">
                            <span>📅</span>
                            <span>
                                {formatDate(product.date_on_sale_from)} / {formatDate(product.date_on_sale_to)}
                            </span>
                        </div>

                        {timeLeft ? (
                            <div className="flex gap-2">
                                <CountdownBox value={timeLeft.days} label="Días" />
                                <CountdownBox value={timeLeft.hours} label="Hrs" />
                                <CountdownBox value={timeLeft.minutes} label="Min" />
                                <CountdownBox value={timeLeft.seconds} label="Seg" />
                            </div>
                        ) : (
                            <div className="text-xs text-red-500 font-bold">¡Oferta Finalizada!</div>
                        )}
                    </div>

                    {/* Stock & Button Row */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">

                        {/* Stock Left */}
                        <div className="flex-1 max-w-[50%]">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-gray-500 font-bold uppercase">Disponibles</span>
                                <span className="text-[9px] text-[var(--color-pharma-green)] font-bold">{stock}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-[var(--color-pharma-green)] h-full rounded-full"
                                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Visible Add Button */}
                        <button
                            onClick={handleAddToCart}
                            className="bg-[var(--color-pharma-blue)] hover:bg-[#005a9c] text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-transform transform hover:scale-105 shadow-md group-hover:shadow-lg"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span className="text-xs font-bold">Agregar</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Countdown Box
function CountdownBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="bg-gray-50 rounded border border-gray-100 text-center px-1.5 py-1 min-w-[32px]">
            <span className="block text-sm font-black text-[var(--color-pharma-blue)] leading-none mb-0.5">
                {String(value).padStart(2, '0')}
            </span>
            <span className="block text-[7px] text-gray-600 font-bold uppercase tracking-wide">
                {label}
            </span>
        </div>
    );
}
