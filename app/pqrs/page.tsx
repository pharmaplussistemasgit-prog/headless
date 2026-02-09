'use client';

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, FileText } from 'lucide-react';

import { submitToJetForm } from '@/lib/jetform-connector';

// TODO: VERIFICAR NOMBRE DE CAMPOS EN JFB (macross: %nombre%, %email%, etc)
const PQRS_FORM_ID = 23124;

export default function PQRSPage() {
    const [formData, setFormData] = useState({
        type: '',
        name: '',
        idType: '',
        idNumber: '',
        email: '',
        phone: '',
        orderNumber: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.type || !formData.name || !formData.email || !formData.message) {
            setErrorMsg('Por favor diligencie los campos obligatorios (*)');
            setLoading(false);
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            const response = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: PQRS_FORM_ID,
                    data: {
                        // Mapeo hipotético - AJUSTAR SEGUN JFB
                        tipo_solicitud: formData.type,
                        nombre: formData.name,
                        tipo_doc: formData.idType,
                        num_doc: formData.idNumber,
                        email: formData.email,
                        telefono: formData.phone,
                        orden: formData.orderNumber,
                        mensaje: formData.message
                    }
                })
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                setFormData({ type: '', name: '', idType: '', idNumber: '', email: '', phone: '', orderNumber: '', message: '' });
                setTimeout(() => setSuccess(false), 8000);
            } else {
                setErrorMsg(result.message || 'Error al enviar la solicitud.');
            }

        } catch (err) {
            setErrorMsg('Error de conexión. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HERO SECTION */}
            <div className="relative bg-[var(--color-pharma-blue)] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-pharma-green)] opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm font-medium mb-6">
                        <CheckCircle className="w-4 h-4" />
                        <span>Servicio al Cliente</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Sistema de P.Q.R.S.
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Tu opinión es fundamental para nosotros. Radica tus peticiones, quejas, reclamos o sugerencias aquí.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-20">

                {/* INFO CARDS */}
                <div className="grid md:grid-cols-4 gap-4 mb-10 text-center">
                    {[
                        { title: 'Petición', desc: 'Solicitud de información o servicio.', color: 'bg-white border-blue-100 text-blue-700' },
                        { title: 'Queja', desc: 'Inconformidad con el servicio prestado.', color: 'bg-white border-yellow-100 text-yellow-700' },
                        { title: 'Reclamo', desc: 'Disconformidad con un producto o facturación.', color: 'bg-white border-red-100 text-red-700' },
                        { title: 'Sugerencia', desc: 'Propuesta para mejorar nuestro servicio.', color: 'bg-white border-green-100 text-green-700' }
                    ].map((item, index) => (
                        <div key={index} className={`p-6 rounded-xl border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${item.color}`}>
                            <h3 className="font-bold mb-2 text-gray-900">{item.title}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* FORMULARIO */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[var(--color-pharma-blue)]">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Radicar Solicitud</h2>
                                <p className="text-sm text-gray-500">Diligencia el formulario y te responderemos al correo registrado.</p>
                            </div>
                        </div>

                        {success ? (
                            <div className="bg-green-50/50 border border-green-100 rounded-2xl p-10 text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">¡Solicitud Radicada!</h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    Hemos recibido tu solicitud correctamente. Una copia con el número de radicado ha sido enviada a <strong>{formData.email}</strong>.
                                </p>

                                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8 bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                                    <div className="text-center p-2">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tiempo Respuesta</p>
                                        <p className="font-bold text-gray-900">15 días hábiles</p>
                                    </div>
                                    <div className="text-center p-2 border-l border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Prioridad</p>
                                        <p className="font-bold text-[var(--color-pharma-green)]">Alta</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSuccess(false)}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-pharma-green)] text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-900/10 hover:-translate-y-0.5"
                                >
                                    Nueva solicitud
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {errorMsg && (
                                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        {errorMsg}
                                    </div>
                                )}

                                {/* Tipo de solicitud - Visual Improvement */}
                                <div>
                                    <label className="text-sm font-bold text-gray-900 mb-4 block flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-[var(--color-pharma-blue)] flex items-center justify-center text-xs">1</span>
                                        Tipo de Solicitud *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['Petición', 'Queja', 'Reclamo', 'Sugerencia'].map((type) => (
                                            <label key={type} className={`
                                                cursor-pointer relative overflow-hidden group
                                            `}>
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value={type}
                                                    checked={formData.type === type}
                                                    onChange={handleChange}
                                                    className="peer hidden"
                                                    required
                                                />
                                                <div className={`
                                                    text-center p-4 rounded-xl border-2 transition-all duration-200
                                                    peer-checked:border-[var(--color-pharma-blue)] peer-checked:bg-blue-50/50 peer-checked:text-[var(--color-pharma-blue)] peer-checked:font-bold peer-checked:shadow-sm
                                                    border-gray-100 bg-gray-50/50 text-gray-500 hover:bg-gray-100 hover:border-gray-200
                                                `}>
                                                    {type}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-sm font-bold text-gray-900 block flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-[var(--color-pharma-blue)] flex items-center justify-center text-xs">2</span>
                                        Datos Personales
                                    </label>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Nombre Completo *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-300"
                                                placeholder="Ej: Juan Pérez"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Orden de Compra</label>
                                            <input
                                                type="text"
                                                name="orderNumber"
                                                value={formData.orderNumber}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-300"
                                                placeholder="Opcional (Ej: #1024)"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Tipo de Documento *</label>
                                            <div className="relative">
                                                <select
                                                    name="idType"
                                                    required
                                                    value={formData.idType}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="CC">Cédula de Ciudadanía</option>
                                                    <option value="CE">Cédula de Extranjería</option>
                                                    <option value="NIT">NIT</option>
                                                    <option value="PAS">Pasaporte</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Número de Documento *</label>
                                            <input
                                                type="text"
                                                name="idNumber"
                                                required
                                                value={formData.idNumber}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-300"
                                                placeholder="Ej: 1234567890"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Correo Electrónico *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-300"
                                                placeholder="nombre@ejemplo.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Teléfono Móvil *</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-300"
                                                placeholder="Ej: 300 123 4567"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900 block flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-[var(--color-pharma-blue)] flex items-center justify-center text-xs">3</span>
                                        Detalle de la Solicitud *
                                    </label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none placeholder:text-gray-300"
                                        placeholder="Por favor describe detalladamente tu solicitud, incluyendo fechas, lugares y cualquier otra información relevante..."
                                    ></textarea>
                                </div>

                                <div className="bg-blue-50/50 p-5 rounded-xl flex gap-4 text-sm text-blue-800 border border-blue-100/50">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p className="leading-relaxed opacity-90">
                                        Al enviar este formulario, aceptas nuestra <strong>Política de Tratamiento de Datos Personales</strong>. Tu información será enviada al área de servicio al cliente (<strong>atencionalusuario@pharmaplus.com.co</strong>) para su gestión.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[var(--color-pharma-green)] text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-900/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group hover:-translate-y-1"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Procesando envío...
                                            </>
                                        ) : (
                                            <>
                                                Enviar Solicitud
                                                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>PharmaPlus S.A.S. - Vigilado Superintendencia de Industria y Comercio</p>
                </div>
            </div>
        </div>
    );
}
