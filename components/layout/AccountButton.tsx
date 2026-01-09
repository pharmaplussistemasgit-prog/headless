'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
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

    const href = user ? "/mi-cuenta" : "/login";
    const title = user ? `Hola, ${user.name.split(' ')[0]}` : "Hola,";
    const subtitle = user ? "Mi Cuenta" : "Inicia sesión";

    return (
        <Link href={href} className="flex items-center gap-2 group">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-gray-600 transition-all ${user ? 'bg-blue-50 border-blue-200 text-[var(--color-pharma-blue)]' : 'border-gray-200 group-hover:bg-blue-50 group-hover:text-[var(--color-pharma-blue)] group-hover:border-blue-200'}`}>
                <User className="w-5 h-5" />
            </div>
            <div className="hidden lg:flex flex-col leading-tight">
                <span className="text-[11px] text-gray-500">{title}</span>
                <span className="text-[13px] font-semibold text-[var(--color-text-dark)] group-hover:text-[var(--color-pharma-blue)]">{subtitle}</span>
            </div>
        </Link>
    );
}
