"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ensureHttps } from "@/lib/utils";
import Link from "next/link";

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
        (selectedVariation?.stock_status === "outofstock" ? 0 : undefined);

    const isOutOfStock =
        variationStock === 0 || selectedVariation?.stock_status === "outofstock";

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
            variationId: selectedVariantId,
            attributes: {
                Color: selectedColor,
                Talla: selectedSize
            }
        });
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button - Floating */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-gray-400 hover:text-gray-900 rounded-full transition-all shadow-sm backdrop-blur-md border border-gray-100"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side - Image Gallery */}
                <div className="w-full md:w-1/2 bg-white relative border-r border-gray-100 h-[300px] md:h-auto">
                    {/* Discount Badge */}
                    {product?.discountPercentage && (
                        <div className="absolute top-6 left-6 bg-[#FFD700] text-black text-xs font-black px-3 py-1 rounded-full shadow-sm z-10">
                            -{product.discountPercentage}%
                        </div>
                    )}

                    <div className="relative w-full h-full">
                        <Image
                            src={mainImage}
                            alt={product?.name || ""}
                            fill
                            className="object-contain p-4"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>

                {/* Right Side - Product Details */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-w-0">

                    {/* Header Info */}
                    <div className="mb-6 pr-8">
                        {product?.brand && (
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 block">
                                {product.brand}
                            </span>
                        )}
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4 break-words">
                            {product?.name}
                        </h2>

                        <div className="flex items-end gap-3 mb-2">
                            <span className="text-4xl font-extrabold text-[var(--color-pharma-green)] tracking-tight">
                                {priceFmt.format(currentPrice)}
                            </span>
                            {product?.regularPrice > currentPrice && (
                                <span className="text-lg text-gray-400 line-through mb-1.5 font-medium">
                                    {priceFmt.format(product.regularPrice)}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                            Precio exclusivo tienda virtual
                        </p>
                    </div>

                    <div className="w-full h-px bg-gray-100 mb-6"></div>

                    {/* Controls Section */}
                    <div className="space-y-6 flex-grow">

                        {/* Variants would go here */}

                        {/* Quantity & Stock */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                    Cantidad
                                </label>
                                {!isOutOfStock && (
                                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                                        Disponible
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-1 py-1 w-fit shadow-sm">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-600 hover:text-[var(--color-pharma-blue)] hover:shadow-md transition-all disabled:opacity-50 disabled:shadow-none"
                                    >
                                        <span className="text-xl font-medium mb-1">−</span>
                                    </button>
                                    <span className="w-12 text-center font-bold text-lg text-gray-900">{quantity}</span>
                                    <button
                                        onClick={() => {
                                            const maxStock = variationStock || 999;
                                            setQuantity(Math.min(maxStock, quantity + 1));
                                        }}
                                        disabled={variationStock !== undefined && quantity >= variationStock}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-pharma-blue)] text-white hover:bg-[#003d99] hover:shadow-md transition-all disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                                    >
                                        <span className="text-xl font-medium mb-1">+</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-8 space-y-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`w-full py-4 bg-[var(--color-pharma-blue)] hover:bg-[#0044b3] text-white text-lg font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 hover:-translate-y-0.5 flex items-center justify-center gap-3 ${isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <ShoppingCart className="w-6 h-6" />
                            <span>{isOutOfStock ? 'Producto Agotado' : 'Agregar al Carrito'}</span>
                        </button>

                        <Link
                            href={`/producto/${product?.slug}`}
                            onClick={onClose}
                            className="block w-full text-center py-2 text-gray-500 hover:text-[var(--color-pharma-blue)] text-sm font-semibold transition-colors decoration-2 hover:underline underline-offset-4"
                        >
                            Ver todos los detalles del producto
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
