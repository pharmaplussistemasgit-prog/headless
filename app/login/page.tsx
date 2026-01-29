'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await auth.login(formData.username, formData.password);

        if (result.success) {
            // Redirigir a Mi Cuenta o Home
            router.push('/mi-cuenta');
            router.refresh();
        } else {
            setError(result.error || 'Ocurrió un error al iniciar sesión');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/">
                    <div className="relative w-48 h-16 mx-auto mb-6">
                        <Image
                            src="/brand/logo-new-clean.png" // Usando el logo limpio que vimos en el header
                            alt="PharmaPlus"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--color-pharma-blue)]">
                    Bienvenido de nuevo
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ingresa a tu cuenta para gestionar tus pedidos
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-blue-900/5 sm:rounded-xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {error && (
                            <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                <div className="text-sm text-red-700">{error}</div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Correo electrónico o Usuario
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[var(--color-pharma-blue)] focus:border-[var(--color-pharma-blue)] text-gray-900 sm:text-sm transition-colors"
                                    placeholder="tucorreo@ejemplo.com"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-[var(--color-pharma-blue)] hover:text-blue-700">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                            </div>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[var(--color-pharma-blue)] focus:border-[var(--color-pharma-blue)] text-gray-900 sm:text-sm transition-colors"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-[var(--color-pharma-blue)] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-pharma-blue)] transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Iniciar Sesión
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    ¿No tienes cuenta?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3">
                            <a
                                href={`${process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') || 'https://tienda.pharmaplus.com.co'}/mi-cuenta`}
                                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-full shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Crear cuenta nueva
                                <ArrowRight className="w-4 h-4 -rotate-45" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
