'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { User, Mail, Lock, Loader2, Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const EDIT_PROFILE_FORM_ID = 4352;

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        current_password: '', // Usually required by WP to change sensitive data, but JFB might bypass if logged in context is trusted. Leaving blank for now.
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (!auth.isAuthenticated()) {
            router.push('/login');
            return;
        }

        const user = auth.getUser();
        if (user) {
            // Split name into First/Last if possible, otherwise just dump into First Name
            const nameParts = (user.name || '').split(' ');
            setFormData(prev => ({
                ...prev,
                first_name: nameParts[0] || '',
                last_name: nameParts.slice(1).join(' ') || '',
                email: user.email || ''
            }));
        }
        setInitialLoading(false);
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccess(false);

        if (formData.new_password && formData.new_password !== formData.confirm_password) {
            setErrorMsg('las nuevas contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const token = auth.getToken();

            // Payload for JFB
            const payload: any = {
                user_email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
            };

            // Only send password if user wants to change it
            if (formData.new_password) {
                payload.user_pass = formData.new_password;
            }

            const response = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send Token!
                },
                body: JSON.stringify({
                    formId: EDIT_PROFILE_FORM_ID,
                    data: payload
                })
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                // Update local session data to reflect name changes
                // Note: We can't easily update the token/email without a fresh login, 
                // but we can update the Display Name in localStorage.
                const currentUser = auth.getUser();
                if (currentUser) {
                    auth.saveSessionRaw({
                        ...currentUser,
                        name: `${formData.first_name} ${formData.last_name}`.trim()
                    });
                }
            } else {
                setErrorMsg(result.message || 'Error al actualizar perfil. Intenta nuevamente.');
            }

        } catch (err) {
            setErrorMsg('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-[var(--color-pharma-blue)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">

                <div className="mb-8">
                    <Link href="/mi-cuenta" className="inline-flex items-center text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Mi Cuenta
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
                    <p className="text-gray-600 mt-2">Actualiza tu información personal y contraseña.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-center gap-3 text-green-700 animate-in fade-in">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <p className="font-bold">¡Datos actualizados!</p>
                                <p className="text-sm">Tu información se ha guardado correctamente.</p>
                            </div>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{errorMsg}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Personal</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            required
                                            className="pl-10 h-11 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-pharma-blue)] focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            required
                                            className="pl-10 h-11 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-pharma-blue)] focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico (Solo lectura)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="pl-10 h-11 w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Para cambiar tu email, por favor contacta a soporte.</p>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="space-y-4 pt-4">
                            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Seguridad (Opcional)</h2>
                            <p className="text-sm text-gray-600">Deja estos campos vacíos si no deseas cambiar tu contraseña.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            name="new_password"
                                            value={formData.new_password}
                                            onChange={handleChange}
                                            placeholder="Nueva contraseña"
                                            className="pl-10 h-11 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-pharma-blue)] focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            placeholder="Repetir nueva contraseña"
                                            className="pl-10 h-11 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-pharma-blue)] focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-[var(--color-pharma-blue)] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-pharma-blue)] transition-all disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
