'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart, Check, Info, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { MappedProduct } from '@/types/product';

interface ProductDetailsProps {
    product: MappedProduct;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(product.images[0] || '/placeholder.png');

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && (!product.stock || newQty <= product.stock)) {
            setQuantity(newQty);
        }
    };

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] || '/placeholder.png',
            quantity: quantity,
            slug: product.slug,
        });
        toast.success(`Agregado al carrito: ${product.name}`);
    };

    return (
        <div className="bg-white min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb Placeholder */}
                <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                    <span>Inicio</span>
                    <span>/</span>
                    <span>{product.categories?.[0]?.name || 'Tienda'}</span>
                    <span>/</span>
                    <span className="font-semibold text-[var(--color-primary-blue)]">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                            <Image
                                src={activeImage}
                                alt={product.name}
                                fill
                                className="object-contain p-8 mix-blend-multiply"
                                priority
                            />
                            {product.isOnSale && product.discountPercentage && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                    -{product.discountPercentage}%
                                </div>
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative w-20 h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 bg-gray-50 ${activeImage === img ? 'border-[var(--color-primary-blue)]' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} thumbnail ${idx + 1}`}
                                            fill
                                            className="object-contain p-2 mix-blend-multiply"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col">
                        <div className="flex-1">
                            {product.brand && (
                                <p className="text-sm font-bold text-[var(--color-primary-green)] uppercase tracking-wide mb-2">
                                    {product.brand}
                                </p>
                            )}
                            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-primary-blue)] mb-4 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-3xl font-bold text-[var(--color-pharma-green)]">
                                    ${product.price.toLocaleString('es-CO')}
                                </div>
                                {product.isOnSale && (
                                    <div className="text-lg text-gray-400 line-through">
                                        ${product.regularPrice.toLocaleString('es-CO')}
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-sm text-gray-600 mb-8 max-w-none" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />

                            {/* Attributes / Badges */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {product.isInStock ? (
                                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg text-sm font-medium">
                                        <Check size={18} />
                                        <span>Disponible en stock</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded-lg text-sm font-medium">
                                        <Info size={18} />
                                        <span>Agotado</span>
                                    </div>
                                )}
                                {product.requiresRx && (
                                    <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium">
                                        <Info size={18} />
                                        <span>Requiere Fórmula Médica</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center border border-gray-300 rounded-lg h-12">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="w-12 h-full flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-12 text-center font-bold text-[var(--color-primary-blue)] text-lg">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="w-12 h-full flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50"
                                        disabled={product.stock ? quantity >= product.stock : false}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.isInStock}
                                    className="flex-1 bg-[var(--color-action-green)] text-white h-12 rounded-lg font-bold text-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart size={20} />
                                    <span>Comprar</span>
                                </button>
                            </div>
                        </div>

                        {/* Extra Trust Badges */}
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                <ShieldCheck className="text-[var(--color-primary-blue)] w-6 h-6 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-[var(--color-primary-blue)] text-sm">Garantía de Calidad</h4>
                                    <p className="text-xs text-gray-500 mt-1">Productos 100% originales y certificados.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
