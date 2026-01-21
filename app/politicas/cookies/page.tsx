'use client';

import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Settings, Shield, Info, MapPin, Check } from 'lucide-react';
import { useState } from 'react';
import CookiePreferencesModal from '@/components/cookies/CookiePreferencesModal';

export default function CookiesPolicyPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="px-8 py-10 bg-[var(--color-pharma-blue)] text-white text-center">
                    <h1 className="text-3xl font-bold mb-4">Política de Cookies</h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                        Transparencia total sobre cómo y por qué utilizamos cookies en PharmaPlus. Tu privacidad es nuestra prioridad.
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 space-y-10">

                    {/* Intro */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Qué son las cookies?</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Las cookies son pequeños archivos de texto que los sitios web que visitas guardan en tu ordenador o dispositivo móvil.
                            Permiten que el sitio web recuerde tus acciones y preferencias (como inicio de sesión, idioma, tamaño de letra y otras preferencias de visualización)
                            durante un período de tiempo, para que no tengas que volver a configurarlas cada vez que vuelvas al sitio o navegues por sus páginas.
                        </p>
                    </section>

                    {/* Tipos de Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tipos de Cookies que utilizamos</h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            <CookieCard
                                icon={<Shield className="w-6 h-6" />}
                                title="Esenciales (Necesarias)"
                                description="Son indispensables para que el sitio web funcione correctamente. Incluyen funciones de seguridad y acceso."
                                type="essential"
                            />
                            <CookieCard
                                icon={<MapPin className="w-6 h-6" />}
                                title="Funcionales"
                                description="Nos permiten recordar tus elecciones (como tu ubicación para envíos) y proporcionar características mejoradas y personalizadas."
                                type="functional"
                            />
                            <CookieCard
                                icon={<Info className="w-6 h-6" />}
                                title="Analíticas"
                                description="Nos ayudan a entender cómo interactúan los visitantes con el sitio web, reuniendo y proporcionando información de forma anónima."
                                type="analytics"
                            />
                            <CookieCard
                                icon={<Check className="w-6 h-6" />}
                                title="Marketing"
                                description="Se utilizan para rastrear a los visitantes en los sitios web. La intención es mostrar anuncios relevantes y atractivos para el usuario individual."
                                type="marketing"
                            />
                        </div>
                    </section>

                    {/* Gestión */}
                    <section className="bg-blue-50 rounded-xl p-8 border border-blue-100">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-bold text-[var(--color-pharma-blue)] mb-2">Gestionar tus Preferencias</h3>
                                <p className="text-gray-600">
                                    Puedes cambiar tu configuración de cookies en cualquier momento haciendo clic en el botón de abajo.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-[var(--color-pharma-blue)] hover:bg-[var(--color-blue-classic)] text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 transition-transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                            >
                                <Settings className="w-5 h-5" />
                                Configurar Cookies
                            </button>
                        </div>
                    </section>

                    {/* Tabla Detallada */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalle de Cookies</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-900 font-bold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3">Nombre</th>
                                        <th className="px-6 py-3">Proveedor</th>
                                        <th className="px-6 py-3">Propósito</th>
                                        <th className="px-6 py-3">Duración</th>
                                        <th className="px-6 py-3">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-gray-900">pharma_cookie_consent</td>
                                        <td className="px-6 py-4">PharmaPlus</td>
                                        <td className="px-6 py-4">Guarda tus preferencias de consentimiento de cookies.</td>
                                        <td className="px-6 py-4">6 meses</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">Esencial</span></td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-gray-900">pharma_user_location</td>
                                        <td className="px-6 py-4">PharmaPlus</td>
                                        <td className="px-6 py-4">Recuerda tu ciudad detectada para calcular envíos.</td>
                                        <td className="px-6 py-4">Persistente</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 rounded text-xs font-bold text-[var(--color-pharma-blue)]">Funcional</span></td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-gray-900">session_id</td>
                                        <td className="px-6 py-4">PharmaPlus</td>
                                        <td className="px-6 py-4">Mantiene tu sesión de usuario activa.</td>
                                        <td className="px-6 py-4">Sesión</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">Esencial</span></td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-gray-900">_ga</td>
                                        <td className="px-6 py-4">Google Analytics</td>
                                        <td className="px-6 py-4">Se usa para distinguir a los usuarios.</td>
                                        <td className="px-6 py-4">2 años</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 rounded text-xs font-bold text-[var(--color-pharma-green)]">Analítica</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>

            <CookiePreferencesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

function CookieCard({ icon, title, description, type }: { icon: React.ReactNode, title: string, description: string, type: string }) {
    const colors: Record<string, string> = {
        essential: "bg-gray-100 text-gray-600",
        functional: "bg-blue-100 text-[var(--color-pharma-blue)]",
        analytics: "bg-green-100 text-[var(--color-pharma-green)]",
        marketing: "bg-purple-100 text-purple-600"
    };

    return (
        <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[type]}`}>
                {icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
}
