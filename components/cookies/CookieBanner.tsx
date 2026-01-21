'use client';

import { useState, useEffect } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Cookie, ShieldCheck, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CookiePreferencesModal from './CookiePreferencesModal';
import Link from 'next/link';

export default function CookieBanner() {
    const { hasConsented, isLoaded, acceptAll, rejectAll } = useCookieConsent();
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Solo mostrar si ya cargó y no hay consentimiento
    useEffect(() => {
        if (isLoaded && !hasConsented) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isLoaded, hasConsented]);

    if (!isVisible) return <CookiePreferencesModal isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />;

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                    >
                        <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md border border-white/20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl p-6 md:flex md:items-center md:justify-between gap-6 ring-1 ring-gray-900/5">

                            {/* Icon & Text */}
                            <div className="flex items-start gap-4 mb-6 md:mb-0 max-w-3xl">
                                <div className="p-3 bg-blue-50 rounded-xl text-[var(--color-pharma-blue)] flex-shrink-0">
                                    <Cookie className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-900">Valoramos tu privacidad</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y personalizar contenido.
                                        Puedes aceptar todas o configurar tus preferencias. Tu elección se guardará por 6 meses.
                                        Consulta nuestra <Link href="/politicas/cookies" className="text-[var(--color-pharma-blue)] font-semibold hover:underline">Política de Cookies</Link>.
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                                <button
                                    onClick={() => setIsPreferencesOpen(true)}
                                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    Configurar
                                </button>
                                <button
                                    onClick={rejectAll}
                                    className="px-4 py-2.5 text-sm font-semibold text-[var(--color-pharma-blue)] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                >
                                    Rechazar Todo
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-[var(--color-pharma-blue)] hover:bg-[var(--color-blue-classic)] shadow-lg shadow-blue-900/10 rounded-xl transition-all hover:scale-105"
                                >
                                    Aceptar Todo
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Preferencias (siempre renderizado pero controlado por prop isOpen) */}
            <CookiePreferencesModal isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />
        </>
    );
}
