'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { searchProducts } from '@/app/actions/products';
import { MappedProduct } from '@/types/product';
import { cn } from '@/lib/utils';


interface ProductAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    onSelect?: (product: MappedProduct) => void;
}

export default function ProductAutocomplete({
    value,
    onChange,
    placeholder = "Buscar medicamento...",
    className,
    onSelect
}: ProductAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<MappedProduct[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Simple debounce implementation inside component to avoid dependency issues if hook doesn't exist
    useEffect(() => {
        const timer = setTimeout(async () => {
            // Only search if value matches input (to avoid race conditions) and has length
            if (value.length >= 3 && isOpen) {
                try {
                    setIsLoading(true);
                    const products = await searchProducts(value);
                    setSuggestions(products);
                } catch (error) {
                    console.error("Autocomplete search error", error);
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            } else if (value.length < 3) {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value, isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (product: MappedProduct) => {
        onChange(product.name);
        if (onSelect) onSelect(product);
        setIsOpen(false);
        setSuggestions([]);
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        if (e.target.value.length >= 3) setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (value.length >= 3) setIsOpen(true);
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#00cc99]/30 focus:border-[#00cc99] outline-none transition-all placeholder-gray-400"
                    placeholder={placeholder}
                />
                <div className="absolute left-3 top-3.5 text-gray-400">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Search className="w-5 h-5" />
                    )}
                </div>
                {value && (
                    <button
                        type="button"
                        onClick={() => {
                            onChange('');
                            setSuggestions([]);
                            setIsOpen(false);
                        }}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((product) => (
                        <button
                            key={product.id}
                            type="button"
                            onClick={() => handleSelect(product)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                        >
                            <div className="relative w-10 h-10 bg-white rounded border border-gray-100 flex-shrink-0 p-0.5">
                                <Image
                                    src={product.images[0] || '/placeholder.png'}
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                                <p className="text-xs text-gray-500">
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.price)}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && value.length >= 3 && !isLoading && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-4 text-center text-gray-500 text-sm">
                    No se encontraron medicamentos.
                </div>
            )}
        </div>
    );
}
