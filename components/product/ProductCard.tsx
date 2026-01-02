'use client';

import { MappedProduct } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Snowflake, FileText, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: MappedProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="h-full border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group rounded-xl overflow-hidden relative flex flex-col bg-white">

      {/* Badges Flotantes (Superior Izquierda) */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
        {product.discountPercentage && (
          <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm">
            -{product.discountPercentage}%
          </span>
        )}
        {product.isRefrigerated && (
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-blue-200">
            <Snowflake className="w-3 h-3" /> Refrigerado
          </span>
        )}
        {product.requiresRx && (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-amber-200">
            <FileText className="w-3 h-3" /> Requiere Receta
          </span>
        )}
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        {/* Imagen */}
        <div className="relative h-44 w-full mb-4 bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>

        {/* Datos Farmacéuticos (Brand & Type) */}
        <div className="flex items-center gap-2 mb-1">
          {product.brand && (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.brand}</span>
          )}
          {product.productType && (
            <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 rounded border border-gray-200 uppercase">{product.productType}</span>
          )}
        </div>

        {/* Título */}
        <Link href={`/producto/${product.slug}`} className="block">
          <h4 className="font-bold text-[var(--color-primary-blue)] text-sm leading-tight line-clamp-2 mb-2 group-hover:text-[var(--color-action-green)] transition-colors min-h-[40px]">
            {product.name}
          </h4>
        </Link>

        {/* Registro Invima (Tooltip-like info) */}
        {product.invima && (
          <p className="text-[10px] text-gray-400 truncate mb-2" title={`Registro Invima: ${product.invima}`}>
            Invima: {product.invima}
          </p>
        )}

        {/* Stock Status */}
        <div className="mb-3">
          {!product.isInStock ? (
            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Agotado
            </span>
          ) : product.showExactStock ? (
            <span className="text-xs text-orange-500 font-medium animate-pulse">
              ¡Solo quedan {product.stock}!
            </span>
          ) : (
            <span className="text-xs text-green-600 font-medium">Disponible</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-gray-50 pt-3">
          <div className="flex flex-col">
            {product.isOnSale && (
              <span className="text-xs text-gray-400 line-through decoration-gray-400">
                {formatPrice(product.regularPrice)}
              </span>
            )}
            <span className={cn(
              "text-lg font-bold",
              product.isOnSale ? "text-red-500" : "text-gray-900"
            )}>
              {formatPrice(product.price)}
            </span>
          </div>

          <Button
            disabled={!product.isInStock}
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full shadow-md transition-all",
              product.isInStock
                ? "bg-[var(--color-action-green)] hover:bg-green-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}