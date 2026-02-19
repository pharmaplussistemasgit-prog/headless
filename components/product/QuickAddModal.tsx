"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ensureHttps } from "@/lib/utils";
import Link from "next/link";
import ColdChainAlert from "@/components/product/ColdChainAlert";

type ColorOption = { option: string; variations: number[]; image?: string };
type SizeOption = { option: string; variations: number[] };

interface QuickAddModalProps {
    product: any;
    colorOptions: ColorOption[];
    sizeOptions: SizeOption[];
    variations: any[];
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickAddModal({
    product,
    colorOptions,
    sizeOptions,
    variations,
    isOpen,
    onClose,
}: QuickAddModalProps) {
    const [selectedColor, setSelectedColor] = useState<string>(colorOptions?.[0]?.option ?? "");
    const [selectedSize, setSelectedSize] = useState<string>(sizeOptions?.[0]?.option ?? "");
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();

    const selectedVariantId = useMemo(() => {
        const c = colorOptions.find((x) => x.option === selectedColor)?.variations ?? [];
        const s = sizeOptions.find((x) => x.option === selectedSize)?.variations ?? [];
        const inter = c.filter((id) => s.includes(id));
        return inter[0];
    }, [selectedColor, selectedSize, colorOptions, sizeOptions]);

    const sizeAvailability = useMemo(() => {
        return sizeOptions.map((s) => {
            const cvars = colorOptions.find((x) => x.option === selectedColor)?.variations ?? [];
            const inter = cvars.filter((id) => s.variations.includes(id));
            return { option: s.option, available: inter.length > 0 };
        });
    }, [selectedColor, colorOptions, sizeOptions]);

    const selectedVariation = useMemo(
        () => variations?.find((v) => v.id === selectedVariantId),
        [selectedVariantId, variations]
    );

    const variationStock =
        selectedVariation?.stock_quantity ??
        (selectedVariation?.stock_status === "outofstock" ? 0 : product?.stock ?? undefined);

    const isOutOfStock =
        (variationStock === 0) ||
        (selectedVariation ? selectedVariation.stock_status === "outofstock" : !product?.isInStock);

    const priceFmt = useMemo(() => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        });
    }, []);

    const currentPrice = useMemo(() => {
        if (selectedVariation) {
            return Number(selectedVariation.price || selectedVariation.sale_price || selectedVariation.regular_price || 0);
        }
        return Number(product?.price || 0);
    }, [selectedVariation, product]);

    const mainImage = useMemo(() => {
        // Handle MappedProduct (string[]) vs WooProduct (object[]) difference
        const firstImage = product?.images?.[0];
        if (typeof firstImage === 'string') return ensureHttps(firstImage);
        return ensureHttps(firstImage?.src || product?.image || "/placeholder-image.png");
    }, [product]);

    function handleAddToCart() {
        addItem({
            id: product?.id || 0,
            name: product?.name || "",
            price: currentPrice,
            quantity: quantity,
            image: mainImage,
            slug: product?.slug || "",
            sku: product?.sku || undefined, // T19: ERP Support
            variationId: selectedVariantId,
            attributes: {
                Color: selectedColor,
                Talla: selectedSize
            },
            categories: product?.categories // Pass categories for cold chain logic
        });
        onClose();
    }

    // Zoom State
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Expanded width to max-w-6xl for desktop - Softer shadow */}
            <div className="relative w-full max-w-6xl bg-white shadow-xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button - Floating & Pharma Blue */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/90 hover:bg-white text-[var(--color-pharma-blue)] hover:text-blue-700 rounded-full transition-all shadow-md backdrop-blur-md border border-blue-100/50"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content Area - Scrollbar Hidden but Scrollable */}
                <div className="flex flex-col md:flex-row flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                    {/* Left Side - Image Gallery with Zoom */}
                    <div className="w-full md:w-1/2 bg-white relative border-r border-gray-50 p-2 md:p-4 flex flex-col justify-center items-center min-h-[350px]">
                        {/* Discount Badge */}
                        {product?.discountPercentage && (
                            <div className="absolute top-6 left-6 bg-[#FFD700] text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm z-10">
                                -{product.discountPercentage}%
                            </div>
                        )}

                        <div
                            className="relative w-full h-[350px] md:h-[600px] cursor-zoom-in overflow-hidden"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                        >
                            <Image
                                src={mainImage}
                                alt={product?.name || ""}
                                fill
                                className="object-contain transition-transform duration-200 ease-out"
                                style={{
                                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                                }}
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </div>

                    {/* Right Side - Product Details */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">

                        {/* Header Info */}
                        <div className="mb-4 pr-8">
                            {product?.brand && (
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    {product.brand}
                                </span>
                            )}
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mb-3 break-words">
                                {product?.name}
                            </h2>

                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-3xl font-extrabold text-[var(--color-pharma-green)] tracking-tight">
                                    {priceFmt.format(currentPrice)}
                                </span>
                                {product?.regularPrice > currentPrice && (
                                    <span className="text-base text-gray-400 line-through mb-1 font-medium">
                                        {priceFmt.format(product.regularPrice)}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">
                                Precio exclusivo tienda virtual
                            </p>

                            {/* Cold Chain Alert */}
                            <div className="mt-3">
                                <ColdChainAlert categories={product?.categories || []} product={product} />
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-100 mb-4"></div>

                        {/* Controls Section */}
                        <div className="space-y-4">
                            {/* Quantity & Stock */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">
                                        Cantidad
                                    </label>
                                    {!isOutOfStock ? (
                                        <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            Disponible
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                            Agotado
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-1 py-1 w-fit shadow-sm">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 hover:text-[var(--color-pharma-blue)] hover:shadow-md transition-all disabled:opacity-50 disabled:shadow-none"
                                        >
                                            <span className="text-lg font-medium mb-0.5">−</span>
                                        </button>
                                        <span className="w-10 text-center font-bold text-base text-gray-900">{quantity}</span>
                                        <button
                                            onClick={() => {
                                                const maxStock = variationStock || 999;
                                                setQuantity(Math.min(maxStock, quantity + 1));
                                            }}
                                            disabled={variationStock !== undefined && quantity >= variationStock}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-pharma-blue)] text-white hover:bg-[#003d99] hover:shadow-md transition-all disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                                        >
                                            <span className="text-lg font-medium mb-0.5">+</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer - Fixed Spacing */}
                        <div className="mt-6 flex flex-col gap-3">
                            {!isOutOfStock ? (
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full py-3 bg-[var(--color-pharma-blue)] hover:bg-[#0044b3] text-white text-base font-bold rounded-xl transition-all shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>Agregar al carrito</span>
                                </button>
                            ) : (
                                <div className="mb-2 p-3 bg-red-50 border border-red-100 rounded-xl flex flex-col gap-2">
                                    <div className="flex items-start gap-2">
                                        <div className="bg-red-100 p-1.5 rounded-full text-red-600 shrink-0 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                                        </div>
                                        <p className="text-xs text-red-600 leading-snug font-medium">
                                            En el momento no hay producto en existencias, por favor comuniquese con nuestras lineas de atencion para consultar disponibilidad
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full mt-1">
                                        <a
                                            href="tel:6015934010"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[var(--color-pharma-blue)] text-white rounded-lg hover:bg-blue-800 transition-colors text-xs font-bold"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                            </svg>
                                            PBX: (601) 593 - 4010
                                        </a>
                                        <a
                                            href="https://wa.me/573168397933"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors text-xs font-bold"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                                            WhatsApp: +57 316 839 7933
                                        </a>
                                    </div>
                                </div>
                            )}

                            <Link
                                href={`/${product?.slug}`}
                                onClick={onClose}
                                className="w-full py-2.5 bg-white border border-[var(--color-pharma-blue)] text-[var(--color-pharma-blue)] hover:bg-blue-50 text-xs font-bold rounded-lg transition-all flex items-center justify-center"
                            >
                                Ver todos los detalles
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Specs Section - Centered & Compact */}
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 shrink-0">
                    <div className="max-w-4xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-8 text-[10px] md:text-xs">
                        {product?.brand && product.brand !== 'N/A' && (
                            <div className="flex flex-col items-start text-left">
                                <span className="font-bold text-gray-400 uppercase tracking-wide mb-0.5">Marca</span>
                                <span className="font-semibold text-gray-700 truncate w-full">{product.brand}</span>
                            </div>
                        )}
                        <div className="flex flex-col items-start text-left">
                            <span className="font-bold text-gray-400 uppercase tracking-wide mb-0.5">Presentación</span>
                            <span className="font-semibold text-gray-700 uppercase">UNIDAD</span>
                        </div>
                        {product?.invima && product.invima !== 'N/A' && (
                            <div className="flex flex-col items-start text-left">
                                <span className="font-bold text-gray-400 uppercase tracking-wide mb-0.5">ID Invima</span>
                                <span className="font-semibold text-gray-700 truncate w-full">{product.invima}</span>
                            </div>
                        )}
                        {product?.productType && product.productType !== 'N/A' && (
                            <div className="flex flex-col items-start text-left">
                                <span className="font-bold text-gray-400 uppercase tracking-wide mb-0.5">Tipo</span>
                                <span className="font-semibold text-gray-700 uppercase">{product.productType}</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
