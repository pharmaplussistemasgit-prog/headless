'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LogOut, Package, MapPin, User, ChevronRight, Loader2, Heart, Pill, Crown } from 'lucide-react';
import Link from 'next/link';

export default function MyAccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Auth Guard
        if (!auth.isAuthenticated()) {
            router.push('/login');
            return;
        }

        const userData = auth.getUser();
        setUser(userData);
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        auth.logout();
        // auth.logout handles redirection to /login
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-[var(--color-pharma-blue)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Header Profile */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-[var(--color-pharma-blue)]">
                        {user?.name?.charAt(0) || <User />}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900">Hola, {user?.name || 'Cliente'}</h1>
                        <p className="text-gray-500">{user?.email}</p>
                        <div className="pt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Cliente Verificado
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Pedidos */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Package className="w-24 h-24 text-[var(--color-pharma-blue)]" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[var(--color-pharma-blue)] mb-4 group-hover:scale-110 transition-transform">
                                <Package className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Mis Pedidos</h3>
                            <p className="text-sm text-gray-500 mb-4">Revisa el estado de tus compras y descarga tus facturas.</p>
                            <Link href="/mi-cuenta/pedidos" className="inline-flex items-center text-[var(--color-pharma-blue)] font-bold text-sm hover:underline">
                                Ver historial <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Direcciones */}
                    <Link href="/mi-cuenta/direcciones" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MapPin className="w-24 h-24 text-[var(--color-pharma-green)]" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-[var(--color-pharma-green)] mb-4 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Mis Direcciones</h3>
                            <p className="text-sm text-gray-500 mb-4">Administra tus lugares de entrega para un checkout más rápido.</p>
                            <span className="inline-flex items-center text-[var(--color-pharma-green)] font-bold text-sm hover:underline">
                                Gestionar direcciones <ChevronRight className="w-4 h-4 ml-1" />
                            </span>
                        </div>
                    </Link>

                    {/* Favoritos */}
                    <Link href="/mi-cuenta/favoritos" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Heart className="w-24 h-24 text-red-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition-transform">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Mis Favoritos</h3>
                            <p className="text-sm text-gray-500 mb-4">Vuelve a ver los productos que guardaste para después.</p>
                            <span className="inline-flex items-center text-red-600 font-bold text-sm hover:underline">
                                Ver favoritos <ChevronRight className="w-4 h-4 ml-1" />
                            </span>
                        </div>
                    </Link>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Pastillero */}
                    <Link href="/mi-cuenta/pastillero" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Pill className="w-24 h-24 text-[var(--color-pharma-blue)]" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[var(--color-pharma-blue)] mb-4 group-hover:scale-110 transition-transform">
                                <Pill className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Pastillero Virtual</h3>
                            <p className="text-sm text-gray-500">Configura tus recordatorios de medicamentos.</p>
                        </div>
                    </Link>

                    {/* Pharma Prime */}
                    <Link href="/prime" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Crown className="w-24 h-24 text-yellow-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 mb-4 group-hover:scale-110 transition-transform">
                                <Crown className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Pharma Prime</h3>
                            <p className="text-sm text-gray-500">Disfruta de envíos gratis y beneficios exclusivos.</p>
                        </div>
                    </Link>
                </div>

                {/* Account Settings */}
                <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-full text-[var(--color-pharma-blue)]">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Datos Personales y Seguridad</h4>
                            <p className="text-sm text-gray-500">Actualiza tu nombre, correo o cambia tu contraseña.</p>
                        </div>
                    </div>
                    <Link
                        href="/mi-cuenta/editar-perfil"
                        className="whitespace-nowrap inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        Editar mis datos
                    </Link>
                </div>

            </div>
        </div>
    );
}
