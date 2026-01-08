"use client";

import QuickAddModal from "@/components/product/QuickAddModal";
import { useQuickView } from "@/context/QuickViewContext";

export default function GlobalQuickView() {
    const { isOpen, closeQuickView, selectedProduct } = useQuickView();

    // If no product is selected, we don't render or pass empty
    if (!selectedProduct) return null;

    return (
        <QuickAddModal
            product={selectedProduct}
            isOpen={isOpen}
            onClose={closeQuickView}
            colorOptions={[]} // Future proofing
            sizeOptions={[]}
            variations={[]}
        />
    );
}
