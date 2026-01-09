'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Package, MapPin, User, LogOut, LayoutDashboard } from 'lucide-react';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AccountNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        auth.logout();
        router.refresh();
    };

    const navItems = [
        { name: 'Escritorio', href: '/mi-cuenta', icon: LayoutDashboard },
        { name: 'Mis Pedidos', href: '/mi-cuenta/pedidos', icon: Package },
        { name: 'Direcciones', href: '/mi-cuenta/direcciones', icon: MapPin },
        { name: 'Detalles de la cuenta', href: '/mi-cuenta/detalles', icon: User },
    ];

    return (
        <nav className="space-y-1">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive
                                ? 'bg-[var(--color-pharma-blue)] text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </Link>
                );
            })}

            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all mt-4"
            >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
            </button>
        </nav>
    );
}
