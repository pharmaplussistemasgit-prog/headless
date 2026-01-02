"use client";

import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function WishlistPage() {
    const { items } = useWishlist();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-8 pb-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 italic tracking-tight uppercase">
                        Mi Lista de Deseos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                        Guarda tus favoritos ahora y decídete después. Aquí están tus selecciones de Saprix.
                    </p>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <Heart size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Tu lista de deseos está vacía
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                            No has guardado ningún artículo todavía. Explora nuestra colección y encuentra tu próximo equipo.
                        </p>
                        <Link
                            href="/tienda"
                            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold uppercase tracking-wider hover:bg-saprix-electric-blue dark:hover:bg-saprix-lime hover:text-white dark:hover:text-black transition-all duration-300 shadow-lg"
                        >
                            Ir a la Tienda
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                {items.length} {items.length === 1 ? "Artículo" : "Artículos"} guardados
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
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
                                            shortDescription: '',
                                            brand: null,
                                            invima: null,
                                            productType: null,
                                            requiresRx: false,
                                            isRefrigerated: false,
                                            discountPercentage: null,
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
