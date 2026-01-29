"use client";

import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
    const { items, removeItem, updateQuantity, cartTotal, isOpen, toggleCart } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const fmt = new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Premium */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        id="cart-drawer-backdrop"
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
                    />

                    {/* Drawer Premium */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header con degradado PharmaPlus */}
                        <div className="bg-gradient-to-r from-[var(--color-pharma-blue)] to-[#0055D4] text-white p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight">Tu Carrito</h2>
                                        <p className="text-xs text-blue-100 font-medium">
                                            {items.length} {items.length === 1 ? 'producto' : 'productos'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleCart}
                                    id="btn-close-cart"
                                    className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Items Container */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/50">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                        <ShoppingBag className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-2">Tu carrito está vacío</h3>
                                    <p className="text-sm text-slate-500 mb-6">¡Agrega productos para comenzar!</p>
                                    <button
                                        onClick={toggleCart}
                                        id="btn-cart-continue-shopping"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-pharma-blue)] hover:bg-[#002780] text-white font-bold rounded-full transition-all shadow-lg shadow-blue-900/20"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Explorar Tienda
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 space-y-3">
                                    {items.map((item) => (
                                        <motion.div
                                            key={`${item.id}-${item.variationId || "simple"}`}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex gap-4">
                                                {/* Imagen */}
                                                <div className="relative w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                                    <Image
                                                        src={item.image || "/placeholder-image.png"}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 leading-snug mb-1">
                                                        {item.name}
                                                    </h3>
                                                    {item.attributes && (
                                                        <div className="text-xs text-slate-500 mb-2">
                                                            {Object.entries(item.attributes).map(([key, value]) => (
                                                                <span key={key} className="mr-2 capitalize">
                                                                    {key}: <strong>{value}</strong>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Precio Unitario */}
                                                    <p className="text-xs text-slate-400 font-medium">
                                                        {fmt.format(item.price)} c/u
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Footer del Item: Cantidad + Subtotal + Eliminar */}
                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-slate-100">
                                                {/* Controles de Cantidad */}
                                                <div className="flex items-center gap-1.5 bg-slate-50 rounded-full px-2 py-1 border border-slate-100">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(item.id, item.quantity - 1, item.variationId)
                                                        }
                                                        id={`btn-decrease-qty-${item.id}`}
                                                        disabled={item.quantity <= 1}
                                                        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-[var(--color-pharma-blue)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="text-sm font-bold text-slate-700 w-5 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(item.id, item.quantity + 1, item.variationId)
                                                        }
                                                        id={`btn-increase-qty-${item.id}`}
                                                        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-[var(--color-pharma-blue)] transition-all"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Subtotal + Eliminar */}
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-[var(--color-pharma-blue)] text-base">
                                                        {fmt.format(item.price * item.quantity)}
                                                    </span>
                                                    <button
                                                        onClick={() => removeItem(item.id, item.variationId)}
                                                        id={`btn-remove-item-${item.id}`}
                                                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Premium - Totales y CTAs */}
                        {items.length > 0 && (
                            <div className="bg-white border-t border-slate-100 p-5 space-y-4">
                                {/* Resumen de Totales */}
                                <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Subtotal</span>
                                        <span className="text-slate-700 font-semibold">{fmt.format(cartTotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Envío</span>
                                        <span className="text-slate-400 text-xs italic">Calculado al pagar</span>
                                    </div>
                                    <div className="border-t border-slate-200/70 pt-3 mt-2 flex items-center justify-between">
                                        <span className="text-base font-bold text-slate-800">Total Estimado</span>
                                        <span className="text-xl font-black text-[var(--color-pharma-blue)] tracking-tight">
                                            {fmt.format(cartTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* Botones de Acción */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href="/carrito"
                                        onClick={toggleCart}
                                        className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white border-2 border-[var(--color-pharma-blue)] text-[var(--color-pharma-blue)] font-bold rounded-full text-center transition-all hover:bg-blue-50"
                                    >
                                        Ver Carrito
                                    </Link>
                                    <Link
                                        href="/checkout"
                                        onClick={toggleCart}
                                        id="btn-proceed-to-checkout"
                                        className="flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[var(--color-pharma-blue)] to-[#0055D4] hover:from-[#002780] hover:to-[var(--color-pharma-blue)] text-white font-bold rounded-full text-center transition-all shadow-lg shadow-blue-900/20"
                                    >
                                        Ir a Pagar
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
