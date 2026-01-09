'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { User, Package, LogOut, MapPin, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function MiCuentaPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const userData = auth.getUser();
        if (userData) {
            setUser(userData);
        }
    }, []);

    const handleLogout = () => {
        auth.logout();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
                    <p className="text-gray-500 mt-1">Hola, <span className="font-semibold text-[var(--color-pharma-blue)]">{user.name}</span></p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors self-start md:self-auto"
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </button>
            </div>

            {/* Dashboard Grid - Quick Glace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Bienvenido de nuevo</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Desde el panel de control de tu cuenta puedes ver tus <Link href="/mi-cuenta/pedidos" className="text-[var(--color-pharma-blue)] font-bold hover:underline">pedidos recientes</Link>, gestionar tus <Link href="/mi-cuenta/direcciones" className="text-[var(--color-pharma-blue)] font-bold hover:underline">direcciones de envío y facturación</Link> y <Link href="/mi-cuenta/detalles" className="text-[var(--color-pharma-blue)] font-bold hover:underline">editar tu contraseña y los detalles de tu cuenta</Link>.
                    </p>
                </div>

                <div className="bg-[var(--color-pharma-blue)] p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-1">¿Necesitas ayuda?</h3>
                        <p className="text-blue-100 text-sm mb-4">Estamos aquí para asistirte con tus compras.</p>
                        <a href="https://wa.me/573000000000" target="_blank" className="inline-block px-4 py-2 bg-white text-[var(--color-pharma-blue)] text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors">
                            Contactar Soporte
                        </a>
                    </div>
                    {/* Decorative circle */}
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
