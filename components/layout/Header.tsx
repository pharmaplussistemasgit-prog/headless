'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    Search, ShoppingCart, User, MapPin, ChevronDown,
    Phone, Mail, Tag, Heart, Store, Pill, Menu, CreditCard, Snowflake, FileText, HelpCircle, Truck
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { CategoryTree } from '@/types/woocommerce';
import { motion, AnimatePresence } from 'framer-motion';
import LiveSearch from '@/components/search/LiveSearch';
import CartBadge from './CartBadge';
import AccountButton from './AccountButton';
import MegaMenu from './MegaMenu';
import { useGeolocation } from '@/hooks/useGeolocation';
import ShippingModal from '@/components/shipping/ShippingModal';
import { ShippingRule } from '@/lib/shipping';
import { ShippingRate } from '@/lib/shipping-rates';
import { ALL_BRANDS_SLIDER } from '@/lib/brands-data';
import { getCategoryStyle } from '@/lib/category-styles';
import { ChevronRight } from 'lucide-react';

interface HeaderProps {
    categories?: CategoryTree[];
    shippingRules?: ShippingRule[];
    shippingRates?: ShippingRate[];
}

export default function Header({ categories = [], shippingRules = [], shippingRates = [] }: HeaderProps) {
    const [isCategoryOpen, setCategoryOpen] = useState(false);
    const [isFinanciamientoOpen, setFinanciamientoOpen] = useState(false);
    const [isShippingModalOpen, setShippingModalOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMobileCategory, setActiveMobileCategory] = useState<number | null>(null);

    // Mega Menu State (Cascading)
    const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null); // Level 1 (Parent)
    const [hoveredSubCategoryId, setHoveredSubCategoryId] = useState<number | null>(null); // Level 2 (Child)
    const [searchTerm, setSearchTerm] = useState('');
    const { city, loading, requestLocation } = useGeolocation();

    const categoryRef = useRef<HTMLDivElement>(null);
    const financiamientoRef = useRef<HTMLDivElement>(null);

    // Click Outside Handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setCategoryOpen(false);
            }
            if (financiamientoRef.current && !financiamientoRef.current.contains(event.target as Node)) {
                setFinanciamientoOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            window.location.href = `/tienda?search=${encodeURIComponent(searchTerm)}`;
        }
    };

    return (
        <header className="w-full sticky top-0 z-50 shadow-sm font-sans bg-white">

            {/* LEVEL 1: TOP BAR - Contact & Location */}
            <div className="bg-[#F8FAFC] border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-9 text-[11px] sm:text-xs font-medium tracking-wide">
                        {/* Left: Contact Info */}
                        <div className="hidden md:flex items-center gap-6 text-slate-500">
                            <a href="tel:6015934005" className="flex items-center gap-1.5 hover:text-[var(--color-pharma-blue)] transition-colors">
                                <Phone className="w-3 h-3" />
                                <span>(601) 593 4005</span>
                            </a>
                            <a href="mailto:atencionalusuario@pharmaplus.com.co" className="flex items-center gap-1.5 hover:text-[var(--color-pharma-blue)] transition-colors">
                                <Mail className="w-3 h-3" />
                                <span>atencionalusuario@pharmaplus.com.co</span>
                            </a>
                        </div>

                        {/* Right: Location Selector */}
                        <div
                            className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-[var(--color-pharma-blue)] transition-colors ml-auto md:ml-0"
                            onClick={requestLocation}
                            title="Clic para actualizar ubicación"
                        >
                            <MapPin className={`w-3.5 h-3.5 ${loading ? 'animate-pulse text-[var(--color-pharma-blue)]' : ''}`} />
                            <span>
                                {loading ? "Localizando..." : (city || "Bogotá, D.C.")}
                            </span>
                            <ChevronDown className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </div>

            {/* LEVEL 2: MAIN BAR - Logo, Search, Actions */}
            <div className="bg-white border-b border-gray-100/80 backdrop-blur-md relative z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-6 lg:gap-12 py-4">

                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                className="lg:hidden p-2 -ml-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Abrir menú"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            {/* Logo */}
                            <Link href="/" className="flex-shrink-0 block group">
                                <div className="relative w-[140px] lg:w-[180px] h-[40px] lg:h-[48px] transition-transform duration-300 group-hover:scale-[1.02]">
                                    <Image
                                        src="/brand/logo-new-clean.png"
                                        alt="PharmaPlus"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* Search Bar - Large & Centered (Hidden on Mobile) */}
                        <div className="hidden lg:block flex-1 max-w-2xl">
                            <LiveSearch />
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            {/* Wishlist */}
                            <Link href="/wishlist" className="relative group p-2 hidden sm:block" aria-label="Ver lista de deseos">
                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 group-hover:border-red-200 group-hover:bg-red-50 flex items-center justify-center text-slate-600 group-hover:text-red-500 transition-all duration-300">
                                    <Heart className="w-5 h-5" />
                                </div>
                            </Link>

                            <AccountButton />

                            {/* Cart */}
                            <Link href="/carrito" className="relative group p-2" aria-label="Ver carrito de compras">
                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50 flex items-center justify-center text-slate-600 group-hover:text-[var(--color-pharma-blue)] transition-all duration-300">
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                                <CartBadge />
                            </Link>
                        </div>

                        {/* Mobile Financiamiento Dropdown (Visible only on mobile) */}
                        <div
                            className="lg:hidden relative h-full flex items-center"
                            onClick={() => setFinanciamientoOpen(!isFinanciamientoOpen)}
                        >
                            {/* Keeping original mobile logic for now, or could simplify */}
                            <button className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-pharma-blue)] bg-blue-50 px-3 py-1.5 rounded-full">
                                <span>Financiamiento</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* LEVEL 3: NAV BAR - Main Navigation (Hidden on Mobile) */}
            <div className="hidden lg:block bg-[var(--color-pharma-blue)] shadow-[0_4px_20px_-10px_rgba(0,80,216,0.3)] text-white relative z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8 h-[52px]">

                        {/* Categories Dropdown Trigger */}
                        <div
                            ref={categoryRef}
                            className="relative h-full flex items-center group"
                            onMouseEnter={() => {
                                if (!isCategoryOpen) setCategoryOpen(true);
                                if (!hoveredCategoryId && categories.length > 0) setHoveredCategoryId(categories[0].id);
                            }}
                            onMouseLeave={() => setCategoryOpen(false)}
                        >
                            <div
                                className={`
                                    flex items-center gap-2.5 cursor-pointer px-5 -ml-5 border-r border-white/10 h-full transition-colors duration-300
                                    ${isCategoryOpen ? 'bg-white/10' : 'hover:bg-white/10'}
                                `}
                            >
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <Menu className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[14px] font-bold text-white tracking-wide">Categorías</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                            </div>

                            <MegaMenu
                                isOpen={isCategoryOpen}
                                categories={categories}
                                onClose={() => setCategoryOpen(false)}
                            />

                        </div>

                        {/* Quick Links Nav */}
                        <nav className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {[
                                { href: "/ofertas", icon: Tag, label: "Ofertas" },
                                { href: "/pastillero", icon: Pill, label: "Pastillero" },
                                { href: "/tiendas", icon: Store, label: "Tiendas" },
                                { href: "/blog", icon: FileText, label: "Blog" },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-2 text-[13px] font-medium text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all whitespace-nowrap"
                                >
                                    <link.icon className="w-4 h-4 opacity-80" />
                                    <span>{link.label}</span>
                                </Link>
                            ))}

                            <button
                                onClick={() => setShippingModalOpen(true)}
                                className="flex items-center gap-2 text-[13px] font-medium text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all whitespace-nowrap ml-auto"
                            >
                                <Truck className="w-4 h-4 opacity-80" />
                                <span>Cotizar Envío</span>
                            </button>
                        </nav>

                        {/* Financiamiento Dropdown (Premium) */}
                        <div
                            ref={financiamientoRef}
                            className="hidden lg:block border-l border-white/20 pl-6 relative h-full flex items-center"
                            onMouseEnter={() => setFinanciamientoOpen(true)}
                            onMouseLeave={() => setFinanciamientoOpen(false)}
                        >
                            <button className="flex items-center gap-2 text-[13px] font-bold text-white hover:opacity-100 transition-opacity h-full group">
                                <div className="bg-white text-[var(--color-pharma-blue)] p-1 rounded-md shadow-sm group-hover:scale-110 transition-transform">
                                    <Store className="w-3.5 h-3.5" />
                                </div>
                                <span className="opacity-90 group-hover:opacity-100">Financiamiento</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform duration-300 ${isFinanciamientoOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isFinanciamientoOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-full right-0 mt-3 w-[360px] bg-white rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 z-50 overflow-hidden"
                                    >
                                        {/* Gradient Line */}
                                        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--color-pharma-blue)] to-[var(--color-pharma-green)]" />

                                        <div className="p-3">
                                            <div className="px-4 py-2 mb-2">
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Métodos de Pago</p>
                                            </div>

                                            <Link href="/financiamiento/bancolombia" className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-pharma-blue)] transition-all shadow-sm">
                                                    <CreditCard className="w-5 h-5 text-[var(--color-pharma-blue)] group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-slate-800 group-hover:text-[var(--color-pharma-blue)] transition-colors">Clientes Bancolombia</span>
                                                    <span className="text-xs text-slate-500">Financiación directa</span>
                                                </div>
                                            </Link>

                                            <Link href="/financiamiento/credito-libre" className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-pharma-green)] transition-all shadow-sm">
                                                    <Tag className="w-5 h-5 text-[var(--color-pharma-green)] group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-slate-800 group-hover:text-[var(--color-pharma-green)] transition-colors">Crédito Libre Inversión</span>
                                                    <span className="text-xs text-slate-500">Para no clientes</span>
                                                </div>
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
            {/* LEVEL 4: Category Strip (Hidden on Mobile) */}
            <div className="bg-[#FAFAFA] border-b border-gray-200 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center overflow-x-auto no-scrollbar py-2.5 gap-4">
                        {categories.slice(0, 8).map((cat) => {
                            const isColdChain = cat.slug.includes('cadena-de-frio');
                            if (isColdChain) return null; // Handle separately if needed

                            return (
                                <Link
                                    key={cat.id}
                                    href={`/categoria/${cat.slug}`}
                                    className="flex-shrink-0 text-[12px] font-medium text-slate-600 hover:text-[var(--color-pharma-blue)] hover:bg-white hover:shadow-sm px-3 py-1 rounded-full transition-all whitespace-nowrap border border-transparent hover:border-gray-100"
                                >
                                    {cat.name}
                                </Link>
                            );
                        })}
                        <Link href="/tienda" className="flex-shrink-0 text-[12px] font-bold text-[var(--color-pharma-blue)] hover:underline whitespace-nowrap pl-4 ml-auto">
                            Ver catálogo completo →
                        </Link>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU DRAWER (Keep Existing Logic, minor style updates) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 z-50 lg:hidden backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[300px] z-[51] bg-white shadow-2xl lg:hidden overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[var(--color-pharma-blue)] text-white">
                                <span className="font-bold text-xl tracking-tight">Menú</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <ChevronDown className="w-6 h-6 rotate-90" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
                                {/* Search */}
                                <div className="p-4 bg-white mb-2 shadow-sm">
                                    <form onSubmit={(e) => {
                                        handleSearch(e);
                                        setMobileMenuOpen(false);
                                    }} className="relative">
                                        <input
                                            type="text"
                                            className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pharma-blue)] focus:border-transparent transition-shadow"
                                            placeholder="Buscar productos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button type="submit" className="absolute right-3 top-3 text-slate-400">
                                            <Search className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>

                                <div className="bg-white mb-2 shadow-sm p-2 grid grid-cols-2 gap-2">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl active:scale-95 transition-transform">
                                        <User className="w-6 h-6 text-[var(--color-pharma-blue)] mb-2" />
                                        <span className="text-xs font-bold text-slate-700">Mi Cuenta</span>
                                    </Link>
                                    <Link href="/pastillero" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl active:scale-95 transition-transform">
                                        <Pill className="w-6 h-6 text-[var(--color-pharma-green)] mb-2" />
                                        <span className="text-xs font-bold text-slate-700">Pastillero</span>
                                    </Link>
                                </div>

                                <div className="bg-white py-2 shadow-sm">
                                    <p className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Departamentos</p>
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="border-b border-gray-50 last:border-0">
                                            <div
                                                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 cursor-pointer active:bg-slate-100"
                                                onClick={() => setActiveMobileCategory(activeMobileCategory === cat.id ? null : cat.id)}
                                            >
                                                <span className={`text-sm tracking-wide capitalize transition-colors ${activeMobileCategory === cat.id ? 'text-[var(--color-pharma-blue)] font-bold' : 'font-medium text-slate-700'}`}>
                                                    {cat.name.toLowerCase()}
                                                </span>
                                                <ChevronDown
                                                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeMobileCategory === cat.id ? 'rotate-180 text-[var(--color-pharma-blue)]' : ''}`}
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {activeMobileCategory === cat.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden bg-slate-50/50"
                                                    >
                                                        <div className="flex flex-col py-2">
                                                            <Link
                                                                href={`/categoria/${cat.slug}`}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="flex items-center gap-3 px-8 py-3 text-sm font-bold text-[var(--color-pharma-blue)] hover:bg-blue-50/50"
                                                            >
                                                                Ver todo {cat.name.toLowerCase()}
                                                            </Link>
                                                            {cat.children?.map((child) => (
                                                                <Link
                                                                    key={child.id}
                                                                    href={`/categoria/${child.slug}`}
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                    className="flex items-center gap-2 px-8 py-3 text-sm text-slate-600 hover:text-[var(--color-pharma-blue)] hover:bg-white pl-8 border-l-2 border-transparent hover:border-[var(--color-pharma-blue)] ml-6"
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ShippingModal
                isOpen={isShippingModalOpen}
                onClose={() => setShippingModalOpen(false)}
                rules={shippingRules}
                rates={shippingRates}
            />
        </header>
    );
}
