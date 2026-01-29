'use client';

import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SmartCrossSell from '@/components/checkout/SmartCrossSell';

export default function CartPage() {
    const { items, removeItem, updateQuantity, cartTotal, subtotal, discountTotal, appliedPromos } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[var(--color-bg-light)] py-12">
            <div className="w-full lg:w-[90%] mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-4 px-4 lg:px-0">
                    <h1 className="text-3xl md:text-4xl font-bold italic flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-[var(--color-pharma-green)]" />
                        <span>
                            <span className="text-[var(--color-pharma-blue)]">Tu</span>{' '}
                            <span className="text-[var(--color-pharma-green)]">Carrito</span>
                        </span>
                    </h1>
                    <span className="bg-white text-[var(--color-pharma-blue)] px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-gray-100">
                        {items.length} productos
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100/50">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-12 h-12 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            ¡Dale vida a tus días! Explora nuestros productos y encuentra todo lo que necesitas para tu bienestar.
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 bg-[var(--color-pharma-blue)] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                            Explorar Tienda
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                        {/* LEFT COL: Cart Items List (8 cols) */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100/50 overflow-hidden">
                                {items.map((item, index) => (
                                    <div
                                        key={`${item.id}-${item.variationId || "simple"}`}
                                        className={`p-6 flex flex-col sm:flex-row gap-6 ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}`}
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-full sm:w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                                            <Image
                                                src={item.image || "/placeholder-image.png"}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>

                                        {/* Info & Controls */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="mb-4 sm:mb-0">
                                                <div className="flex justify-between items-start gap-4">
                                                    <h3 className="font-bold text-lg text-gray-800 line-clamp-2 leading-tight">
                                                        <Link href={`/${item.slug}`} className="hover:text-[var(--color-pharma-blue)] transition-colors">
                                                            {item.name}
                                                        </Link>
                                                    </h3>
                                                    <button
                                                        onClick={() => removeItem(item.id, item.variationId)}
                                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                                                        aria-label="Eliminar producto"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                {item.attributes && (
                                                    <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                                                        {Object.entries(item.attributes).map(([key, value]) => (
                                                            <span key={key} className="inline-block bg-gray-50 px-2 py-0.5 rounded mr-2 capitalize">
                                                                {key}: {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-end">
                                                {/* Qty Selector */}
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 border border-gray-100">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variationId)}
                                                        disabled={item.quantity <= 1}
                                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 shadow-sm hover:text-[var(--color-pharma-blue)] disabled:opacity-50 disabled:shadow-none transition-all"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-bold text-gray-700 w-6 text-center tabular-nums">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variationId)}
                                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 shadow-sm hover:text-[var(--color-pharma-blue)] transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <span className="block text-xs text-gray-400 font-medium">Total</span>
                                                    <span className="text-xl font-bold text-[var(--color-pharma-blue)]">
                                                        ${(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT COL: Summary Card (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100/50 sticky top-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen del pedido</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-gray-900">${(subtotal || 0).toLocaleString()}</span>
                                    </div>

                                    {discountTotal > 0 && (
                                        <div className="flex justify-between text-[var(--color-pharma-green)]">
                                            <span className="flex items-center gap-1 font-bold"><Tag size={14} /> Ahorro Promo</span>
                                            <span className="font-bold">-${(discountTotal || 0).toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-600">
                                        <span>Envío</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">Calculado en Checkout</span>
                                    </div>
                                    <div className="w-full h-px bg-gray-100 my-4" />
                                    <div className="flex justify-between items-end">
                                        <span className="text-lg font-bold text-gray-900">Total Estimado</span>
                                        <span className="text-3xl font-bold text-[var(--color-pharma-blue)]">
                                            ${(cartTotal || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="w-full bg-[var(--color-pharma-blue)] text-white h-14 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 uppercase tracking-wide"
                                >
                                    Ir a Pagar
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <div className="mt-6 flex items-start gap-3 text-xs text-gray-400 bg-gray-50 p-4 rounded-xl">
                                    <div className="min-w-[16px]">🛡️</div>
                                    <p>
                                        Tus datos personales están protegidos. Procesamos cada compra con los estándares más altos de seguridad.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* THE BRAIN: Smart Recommendation Engine */}
                <div className="pt-8">
                    <SmartCrossSell />
                </div>

            </div>
        </div>
    );
}
