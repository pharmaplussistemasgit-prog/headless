"use client";

import ProductCard from "@/components/product/ProductCard";
import { MappedProduct } from "@/types/product";

interface ProductGridProps {
    products: MappedProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (!products || products.length === 0) {
        return (
            <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-100 border-dashed">
                <div className="text-5xl mb-4">🧪</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No se encontraron productos</h3>
                <p className="text-gray-500 mb-6">
                    Intenta consultar otras categorías o promociones.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
