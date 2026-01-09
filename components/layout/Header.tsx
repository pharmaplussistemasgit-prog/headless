'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    Search, ShoppingCart, User, MapPin, ChevronDown,
    Phone, Mail, Tag, Heart, Store, Pill, Menu, CreditCard, Snowflake, FileText, HelpCircle
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { CategoryTree } from '@/types/woocommerce';
import { motion, AnimatePresence } from 'framer-motion';
import LiveSearch from '@/components/search/LiveSearch';
import CartBadge from './CartBadge';
import AccountButton from './AccountButton';

interface HeaderProps {
    categories?: CategoryTree[];
}

export default function Header({ categories = [] }: HeaderProps) {
    const [isCategoryOpen, setCategoryOpen] = useState(false);
    const [isFinanciamientoOpen, setFinanciamientoOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile State
    const [activeMobileCategory, setActiveMobileCategory] = useState<number | null>(null);
    const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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
        <header className="w-full sticky top-0 z-50 shadow-md">

            {/* LEVEL 1: TOP BAR - Contact & Location */}
            <div className="bg-slate-100 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-10 text-xs">
                        {/* Left: Contact Info */}
                        <div className="hidden md:flex items-center gap-6 text-slate-600">
                            <a href="tel:6015934005" className="flex items-center gap-1.5 hover:text-[var(--color-pharma-blue)] transition-colors">
                                <Phone className="w-3.5 h-3.5" />
                                <span>(601) 593 4005</span>
                            </a>
                            <a href="mailto:atencionalusuario@pharmaplus.com.co" className="flex items-center gap-1.5 hover:text-[var(--color-pharma-blue)] transition-colors">
                                <Mail className="w-3.5 h-3.5" />
                                <span>atencionalusuario@pharmaplus.com.co</span>
                            </a>
                        </div>

                        {/* Right: Location Selector */}
                        <div className="flex items-center gap-2 cursor-pointer hover:text-[var(--color-pharma-blue)] transition-colors text-slate-700">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="font-medium">Bogotá, D.C.</span>
                            <ChevronDown className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </div>

            {/* LEVEL 2: MAIN BAR - Logo, Search, Actions */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4 lg:gap-10 py-4">

                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Abrir menú"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            {/* Logo */}
                            <Link href="/" className="flex-shrink-0 group">
                                <div className="relative w-[155px] lg:w-[190px] h-[48px] lg:h-[54px] group-hover:scale-105 transition-transform duration-300">
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

                        {/* User Actions */}
                        {/* User Account */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <AccountButton />

                            {/* Cart */}
                            <Link href="/carrito" className="relative group">
                                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 group-hover:bg-blue-50 group-hover:text-[var(--color-pharma-blue)] group-hover:border-blue-200 transition-all">
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
                            <button className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-pharma-blue)] hover:opacity-90 transition-opacity">
                                <div className="bg-[var(--color-pharma-green)] text-white p-1 rounded-full">
                                    <Store className="w-4 h-4" />
                                </div>
                                <span>Financiamiento</span>
                                <ChevronDown className={`w-4 h-4 text-[var(--color-pharma-blue)] transition-transform duration-300 ${isFinanciamientoOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isFinanciamientoOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-full right-0 mt-4 w-[300px] bg-white rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 z-50 overflow-hidden"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Decorative Top Line */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-pharma-blue)] to-[var(--color-pharma-green)]"></div>

                                        <div className="p-2 space-y-1">
                                            {/* Header Section */}
                                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opciones de Financiación</p>
                                            </div>

                                            <Link href="/financiamiento/bancolombia" className="group flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-blue-50/50 transition-all cursor-pointer" onClick={() => setFinanciamientoOpen(false)}>
                                                <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-pharma-blue)] transition-colors">
                                                    <CreditCard className="w-4 h-4 text-[var(--color-pharma-blue)] group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-gray-700 group-hover:text-[var(--color-pharma-blue)] transition-colors">Clientes Bancolombia</span>
                                                </div>
                                            </Link>

                                            <Link href="/financiamiento/credito-libre" className="group flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-green-50/50 transition-all cursor-pointer" onClick={() => setFinanciamientoOpen(false)}>
                                                <div className="mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-pharma-green)] transition-colors">
                                                    <Tag className="w-4 h-4 text-[var(--color-pharma-green)] group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-gray-700 group-hover:text-[var(--color-pharma-green)] transition-colors">Crédito Libre Inversión</span>
                                                </div>
                                            </Link>

                                            <Link href="/financiamiento/wompi" className="group flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-purple-50/50 transition-all cursor-pointer" onClick={() => setFinanciamientoOpen(false)}>
                                                <div className="mt-1 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 transition-colors">
                                                    <CreditCard className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors">Plataforma Wompi</span>
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

            {/* LEVEL 3: NAV BAR - Main Navigation (Hidden on Mobile) */}
            <div className="hidden lg:block bg-[var(--color-pharma-blue)] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8 h-12">

                        {/* Categories Dropdown */}
                        <div
                            ref={categoryRef}
                            className="relative h-full flex items-center"
                            onMouseEnter={() => {
                                if (!isCategoryOpen) setCategoryOpen(true);
                                if (!hoveredCategoryId && categories.length > 0) setHoveredCategoryId(categories[0].id);
                            }}
                            onMouseLeave={() => setCategoryOpen(false)}
                        >
                            <div
                                className="flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors px-4 -ml-4 border-r border-white/20 h-full"
                            >
                                <Menu className="w-4 h-4 text-white" />
                                <span className="text-[13px] font-semibold text-white">Categorías</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Mega Menu Dropdown */}
                            <AnimatePresence>
                                {isCategoryOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-full left-0 mt-0 w-[800px] bg-white rounded-b-xl shadow-2xl border-t border-gray-100 z-50 overflow-hidden flex h-[400px]"
                                    >
                                        {/* Decorative Line */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-pharma-blue)] to-[var(--color-pharma-green)]"></div>

                                        {/* LEFT COLUMN: Parent Categories */}
                                        <div className="w-[280px] bg-gray-50 border-r border-gray-100 overflow-y-auto custom-scrollbar py-2">
                                            {categories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    onMouseEnter={() => setHoveredCategoryId(cat.id)}
                                                    className={`
                                                        px-5 py-3 cursor-pointer flex items-center justify-between transition-all
                                                        ${hoveredCategoryId === cat.id
                                                            ? 'bg-white border-l-4 border-[var(--color-pharma-blue)] text-[var(--color-pharma-blue)] shadow-sm'
                                                            : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-100'
                                                        }
                                                    `}
                                                >
                                                    <span className={`text-[13px] font-bold capitalize ${hoveredCategoryId === cat.id ? 'font-bold' : 'font-medium'}`}>
                                                        {cat.name.toLowerCase()}
                                                    </span>
                                                    {hoveredCategoryId === cat.id && (
                                                        <ChevronDown className="w-4 h-4 -rotate-90 text-[var(--color-pharma-blue)]" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* RIGHT COLUMN: Subcategories Content */}
                                        <div className="flex-1 p-6 bg-white overflow-y-auto">
                                            {categories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className={hoveredCategoryId === cat.id ? 'block' : 'hidden'}
                                                >
                                                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                                                        <h3 className="text-xl font-bold text-gray-800 capitalize">
                                                            {cat.name.toLowerCase()}
                                                        </h3>
                                                        <Link
                                                            href={`/categoria/${cat.slug}`}
                                                            className="text-xs font-bold text-[var(--color-pharma-blue)] hover:underline flex items-center gap-1"
                                                        >
                                                            Ver todo
                                                            <ChevronDown className="w-3 h-3 -rotate-90" />
                                                        </Link>
                                                    </div>

                                                    {cat.children && cat.children.length > 0 ? (
                                                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                                            {cat.children.map(child => (
                                                                <Link
                                                                    key={child.id}
                                                                    href={`/categoria/${child.slug}`}
                                                                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                                                                >
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-[var(--color-pharma-green)] transition-colors"></div>
                                                                    <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 group-hover:font-semibold transition-colors capitalize">
                                                                        {child.name.toLowerCase()}
                                                                    </span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                                            <Store className="w-10 h-10 mb-2 opacity-20" />
                                                            <p className="text-sm">Explora los productos de esta categoría</p>
                                                            <Link
                                                                href={`/categoria/${cat.slug}`}
                                                                className="mt-4 px-4 py-2 bg-[var(--color-pharma-blue)] text-white text-xs font-bold rounded-full hover:opacity-90 transition-opacity"
                                                            >
                                                                Ver Productos
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Quick Links */}
                        <nav className="flex-1 flex items-center gap-6 overflow-x-auto no-scrollbar">
                            <Link href="/ofertas" className="flex items-center gap-2 text-[13px] font-medium text-white hover:text-white whitespace-nowrap transition-colors">
                                <Tag className="w-4 h-4 text-white" />
                                <span>Mundo Ofertas</span>
                            </Link>

                            <Link href="/wishlist" className="flex items-center gap-2 text-[13px] font-medium text-white hover:text-white whitespace-nowrap transition-colors">
                                <Heart className="w-4 h-4 text-white" />
                                <span>Mis Favoritos</span>
                            </Link>

                            <Link href="/pastillero" className="flex items-center gap-2 text-[13px] font-medium text-white hover:text-white whitespace-nowrap transition-colors">
                                <Pill className="w-4 h-4 text-white" />
                                <span>Pastillero Virtual</span>
                            </Link>

                            <Link href="/tiendas" className="flex items-center gap-2 text-[13px] font-medium text-white hover:text-white whitespace-nowrap transition-colors">
                                <Store className="w-4 h-4 text-white" />
                                <span>Tiendas</span>
                            </Link>

                            <Link href="/politicas/preguntas-frecuentes" className="flex items-center gap-2 text-[13px] font-medium text-white hover:text-white whitespace-nowrap transition-colors">
                                <HelpCircle className="w-4 h-4 text-white" />
                                <span>Preguntas Frecuentes</span>
                            </Link>

                            <Link href="/politicas" className="flex items-center gap-2 text-[13px] font-medium text-white hover:text-white whitespace-nowrap transition-colors">
                                <FileText className="w-4 h-4 text-white" />
                                <span>Políticas</span>
                            </Link>
                        </nav>

                        {/* Financiamiento Dropdown (Replaces Pharma Prime) */}
                        <div
                            ref={financiamientoRef}
                            className="hidden lg:block border-l border-white/20 pl-6 relative h-full flex items-center"
                            onMouseEnter={() => setFinanciamientoOpen(true)}
                            onMouseLeave={() => setFinanciamientoOpen(false)}
                        >
                            <button className="flex items-center gap-2 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity h-full">
                                <div className="bg-[var(--color-pharma-green)] text-white p-1 rounded-full">
                                    <Store className="w-3.5 h-3.5" />
                                </div>
                                <span>Financiamiento</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${isFinanciamientoOpen ? 'rotate-180' : ''}`} />
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
                                        {/* Decorative Top Line */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-pharma-blue)] to-[var(--color-pharma-green)]"></div>

                                        <div className="p-2 space-y-1">
                                            {/* Header Section */}
                                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opciones de Financiación</p>
                                            </div>

                                            <Link href="/financiamiento/bancolombia" className="group flex items-start gap-4 px-4 py-3 rounded-lg hover:bg-blue-50/50 transition-all cursor-pointer">
                                                <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-pharma-blue)] transition-colors">
                                                    <CreditCard className="w-4 h-4 text-[var(--color-pharma-blue)] group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-gray-700 group-hover:text-[var(--color-pharma-blue)] transition-colors">Clientes Bancolombia</span>
                                                    <span className="text-xs text-gray-500">Financia tu compra directamente</span>
                                                </div>
                                            </Link>

                                            <Link href="/financiamiento/credito-libre" className="group flex items-start gap-4 px-4 py-3 rounded-lg hover:bg-green-50/50 transition-all cursor-pointer">
                                                <div className="mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-pharma-green)] transition-colors">
                                                    <Tag className="w-4 h-4 text-[var(--color-pharma-green)] group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-gray-700 group-hover:text-[var(--color-pharma-green)] transition-colors">Crédito Libre Inversión</span>
                                                    <span className="text-xs text-gray-500">Para no clientes Bancolombia</span>
                                                </div>
                                            </Link>

                                            <Link href="/financiamiento/wompi" className="group flex items-start gap-4 px-4 py-3 rounded-lg hover:bg-purple-50/50 transition-all cursor-pointer">
                                                <div className="mt-1 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 transition-colors">
                                                    <CreditCard className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors">Plataforma Wompi</span>
                                                    <span className="text-xs text-gray-500">Pagos seguros online</span>
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

            {/* LEVEL 4: Category Strip (Optional - Hidden on Mobile) */}
            <div className="bg-[var(--color-bg-light)] border-b border-gray-100 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-2.5 gap-2">
                        {/* Cold Chain Highlight */}
                        <Link
                            href="/categoria/cadena-de-frio"
                            className="flex items-center gap-1.5 text-[13px] font-bold text-[#00AEEF] hover:text-[#0090C5] hover:scale-105 transition-all px-4 py-1 bg-[#00AEEF]/5 rounded-full border border-[#00AEEF]/20 mr-2"
                        >
                            <Snowflake className="w-4 h-4" />
                            Cadena de Frío
                        </Link>
                        {categories.slice(0, 7).map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/categoria/${cat.slug}`}
                                className="text-[13px] font-medium text-[var(--color-pharma-blue)] hover:text-[#002040] hover:font-semibold transition-all px-3 truncate"
                            >
                                {cat.name}
                            </Link>
                        ))}
                        {categories.length > 7 && (
                            <Link href="/tienda" className="text-[12px] font-semibold text-[var(--color-pharma-blue)] hover:underline whitespace-nowrap ml-2">
                                Ver todas
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* MOBILE MENU DRAWER */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[300px] z-[51] bg-white shadow-2xl lg:hidden overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[var(--color-pharma-blue)] text-white">
                                <span className="font-bold text-lg">Menú</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Cerrar menú">
                                    <ChevronDown className="w-6 h-6 rotate-90" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {/* Search */}
                                <div className="p-4 border-b border-gray-100">
                                    <form onSubmit={(e) => {
                                        handleSearch(e);
                                        setMobileMenuOpen(false);
                                    }} className="relative">
                                        <input
                                            type="text"
                                            className="w-full h-10 pl-4 pr-10 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-pharma-blue)]"
                                            placeholder="Buscar..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button type="submit" className="absolute right-2 top-2 text-gray-400" aria-label="Buscar producto">
                                            <Search className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>

                                {/* User Sections */}
                                <div className="p-4 grid grid-cols-2 gap-3 border-b border-gray-100">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                                        <User className="w-6 h-6 text-[var(--color-pharma-blue)] mb-2" />
                                        <span className="text-xs font-semibold text-gray-700">Mi Cuenta</span>
                                    </Link>
                                    <Link href="/pastillero" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                                        <Pill className="w-6 h-6 text-[var(--color-pharma-green)] mb-2" />
                                        <span className="text-xs font-semibold text-gray-700">Pastillero</span>
                                    </Link>
                                </div>

                                {/* Links */}
                                <div className="py-2">
                                    <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Categorías</p>
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="border-b border-gray-50 last:border-0">
                                            <div
                                                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer"
                                                onClick={() => setActiveMobileCategory(activeMobileCategory === cat.id ? null : cat.id)}
                                            >
                                                <span className={`text-sm font-medium capitalize transition-colors ${activeMobileCategory === cat.id ? 'text-[var(--color-pharma-blue)] font-bold' : 'text-gray-700'}`}>
                                                    {cat.name.toLowerCase()}
                                                </span>
                                                <ChevronDown
                                                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${activeMobileCategory === cat.id ? 'rotate-180 text-[var(--color-pharma-blue)]' : ''}`}
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {activeMobileCategory === cat.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden bg-slate-50 border-t border-gray-100"
                                                    >
                                                        <div className="flex flex-col py-2 pl-4">
                                                            {/* Parent Category Link */}
                                                            <Link
                                                                href={`/categoria/${cat.slug}`}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-[var(--color-pharma-blue)] hover:bg-slate-100"
                                                            >
                                                                Ver todo {cat.name.toLowerCase()}
                                                            </Link>

                                                            {/* Subcategories */}
                                                            {cat.children?.map((child) => (
                                                                <Link
                                                                    key={child.id}
                                                                    href={`/categoria/${child.slug}`}
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-[var(--color-pharma-blue)] hover:bg-slate-100 pl-8 relative"
                                                                >
                                                                    {/* Dot indicator */}
                                                                    <span className="absolute left-4 w-1 h-1 rounded-full bg-gray-300"></span>
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

                                {/* Other Links */}
                                <div className="py-2 border-t border-gray-100">
                                    <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Accesos Rápidos</p>
                                    <Link href="/ofertas" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm">
                                        <Tag className="w-4 h-4 text-[var(--color-pharma-blue)]" />
                                        Mundo Ofertas
                                    </Link>
                                    <Link href="/tiendas" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm">
                                        <MapPin className="w-4 h-4 text-[var(--color-pharma-blue)]" />
                                        Tiendas
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


        </header>
    );
}
