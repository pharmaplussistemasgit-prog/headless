"use client";

import { Loader2 } from "lucide-react";

type AddToCartButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
  onAdd: () => void;
};

export default function AddToCartButton({ disabled, isLoading = false, stockStatus = 'instock', onAdd }: AddToCartButtonProps) {
  const isOutOfStock = stockStatus === 'outofstock';
  const isDisabled = disabled || isLoading || isOutOfStock;

  return (
    <div className="mt-8">
      <button
        type="button"
        id="btn-add-to-cart-main"
        disabled={isDisabled}
        onClick={onAdd}
        className={`w-full md:w-auto px-6 py-3 rounded-xl font-semibold transition shadow-sm hover:shadow-md flex items-center justify-center gap-2
          ${isDisabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[var(--color-pharma-blue)] text-white hover:bg-[#003d99]"}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Agregando...</span>
          </>
        ) : isOutOfStock ? (
          <span>Agotado</span>
        ) : (
          <span>Agregar al Carrito</span>
        )}
      </button>
    </div>
  );
}