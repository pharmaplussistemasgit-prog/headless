'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, User, Calendar, Users, Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { submitToJetForm } from '@/lib/jetform-connector';

// ID del formulario de Registro (Proporcionado por usuario)
const REGISTER_FORM_ID = 9537;

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '', // En WP usualmente el email es el username o se genera
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // Mapeo de datos para JetFormBuilder
            // Nota: Los nombres de los campos deben coincidir con los de WP.
            // Usamos nombres genéricos lógicos, si fallan tendremos que pedir los exactos.
            const payload = {
                user_source_id: '0', // A veces requerido por JFB para nuevas entradas
                user_email: formData.email,
                user_login: formData.email, // Usamos email como login
                user_password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                // Campos meta personalizados (Probables nombres en JFB)
                fecha_nacimiento: formData.birth_date,
                sexo: formData.gender,
                // Fallback para nombres comunes de JFB
                date_of_birth: formData.birth_date,
                gender: formData.gender
            };

            const response = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: REGISTER_FORM_ID,
                    data: payload
                })
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                // Opcional: Redirigir al login después de unos segundos
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setErrorMsg(result.message || 'Error al crear la cuenta. Intenta nuevamente.');
            }

        } catch (err) {
            setErrorMsg('Error de conexión. Por favor verifica tu internet.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/">
                    <div className="relative w-48 h-16 mx-auto mb-6">
                        <Image
                            src="/brand/logo-new-clean.png"
                            alt="PharmaPlus"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--color-pharma-blue)]">
                    Crear cuenta nueva
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Únete a PharmaPlus y gestiona tus pedidos fácilmente
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow-xl shadow-blue-900/5 sm:rounded-xl sm:px-10 border border-gray-100">

                    {success ? (
                        <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Cuenta creada con éxito!</h3>
                            <p className="text-gray-600 mb-6">
                                Tu registro se ha completado. Redirigiendo al inicio de sesión...
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--color-pharma-blue)] text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                            >
                                Iniciar Sesión Ahora
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {errorMsg && (
                                <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div className="text-sm text-red-700">{errorMsg}</div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="first_name"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[var(--color-pharma-blue)] focus:border-[var(--color-pharma-blue)] text-gray-900 sm:text-sm"
                                            placeholder="Tu nombre"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="last_name"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[var(--color-pharma-blue)] focus:border-[var(--color-pharma-blue)] text-gray-900 sm:text-sm"
                                            placeholder="Tu apellido"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[var(--color-pharma-blue)] focus:border-[var(--color-pharma-blue)] text-gray-900 sm:text-sm"
                                        placeholder="tucorreo@ejemplo.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento *</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="birth_date"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[var(--color-pharma-blue)] focus:border-[var(--color-pharma-blue)] text-gray-900 sm:text-sm"
                                            value={formData.birth_date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sexo *</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Users className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            name="gender"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[var(--color-pharma-blue)] focus:border-[var(--color-pharma-blue)] text-gray-900 sm:text-sm"
                                            value={formData.gender}
                                            onChange={handleChange}
                                        >
                                            <option value="">Selecciona...</option>
                                            <option value="H">Masculino</option>
                                            <option value="M">Femenino</option>
                                            <option value="O">Otro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[var(--color-pharma-blue)] focus:border-[var(--color-pharma-blue)] text-gray-900 sm:text-sm"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
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
                                            Crear Cuenta
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        ¿Ya tienes cuenta?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3">
                                <Link
                                    href="/login"
                                    className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-full shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Iniciar Sesión
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
