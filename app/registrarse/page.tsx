'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, User, Calendar, Users, Loader2, AlertCircle, CheckCircle, ArrowRight, MapPin, Phone, CreditCard, ChevronRight } from 'lucide-react';
import { COLOMBIA_STATES, COLOMBIA_CITIES } from '@/lib/colombia-data';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        id_type: 'CC',
        id_number: '',
        birth_date: '',
        gender: '',
        email: '',
        phone: '',
        state: '', // Department Code (e.g., CO-ANT)
        city: '',  // City Name
        address: '',
        password: '',
        confirm_password: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Captcha State
    const [sliderValue, setSliderValue] = useState(0);
    const [captchaVerified, setCaptchaVerified] = useState(false);

    const handleSliderStart = () => {
        // Optional logic for drag start visual
    };

    const handleSliderMove = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (captchaVerified) return;
        const val = parseInt(e.target.value);
        setSliderValue(val);
        if (val >= 98) {
            setCaptchaVerified(true);
            setSliderValue(100);
        }
    };

    const handleSliderEnd = () => {
        if (!captchaVerified) {
            setSliderValue(0); // Snap back if not fully completed
        }
    };

    // Filter cities based on selected state
    const availableCities = useMemo(() => {
        if (!formData.state) return [];
        return COLOMBIA_CITIES.filter(city => city.stateCode === formData.state);
    }, [formData.state]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset city if state changes
            ...(name === 'state' ? { city: '' } : {})
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (formData.password !== formData.confirm_password) {
            setErrorMsg('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register-custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login?registered=true');
                }, 3000);
            } else {
                setErrorMsg(result.message || 'Error al crear la cuenta.');
            }

        } catch (err: any) {
            console.error("Registration Error:", err);
            setErrorMsg('Error de conexión. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-6xl">
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
                    Completa tus datos para disfrutar de todos nuestros beneficios
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-6xl px-4">
                <div className="bg-white py-8 px-4 shadow-xl shadow-blue-900/5 sm:rounded-2xl sm:px-10 border border-gray-100">

                    {success ? (
                        <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido a PharmaPlus!</h3>
                            <p className="text-gray-600 mb-8 text-lg">
                                Tu cuenta ha sido creada exitosamente. <br />
                                <span className="text-sm">Redirigiendo al inicio de sesión...</span>
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-pharma-blue)] text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                Iniciar Sesión Ahora
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {errorMsg && (
                                <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-red-800 font-medium">{errorMsg}</div>
                                </div>
                            )}

                            {/* Section 1: Personal Data */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <User className="text-[var(--color-pharma-green)] w-5 h-5" />
                                    <h3 className="text-lg font-bold text-gray-900">Datos Personales</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Nombre *</label>
                                        <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="Tu nombre" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Apellido *</label>
                                        <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="Tu apellido" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Tipo Doc *</label>
                                        <select name="id_type" required value={formData.id_type} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none bg-white">
                                            <option value="CC">C.C.</option>
                                            <option value="CE">C.E.</option>
                                            <option value="NIT">NIT</option>
                                            <option value="PAS">Pasaporte</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Número de Documento *</label>
                                        <input type="text" name="id_number" required value={formData.id_number} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="Ej: 123456789" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Fecha Nacimiento (Opcional)</label>
                                        <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Sexo *</label>
                                        <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none bg-white">
                                            <option value="">Seleccionar...</option>
                                            <option value="H">Masculino</option>
                                            <option value="M">Femenino</option>
                                            <option value="O">Otro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Contact & Location */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 pt-2">
                                    <MapPin className="text-[var(--color-pharma-green)] w-5 h-5" />
                                    <h3 className="text-lg font-bold text-gray-900">Ubicación y Contacto</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Departamento *</label>
                                        <select name="state" required value={formData.state} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none bg-white">
                                            <option value="">Seleccionar...</option>
                                            {COLOMBIA_STATES.map((st) => (
                                                <option key={st.code} value={st.code}>{st.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Ciudad *</label>
                                        <select name="city" required value={formData.city} onChange={handleChange} disabled={!formData.state} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400">
                                            <option value="">Seleccionar...</option>
                                            {availableCities.map((c) => (
                                                <option key={c.code} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Dirección *</label>
                                    <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="Ej: Calle 123 # 45 - 67, Apto 101" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Teléfono Móvil *</label>
                                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="300 123 4567" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Correo Electrónico *</label>
                                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="tucorreo@ejemplo.com" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Security */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 pt-2">
                                    <Lock className="text-[var(--color-pharma-green)] w-5 h-5" />
                                    <h3 className="text-lg font-bold text-gray-900">Seguridad</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Contraseña *</label>
                                        <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Confirmar Contraseña *</label>
                                        <input type="password" name="confirm_password" required value={formData.confirm_password} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Validation */}
                            <div className="space-y-4 pt-2">
                                <label className="block text-sm font-bold text-gray-700">Verificación de Seguridad</label>
                                <div className="relative w-full h-12 bg-gray-100 rounded-xl border border-gray-200 flex items-center px-1 overflow-hidden select-none">
                                    <div className={`text-sm text-gray-400 w-full text-center pointer-events-none transition-opacity duration-300 ${captchaVerified ? 'opacity-0' : 'opacity-100'}`}>
                                        Desliza para verificar
                                    </div>
                                    <div
                                        className={`absolute left-0 top-0 bottom-0 bg-green-500 transition-all duration-100 ease-out flex items-center justify-center ${captchaVerified ? 'w-full rounded-xl' : 'w-12 rounded-l-xl'}`}
                                        style={!captchaVerified ? { width: `${Math.max(48, Math.min(sliderValue, 100))}%` } : {}}
                                    >
                                        {captchaVerified ? (
                                            <span className="text-white font-bold flex items-center gap-2 animate-in fade-in zoom-in">
                                                <CheckCircle className="w-5 h-5 fill-white text-green-500" />
                                                ¡Verificado!
                                            </span>
                                        ) : (
                                            <div
                                                className="w-12 h-10 bg-white shadow-md rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing ml-1"
                                                onMouseDown={handleSliderStart}
                                                onTouchStart={handleSliderStart}
                                            >
                                                <ChevronRight className="w-6 h-6 text-[var(--color-pharma-green)]" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Invisible slider input overlay for logic if needed, but using direct event handling for better custom feel */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={captchaVerified ? 100 : sliderValue}
                                        onChange={handleSliderMove}
                                        onMouseUp={handleSliderEnd}
                                        onTouchEnd={handleSliderEnd}
                                        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${captchaVerified ? 'pointer-events-none' : ''}`}
                                        disabled={captchaVerified}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || !captchaVerified}
                                    className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-[var(--color-pharma-blue)] hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-gray-400 hover:-translate-y-1"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Crear Mi Cuenta
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                ¿Ya tienes una cuenta?{' '}
                                <Link href="/login" className="font-bold text-[var(--color-pharma-blue)] hover:underline">
                                    Inicia Sesión aquí
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
