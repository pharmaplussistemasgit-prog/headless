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
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Sistema de <span className="text-[var(--color-pharma-blue)]">P.Q.R.S.</span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                        Bienvenido al sistema de Peticiones, Quejas, Reclamos y Sugerencias de PharmaPlus.
                        Tu opinión es fundamental para mejorar nuestro servicio.
                    </p>
                </div>

                {/* INFO CARDS */}
                <div className="grid md:grid-cols-4 gap-4 mb-10 text-center">
                    {[
                        { title: 'Petición', desc: 'Solicitud de información o servicio.', color: 'bg-blue-50 text-blue-700' },
                        { title: 'Queja', desc: 'Inconformidad con el servicio prestado.', color: 'bg-yellow-50 text-yellow-700' },
                        { title: 'Reclamo', desc: 'Disconformidad con un producto o facturación.', color: 'bg-red-50 text-red-700' },
                        { title: 'Sugerencia', desc: 'Propuesta para mejorar nuestro servicio.', color: 'bg-green-50 text-green-700' }
                    ].map((item, index) => (
                        <div key={index} className={`p-4 rounded-xl border border-transparent hover:border-gray-200 shadow-sm transition-all ${item.color} bg-opacity-50`}>
                            <h3 className="font-bold mb-1">{item.title}</h3>
                            <p className="text-xs opacity-90">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* FORMULARIO */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
                        <FileText className="w-6 h-6 text-[var(--color-pharma-blue)]" />
                        <h2 className="text-xl font-bold text-gray-800">Radicar solicitud</h2>
                    </div>

                    {success ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">¡Solicitud Radicada!</h3>
                            <p className="text-green-700 mb-4">
                                Tu PQRS ha sido recibida exitosamente. Hemos enviado una copia de la confirmación a tu correo electrónico.
                            </p>
                            <div className="bg-white p-4 rounded-lg border border-green-200 inline-block text-left text-sm text-gray-600">
                                <p><span className="font-bold">Tiempo de respuesta:</span> 15 días hábiles</p>
                                <p><span className="font-bold">Prioridad:</span> Alta</p>
                            </div>
                            <button
                                onClick={() => setSuccess(false)}
                                className="block mx-auto mt-6 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Nueva solicitud
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {errorMsg && (
                                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm mb-4">
                                    {errorMsg}
                                </div>
                            )}

                            {/* Tipo de solicitud */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-2 block">Tipo de Solicitud *</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['Petición', 'Queja', 'Reclamo', 'Sugerencia'].map((type) => (
                                        <label key={type} className={`
                                            cursor-pointer text-center p-3 rounded-lg border transition-all text-sm font-medium
                                            ${formData.type === type
                                                ? 'bg-blue-50 border-[var(--color-pharma-blue)] text-[var(--color-pharma-blue)] ring-1 ring-[var(--color-pharma-blue)]'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }
                                        `}>
                                            <input
                                                type="radio"
                                                name="type"
                                                value={type}
                                                checked={formData.type === type}
                                                onChange={handleChange}
                                                className="hidden"
                                                required
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        placeholder="Tu nombre completo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Orden de Compra (Opcional)</label>
                                    <input
                                        type="text"
                                        name="orderNumber"
                                        value={formData.orderNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        placeholder="#12345"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Tipo de Documento *</label>
                                    <select
                                        name="idType"
                                        required
                                        value={formData.idType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                        <option value="NIT">NIT</option>
                                        <option value="PAS">Pasaporte</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Número de Documento *</label>
                                    <input
                                        type="text"
                                        name="idNumber"
                                        required
                                        value={formData.idNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        placeholder="1234567890"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Correo Electrónico *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        placeholder="tucorreo@ejemplo.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Teléfono *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        placeholder="300 123 4567"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Descripción de la Solicitud *</label>
                                <textarea
                                    name="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                                    placeholder="Describe detalladamente los hechos, fechas y cualquier información relevante..."
                                ></textarea>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-800">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>
                                    Al enviar este formulario, aceptas nuestra Política de Tratamiento de Datos Personales y certificas que la información suministrada es veraz.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--color-pharma-blue)] text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    'Procesando...'
                                ) : (
                                    <>
                                        Radicar Solicitud
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>PharmaPlus S.A.S. - Vigilado Superintendencia de Industria y Comercio</p>
                </div>
            </div>
        </div>
    );
}
