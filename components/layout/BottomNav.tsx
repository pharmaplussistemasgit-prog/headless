'use client';

import Link from 'next/link';
import { Search, User, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const { toggleCart, cartCount } = useCart();
    const pathname = usePathname();

    // Scroll to search or focus search input could be complex without context.
    // For now, let's make Search verify search functionality or go to shop.
    // Given standard patterns, Search often opens a search modal.
    // Since we have a Header with a Mobile Drawer that HAS search, 
    // maybe we can just scroll to top to see the header search? 
    // OR just link to /tienda for browsing. 
    // Let's implement it as a link to /tienda for now, or just a button that does nothing if not specified.
    // The user asked for the visual bar. I will link Search to /tienda.

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 lg:hidden pb-safe">
            <div className="flex h-16 items-center">

                {/* Search - Left */}
                <Link
                    href="/tienda"
                    className="flex-1 flex items-center justify-center h-full border-r border-gray-100 group"
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${pathname === '/tienda' ? 'bg-blue-50 text-[var(--color-pharma-blue)]' : 'text-gray-500 group-hover:bg-gray-50'}`}>
                        <Search className="w-6 h-6" strokeWidth={2} />
                    </div>
                </Link>

                {/* User - Center */}
                <Link
                    href="/mi-cuenta"
                    className="flex-1 flex items-center justify-center h-full border-r border-gray-100 group"
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${pathname.startsWith('/mi-cuenta') ? 'bg-blue-50 text-[var(--color-pharma-blue)]' : 'text-gray-500 group-hover:bg-gray-50'}`}>
                        <User className="w-6 h-6" strokeWidth={2} />
                    </div>
                </Link>

                {/* Cart - Right */}
                <button
                    onClick={toggleCart}
                    className="flex-1 flex items-center justify-center h-full group"
                >
                    <div className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 text-gray-500 group-hover:bg-gray-50 group-active:bg-blue-50 group-active:text-[var(--color-pharma-blue)]">
                        <ShoppingCart className="w-6 h-6" strokeWidth={2} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[var(--color-pharma-green)] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full animate-in zoom-in border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                    </div>
                </button>

            </div>
            {/* Safe Area for iPhone Home Indicator */}
            <div className="h-[env(safe-area-inset-bottom)] bg-white" />
        </div>
    );
}
