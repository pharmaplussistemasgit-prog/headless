'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Package, MapPin, User, LogOut, LayoutDashboard, Pill,
    Ticket, Crown, CreditCard, Lock, Bell, Heart, Store,
    Shield, HelpCircle, Headphones, ChevronRight, PenTool, FileText
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';

export default function AccountNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { isBlogAuthor } = useUserRole();

    const handleLogout = () => {
        auth.logout();
        router.refresh();
    };

    interface NavItem {
        name: string;
        href: string;
        icon: any;
        highlight?: boolean;
        color?: string;
        external?: boolean; // Support for external links
    }

    const sections: { title: string; items: NavItem[] }[] = [
        {
            title: "Créditos y cupones",
            items: [
                { name: '¿Tienes un cupón?', href: '/mi-cuenta/cupones', icon: Ticket, highlight: true }
            ]
        },
        {
            title: "Tu cuenta",
            items: [
                { name: 'Pharma Prime', href: '/prime', icon: Crown, color: 'text-blue-500' },
                { name: 'Mi perfil', href: '/mi-cuenta/detalles', icon: User },
                { name: 'Mis direcciones', href: '/mi-cuenta/direcciones', icon: MapPin },
                { name: 'Mis tarjetas', href: '/mi-cuenta/tarjetas', icon: CreditCard },
                { name: 'Cambia tu contraseña', href: '/mi-cuenta/password', icon: Lock },
                { name: 'Mis compras', href: '/mi-cuenta/pedidos', icon: Package },
                { name: 'Notificaciones', href: '/mi-cuenta/notificaciones', icon: Bell },
                { name: 'Pastillero virtual', href: '/pastillero', icon: Pill, color: 'text-[var(--color-pharma-blue)]' },
            ]
        },
        {
            title: "Favoritos y Tiendas",
            items: [
                { name: 'Mis favoritos', href: '/wishlist', icon: Heart },
                { name: 'Mis tiendas', href: '/tiendas', icon: Store },
            ]
        },
        ...(isBlogAuthor ? [{
            title: "Mi Blog",
            items: [
                {
                    name: 'Redactar Artículo',
                    href: 'https://tienda.pharmaplus.com.co/wp-admin/post-new.php',
                    icon: PenTool,
                    color: 'text-purple-600',
                    external: true
                },
                {
                    name: 'Mis Artículos',
                    href: '/mi-cuenta/blog',
                    icon: FileText,
                    color: 'text-blue-600'
                }
            ]
        }] : []),
        {
            title: "Ajustes y ayuda",
            items: [
                { name: 'Políticas de privacidad', href: '/politica-de-privacidad', icon: Shield },
                { name: 'Soporte', href: '/contacto', icon: HelpCircle },
                { name: 'Contáctenos', href: '/contacto', icon: Headphones },
            ]
        }
    ];

    return (
        <nav className="space-y-8">
            {sections.map((section, idx) => (
                <div key={idx}>
                    {section.title && (
                        <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            {section.title}
                        </h3>
                    )}
                    <div className="space-y-1">
                        {section.items.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        group flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all
                                        ${isActive
                                            ? 'bg-blue-50 text-[var(--color-pharma-blue)]'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                        ${item.highlight ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700' : ''}
                                    `}
                                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                            ${isActive ? 'bg-white' : 'bg-gray-100 group-hover:bg-white'}
                                        `}>
                                            <Icon className={`w-4 h-4 ${item.color || (isActive ? 'text-[var(--color-pharma-blue)]' : 'text-gray-500 group-hover:text-gray-700')}`} />
                                        </div>
                                        <span>{item.name}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${isActive ? 'text-[var(--color-pharma-blue)]' : 'group-hover:translate-x-1'}`} />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="pt-4 border-t border-gray-100 space-y-2">
                <button
                    onClick={async () => {
                        const token = auth.getToken();
                        if (!token) {
                            alert('No hay sesión activa');
                            return;
                        }
                        try {
                            const res = await fetch('https://tienda.pharmaplus.com.co/wp-json/wp/v2/users/me?context=edit', {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const data = await res.json();

                            let roles = data.roles || [];
                            // Fallback Logic
                            if ((!roles || roles.length === 0) && data.is_super_admin) {
                                roles = ['administrator'];
                            }

                            alert(`Super Admin: ${data.is_super_admin}\nRoles Recibidos: ${JSON.stringify(data.roles)}\nRoles Asignados: ${JSON.stringify(roles)}`);

                            if (roles.length > 0) {
                                const current = auth.getUser();
                                auth.saveSessionRaw({ ...current, roles: roles });
                                window.location.reload();
                            } else {
                                alert('Aun no se detectan roles. Revise consola.');
                                console.log('DEBUG DATA:', data);
                            }
                        } catch (e) {
                            alert('Error sincronizando: ' + e);
                        }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
                >
                    🔄 Sincronizar Permisos (Debug)
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </nav>
    );
}
