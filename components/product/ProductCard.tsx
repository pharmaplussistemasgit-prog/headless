"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Snowflake, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MappedProduct } from "@/types/product";
import { useQuickView } from "@/context/QuickViewContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart } from "lucide-react";
import { isColdChain } from "@/lib/coldChain";
import { getProductPromo } from "@/lib/promotions";

import OfferCountDown from "./OfferCountDown";

interface ProductCardProps {
  product: MappedProduct;
  variant?: 'default' | 'offer';
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { openQuickView } = useQuickView();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  const isFavorite = isInWishlist(product.id);
  const promoLabel = getProductPromo(product);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenModal = () => {
    openQuickView(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Si el producto tiene variaciones (type === 'variable'), abrir modal
    // De lo contrario, agregar directamente al carrito
    if (product.type === 'variable') {
      openQuickView(product);
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/placeholder.png',
        quantity: 1,
        slug: product.slug,
        promotion: product.promotion,
        // Categories and Rx Flag for Logic
        categories: product.categories,
        requiresPrescription: product.requiresRx
      });
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.png',
      slug: product.slug,
      category: product.categories?.[0]?.name
    });
  };

  return (
    <>
      <Card
        className="h-full border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 group rounded-xl bg-white overflow-hidden flex flex-col cursor-pointer relative"
        onClick={handleOpenModal}
      >

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all group/wishlist"
          aria-label={isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-gray-400 group-hover/wishlist:text-red-500"
            )}
          />
        </button>

        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {promoLabel && (
            <span className="bg-[#9333ea] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 animate-pulse">
              {promoLabel}
            </span>
          )}
          {product.discountPercentage && (
            <span className="bg-[#FFD700] text-black text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm">
              -{product.discountPercentage}%
            </span>
          )}
          {isColdChain(product.categories, product) && (
            <span className="bg-blue-50/90 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm border border-blue-100">
              <Snowflake className="w-3 h-3" /> Cadena de Frío
            </span>
          )}
          {product.isOnSale && (
            <span className="bg-[#EF4444] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
              ¡OFERTA!
            </span>
          )}
        </div>


        <CardContent className="p-0 flex flex-col flex-grow relative">
          {/* Images Area - Click Trigger */}
          <div className="relative h-48 w-full bg-white p-6 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={product.images[0] || '/placeholder.png'}
                alt={product.name}
                fill
                quality={75}
                className="object-contain group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            </div>

            {/* Offer Timer Overlay */}
            {variant === 'offer' && product.isOnSale && product.dateOnSaleTo && (
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-1.5 border-t border-red-100 flex justify-center">
                <OfferCountDown targetDate={product.dateOnSaleTo} size="sm" className="scale-90 origin-bottom" />
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="w-full h-px bg-gray-100"></div>

          {/* Content Body */}
          <div className="p-5 flex flex-col flex-grow justify-between gap-4">
            <div>
              {/* Title - Click Trigger */}
              <div className="block mb-2">
                <h3 className="font-bold text-[#1e293b] text-[15px] leading-snug line-clamp-2 md:min-h-[42px] group-hover:text-[var(--color-primary-blue)] transition-colors uppercase">
                  {product.name}
                </h3>
              </div>

              {/* Brand */}
              {product.brand ? (
                <span className="text-[12px] text-gray-500 font-light uppercase tracking-wide block mb-3">
                  {product.brand}
                </span>
              ) : (
                <span className="text-[12px] text-gray-300 font-light uppercase tracking-wide block mb-3 opacity-0 select-none">
                  -
                </span>
              )}

              {/* Price Area */}
              <div className="mb-1">
                <span className={cn(
                  "text-xl font-extrabold tracking-tight block",
                  "text-[var(--color-pharma-green)]"
                )}>
                  {formatPrice(product.price)}
                </span>
                {product.isOnSale && (
                  <span className="text-xs text-gray-400 line-through decoration-gray-400">
                    {formatPrice(product.regularPrice)}
                  </span>
                )}
              </div>

            </div>
            <div className="mt-auto">
              {/* Agregar al carrito directamente, o abrir modal si tiene variaciones */}
              <Button
                disabled={!product.isInStock}
                onClick={handleAddToCart}
                className={cn(
                  "w-full h-10 rounded-xl font-bold text-sm uppercase tracking-wide shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2",
                  product.isInStock
                    ? "bg-[var(--color-pharma-blue)] hover:bg-[#003d99] text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                )}
              >
                {product.isInStock ? (
                  <>
                    <span>Agregar al carrito</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    <span>Agotado</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent >
      </Card >
    </>
  );
}