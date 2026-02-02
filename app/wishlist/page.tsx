"use client";

import { useState } from "react";
import { useWishlist, WishlistItem } from "@/context/WishlistContext";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Scale, X, CheckSquare, Square } from "lucide-react";
import ComparisonModal from "@/components/wishlist/ComparisonModal";
import { toast } from "sonner";

export default function WishlistPage() {
    const { items } = useWishlist();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isCompareOpen, setIsCompareOpen] = useState(false);

    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
        } else {
            if (selectedIds.length >= 3) {
                toast.error("Máximo 3 productos para comparar");
                return;
            }
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const selectedProducts = items.filter(item => selectedIds.includes(item.id));

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-8 pb-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 italic tracking-tight uppercase">
                            Me Interesan
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                            Productos que has marcado porque te interesan.
                        </p>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <ClipboardList size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Aún no tienes productos que te interesen
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                            Explora nuestra colección y marca los productos que llamen tu atención.
                        </p>
                        <Link
                            href="/tienda"
                            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold uppercase tracking-wider hover:bg-blue-600 transition-all duration-300 shadow-lg rounded-xl"
                        >
                            Ir a la Tienda
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <span className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                                <ClipboardList className="w-4 h-4" />
                                {items.length} {items.length === 1 ? "Artículo" : "Artículos"} guardados
                            </span>
                            <span className="text-xs text-blue-600 font-medium">
                                Selecciona hasta 3 para comparar
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                            {items.map((item) => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative group"
                                    >
                                        {/* Compare Checkbox Overlay */}
                                        <div
                                            onClick={() => toggleSelection(item.id)}
                                            className={`absolute top-2 left-2 z-30 cursor-pointer p-2 rounded-full transition-all ${isSelected ? 'bg-[var(--color-pharma-blue)] text-white shadow-md' : 'bg-gray-200/50 hover:bg-white text-gray-500 hover:text-[var(--color-pharma-blue)]'}`}
                                            title="Seleccionar para comparar"
                                        >
                                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                        </div>

                                        <div className={isSelected ? 'ring-2 ring-[var(--color-pharma-blue)] rounded-xl transform scale-[1.02] transition-all' : ''}>
                                            <ProductCard
                                                product={{
                                                    id: item.id,
                                                    name: item.name,
                                                    slug: item.slug,
                                                    sku: null,
                                                    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                                                    regularPrice: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                                                    isOnSale: false,
                                                    stock: null,
                                                    isInStock: true,
                                                    showExactStock: false,
                                                    images: [item.image],
                                                    categories: item.category ? [{ id: 0, name: item.category, slug: item.category }] : [],
                                                    tags: [] as { id: number; name: string; slug: string }[],
                                                    shortDescription: '',
                                                    brand: null,
                                                    invima: null,
                                                    productType: null,
                                                    requiresRx: false,
                                                    isRefrigerated: false,
                                                    discountPercentage: null,
                                                    dateOnSaleFrom: null,
                                                    dateOnSaleTo: null,
                                                    averageRating: null,
                                                    ratingCount: 0,
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Floating Compare Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 flex items-center gap-6 max-w-md w-full"
                    >
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">Comparación</p>
                            <p className="text-xs text-gray-500">{selectedIds.length} productos seleccionados</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"
                            >
                                Limpiar
                            </button>
                            <button
                                onClick={() => setIsCompareOpen(true)}
                                className="px-5 py-2.5 bg-[var(--color-pharma-blue)] text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                                <Scale className="w-4 h-4" />
                                Comparar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ComparisonModal
                isOpen={isCompareOpen}
                onClose={() => setIsCompareOpen(false)}
                products={selectedProducts}
                onRemove={(id) => toggleSelection(id)}
            />
        </div>
    );
}
