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
        const imageUrl = product?.images?.[0]?.src || product?.image || "/placeholder-image.png";
        return ensureHttps(imageUrl);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    {/* Left: Image */}
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                            src={mainImage}
                            alt={product?.name || ""}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold uppercase tracking-tight text-black">
                                {product?.name}
                            </h2>
                            <div className="flex items-baseline gap-3 pt-2">
                                <span className="text-xl font-bold text-black">{priceFmt.format(currentPrice)}</span>
                            </div>
                        </div>

                        {/* Colors */}
                        {colorOptions && colorOptions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase">Colores</h3>
                                <div className="flex flex-wrap gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.option}
                                            onClick={() => setSelectedColor(color.option)}
                                            className={`w-14 h-14 border-2 transition-all ${selectedColor === color.option
                                                    ? "border-black opacity-100"
                                                    : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-300"
                                                }`}
                                        >
                                            <div className="w-full h-full bg-gray-100 relative overflow-hidden">
                                                {color.image ? (
                                                    <Image src={color.image} alt={color.option} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px]">
                                                        {color.option}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="text-xs text-gray-500 capitalize">{selectedColor}</div>
                            </div>
                        )}

                        {/* Sizes */}
                        {sizeOptions && sizeOptions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase">Tallas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {sizeAvailability.map((sz) => (
                                        <button
                                            key={sz.option}
                                            onClick={() => setSelectedSize(sz.option)}
                                            disabled={!sz.available}
                                            className={`h-10 min-w-[3.5rem] px-2 text-sm font-medium transition-all border ${selectedSize === sz.option
                                                    ? "bg-black text-white border-black"
                                                    : sz.available
                                                        ? "bg-white text-black border-gray-300 hover:border-black"
                                                        : "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                                                }`}
                                        >
                                            {sz.option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stock */}
                        {!isOutOfStock && typeof variationStock === 'number' && (
                            <div className="text-sm text-green-600 font-medium">
                                {variationStock} disponibles
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase">Cantidad</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                    -
                                </button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={`w-full bg-black text-white h-12 font-bold uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                <span>{isOutOfStock ? "Agotado" : "Agregar al carrito"}</span>
                                {!isOutOfStock && <ShoppingCart className="w-5 h-5" />}
                            </button>

                            <Link
                                href={`/${product?.slug}`}
                                className="block w-full text-center py-3 text-sm underline hover:no-underline"
                                onClick={onClose}
                            >
                                Ver detalles completos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
