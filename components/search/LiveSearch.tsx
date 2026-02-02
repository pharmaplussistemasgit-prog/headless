'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Plus, ShoppingCart, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchProducts } from '@/app/actions/products'; // Correct import path
import { MappedProduct } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
// ... (I will use multi_replace or specific replace calls to be precise)


export default function LiveSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MappedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { addItem } = useCart();

    // Self-contained AddToCart logic for the "+" button
    const [addedIds, setAddedIds] = useState<number[]>([]);

    const handleAddToCart = (e: React.MouseEvent, product: MappedProduct) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product.id,
            name: product.name,
            slug: product.slug, // Fix: Add slug
            price: product.price,
            image: product.images[0],
            quantity: 1,
            attributes: {}, // Simple add for now
            categories: product.categories // Pass categories for cold chain logic
        });

        // Show feedback
        setAddedIds(prev => [...prev, product.id]);
        setTimeout(() => {
            setAddedIds(prev => prev.filter(id => id !== product.id));
        }, 2000);
    };

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 3) {
                setIsLoading(true);
                setIsOpen(true);
                try {
                    const products = await searchProducts(query);
                    setResults(products);
                } catch (error) {
                    console.error("Search error", error);
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            router.push(`/tienda?search=${encodeURIComponent(query)}`);
        }
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-2xl">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    className="w-full h-12 pl-6 pr-14 rounded-full border-2 border-[var(--color-pharma-blue)] bg-white text-[var(--color-text-dark)] placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-all text-[15px] font-medium"
                    placeholder="Buscar productos, marcas y más..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.length >= 3 && results.length > 0) setIsOpen(true);
                    }}
                />

                <button
                    type="submit"
                    aria-label="Buscar productos"
                    className="absolute right-1.5 top-1.5 h-9 w-9 bg-[var(--color-pharma-green)] hover:bg-[#007a38] rounded-full flex items-center justify-center text-white transition-colors shadow-sm"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                </button>
            </form>

            {/* Results Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {results.length > 0 ? (
                            <>
                                <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Resultados para "{query}"
                                </p>
                                {results.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0 relative"
                                    >
                                        <Link href={`/producto/${product.slug}`} className="absolute inset-0 z-0" onClick={() => setIsOpen(false)} />

                                        {/* Image */}
                                        <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-100 p-1 flex-shrink-0">
                                            <Image
                                                src={product.images[0] || '/placeholder.png'}
                                                alt={product.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-[var(--color-pharma-blue)] transition-colors">
                                                {product.name}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-[var(--color-pharma-green)]">
                                                    {formatPrice(product.price)}
                                                </span>
                                                {product.isOnSale && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {formatPrice(product.regularPrice)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Add Button - The "+" Requested */}
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className={cn(
                                                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm flex-shrink-0",
                                                addedIds.includes(product.id)
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-[var(--color-pharma-blue)] hover:bg-[var(--color-blue-classic)] text-white hover:scale-110"
                                            )}
                                            title="Agregar al carrito"
                                        >
                                            {addedIds.includes(product.id) ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <Plus className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                                <Link
                                    href={`/tienda?search=${encodeURIComponent(query)}`}
                                    className="block p-3 text-center text-sm font-bold text-[var(--color-pharma-blue)] bg-blue-50/50 hover:bg-blue-50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Ver todos los resultados
                                </Link>
                            </>
                        ) : (
                            !isLoading && (
                                <div className="p-8 text-center text-gray-500">
                                    <p className="text-sm">No encontramos productos que coincidan.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
