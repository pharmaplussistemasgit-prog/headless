'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, ChevronDown, Crown, Pill, Ticket, CreditCard, Package, Heart, Headphones, LogOut } from 'lucide-react';
import { auth } from '@/lib/auth';

export default function AccountButton() {
    const [user, setUser] = useState<{ name: string } | null>(null);

    useEffect(() => {
        // Cargar usuario inicial
        const loadUser = () => {
            if (auth.isAuthenticated()) {
                const userData = auth.getUser();
                setUser(userData);
            } else {
                setUser(null);
            }
        };

        loadUser();

        // Escuchar cambios de auth
        window.addEventListener('auth-change', loadUser);
        return () => window.removeEventListener('auth-change', loadUser);
    }, []);

    const handleLogout = () => {
        auth.logout();
        window.location.href = '/login';
    };

    if (!user) {
        return (
            <Link href="/login" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 transition-all group-hover:bg-blue-50 group-hover:text-[var(--color-pharma-blue)] group-hover:border-blue-200">
                    <User className="w-5 h-5" />
                </div>
                <div className="hidden lg:flex flex-col leading-tight">
                    <span className="text-[11px] text-gray-500">Hola,</span>
                    <span className="text-[13px] font-semibold text-[var(--color-text-dark)] group-hover:text-[var(--color-pharma-blue)]">Inicia sesión</span>
                </div>
            </Link>
        );
    }

    return (
        <div className="relative group z-50">
            <Link href="/mi-cuenta" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[var(--color-pharma-blue)] transition-all">
                    <User className="w-5 h-5" />
                </div>
                <div className="hidden lg:flex flex-col leading-tight">
                    <div className="flex items-center gap-1">
                        <span className="text-[11px] text-gray-500">Hola, <span className="text-[var(--color-pharma-blue)] underline decoration-blue-200 underline-offset-2">{user.name.split(' ')[0]}</span></span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-[13px] font-bold text-[var(--color-text-dark)] uppercase">Mi Cuenta</span>
                </div>
            </Link>

            {/* Hover Dropdown */}
            <div className="absolute top-full right-0 w-64 pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                {/* Triangle Arrow */}
                <div className="absolute top-0 right-6 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200"></div>

                <div className="relative bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Mi cuenta</span>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        {/* Pharma Prime */}
                        <Link href="/prime" className="flex items-center gap-3 px-5 py-2.5 hover:bg-blue-50 transition-colors group/item">
                            <Crown className="w-4 h-4 text-orange-500 group-hover/item:scale-110 transition-transform" />
                            <span className="text-sm font-semibold text-gray-700 group-hover/item:text-blue-700">Pharma Prime</span>
                        </Link>

                        {/* Pastillero */}
                        <Link href="/mi-cuenta/pastillero" className="flex items-center gap-3 px-5 py-2.5 hover:bg-blue-50 transition-colors group/item">
                            <Pill className="w-4 h-4 text-[var(--color-pharma-blue)] group-hover/item:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-gray-600 group-hover/item:text-gray-900">Pastillero Virtual</span>
                        </Link>

                        {/* Cupones */}
                        <Link href="/mi-cuenta/cupones" className="flex items-center gap-3 px-5 py-2.5 hover:bg-blue-50 transition-colors group/item">
                            <Ticket className="w-4 h-4 text-purple-500 group-hover/item:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-gray-600 group-hover/item:text-gray-900">Mis Cupones</span>
                        </Link>

                        {/* Tarjetas */}
                        <Link href="/mi-cuenta/tarjetas" className="flex items-center gap-3 px-5 py-2.5 hover:bg-blue-50 transition-colors group/item">
                            <CreditCard className="w-4 h-4 text-gray-400 group-hover/item:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-gray-600 group-hover/item:text-gray-900">Mis Tarjetas</span>
                        </Link>

                        {/* Compras */}
                        <Link href="/mi-cuenta/pedidos" className="flex items-center gap-3 px-5 py-2.5 hover:bg-blue-50 transition-colors group/item">
                            <Package className="w-4 h-4 text-blue-400 group-hover/item:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-gray-600 group-hover/item:text-gray-900">Mis Compras</span>
                        </Link>

                        {/* Favoritos */}
                        <Link href="/mi-cuenta/favoritos" className="flex items-center gap-3 px-5 py-2.5 hover:bg-blue-50 transition-colors group/item">
                            <Heart className="w-4 h-4 text-red-500 group-hover/item:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-gray-600 group-hover/item:text-gray-900">Mis Favoritos</span>
                        </Link>

                        {/* Separator */}
                        <div className="h-px bg-gray-100 my-1 mx-4"></div>

                        {/* Contacto */}
                        <Link href="/contacto" className="flex items-center gap-3 px-5 py-2.5 hover:bg-blue-50 transition-colors group/item">
                            <Headphones className="w-4 h-4 text-gray-500 group-hover/item:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-gray-600 group-hover/item:text-gray-900">Contáctenos</span>
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-red-50 transition-colors group/item text-left"
                        >
                            <LogOut className="w-4 h-4 text-red-500 group-hover/item:scale-110 transition-transform" />
                            <span className="text-sm font-bold text-red-600">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
