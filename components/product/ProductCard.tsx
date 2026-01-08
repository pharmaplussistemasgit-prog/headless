import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Snowflake, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MappedProduct } from "@/types/product";
import { useQuickView } from "@/context/QuickViewContext";

interface ProductCardProps {
  product: MappedProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { openQuickView } = useQuickView();

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

  return (
    <>
      <Card
        className="h-full border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 group rounded-xl bg-white overflow-hidden flex flex-col cursor-pointer"
        onClick={handleOpenModal}
      >

        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {product.discountPercentage && (
            <span className="bg-[#FFD700] text-black text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm">
              -{product.discountPercentage}%
            </span>
          )}
          {product.isRefrigerated && (
            <span className="bg-blue-50/90 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm border border-blue-100">
              <Snowflake className="w-3 h-3" /> Frío
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
                className="object-contain group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          </div>

          {/* Separator */}
          <div className="w-full h-px bg-gray-100"></div>

          {/* Content Body */}
          <div className="p-5 flex flex-col flex-grow justify-between gap-4">
            <div>
              {/* Title - Click Trigger */}
              <div className="block mb-2">
                <h4 className="font-bold text-[#1e293b] text-[15px] leading-snug line-clamp-2 md:min-h-[42px] group-hover:text-[var(--color-primary-blue)] transition-colors uppercase">
                  {product.name}
                </h4>
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

              {/* Exclusive Price Label */}
              <div className="text-[11px] text-gray-400 font-light mb-1">
                Precio exclusivo web
              </div>
            </div>

            {/* Action Button - 0 Radius */}
            <div className="mt-auto">
              {/* Stop Propagation on Button to allow direct Add To Cart if needed, OR just open modal too. User requested Open Modal. */}
              <Button
                disabled={!product.isInStock}
                onClick={(e) => {
                  e.stopPropagation(); // Avoid double trigger if card also has logic, but we WANT modal.
                  handleOpenModal();
                }}
                className={cn(
                  "w-full h-10 rounded-none font-bold text-sm uppercase tracking-wide shadow-none transition-all flex items-center justify-center gap-2",
                  product.isInStock
                    ? "bg-[#0051cc] hover:bg-[#003d99] text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                )}
              >
                {product.isInStock ? (
                  <>
                    <span>Comprar</span>
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
        </CardContent>
      </Card>
    </>
  );
}