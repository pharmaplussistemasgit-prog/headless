"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { MappedProduct } from "@/types/product";

interface QuickViewContextType {
    openQuickView: (product: MappedProduct) => void;
    closeQuickView: () => void;
    selectedProduct: MappedProduct | null;
    isOpen: boolean;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export function QuickViewProvider({ children }: { children: ReactNode }) {
    const [selectedProduct, setSelectedProduct] = useState<MappedProduct | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openQuickView = (product: MappedProduct) => {
        setSelectedProduct(product);
        setIsOpen(true);
    };

    const closeQuickView = () => {
        setIsOpen(false);
        // Timeout to clear product after animation could work, but simple null check is safer for now
        // setTimeout(() => setSelectedProduct(null), 300); 
    };

    return (
        <QuickViewContext.Provider value={{ openQuickView, closeQuickView, selectedProduct, isOpen }}>
            {children}
        </QuickViewContext.Provider>
    );
}

export function useQuickView() {
    const context = useContext(QuickViewContext);
    if (context === undefined) {
        throw new Error("useQuickView must be used within a QuickViewProvider");
    }
    return context;
}
