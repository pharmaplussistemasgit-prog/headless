import { useState, useEffect } from 'react';
import { useCookieConsent, CookieConsent } from '@/hooks/useCookieConsent';
import { X, Check, Shield, Info, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// If shadcn components are not available, I will create a custom modal structure here.
// Checking project structure... reusing ShippingModal pattern for consistency.

interface CookiePreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CookiePreferencesModal({ isOpen, onClose }: CookiePreferencesModalProps) {
    const { consent, updatePreferences, acceptAll } = useCookieConsent();
    const [localPreferences, setLocalPreferences] = useState<CookieConsent>(consent);

    // Sincronizar estado local al abrir
    useEffect(() => {
        if (isOpen) {
            setLocalPreferences(consent);
        }
    }, [isOpen, consent]);

    const handleSave = () => {
        updatePreferences(localPreferences);
        onClose();
    };

    const togglePreference = (key: keyof CookieConsent) => {
        if (key === 'essential') return; // Cannot toggle essential
        setLocalPreferences(prev => ({
            ...prev,
            [key]: !prev[key as keyof CookieConsent] // Casting for TS
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Preferencias de Cookies</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <p className="text-sm text-gray-600">
                        Gestiona tus preferencias de consentimiento. Las cookies esenciales son necesarias para el correcto funcionamiento del sitio.
                    </p>

                    <div className="space-y-4">
                        {/* Essential */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 opacity-70">
                            <div className="mt-1 p-2 bg-gray-200 rounded-lg text-gray-500">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-gray-900">Esenciales</h4>
                                    <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded uppercase">Siempre Activas</span>
                                </div>
                                <p className="text-xs text-gray-500">Necesarias para seguridad, acceso a red y funcionalidades básicas.</p>
                            </div>
                        </div>

                        {/* Functional */}
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                            <div className={`mt-1 p-2 rounded-lg transition-colors ${localPreferences.functional ? 'bg-blue-100 text-[var(--color-pharma-blue)]' : 'bg-gray-100 text-gray-400'}`}>
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-gray-900">Funcionales</h4>
                                    <Switch checked={localPreferences.functional} onChange={() => togglePreference('functional')} />
                                </div>
                                <p className="text-xs text-gray-500">Habilitan funciones avanzadas como geolocalización automática y personalización.</p>
                            </div>
                        </div>

                        {/* Analytics */}
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                            <div className={`mt-1 p-2 rounded-lg transition-colors ${localPreferences.analytics ? 'bg-green-100 text-[var(--color-pharma-green)]' : 'bg-gray-100 text-gray-400'}`}>
                                <Info className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-gray-900">Analíticas</h4>
                                    <Switch checked={localPreferences.analytics} onChange={() => togglePreference('analytics')} />
                                </div>
                                <p className="text-xs text-gray-500">Nos ayudan a entender cómo usas el sitio para mejorarlo. Todos los datos son anónimos.</p>
                            </div>
                        </div>

                        {/* Marketing */}
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                            <div className={`mt-1 p-2 rounded-lg transition-colors ${localPreferences.marketing ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                                <Check className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-gray-900">Marketing</h4>
                                    <Switch checked={localPreferences.marketing} onChange={() => togglePreference('marketing')} />
                                </div>
                                <p className="text-xs text-gray-500">Permiten mostrarte ofertas relevantes y medir la efectividad de nuestras campañas.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            acceptAll();
                            onClose();
                        }}
                        className="px-5 py-2.5 text-sm font-semibold text-[var(--color-pharma-blue)] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                    >
                        Permitir Todas
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-[var(--color-pharma-blue)] hover:bg-[var(--color-blue-classic)] shadow-lg shadow-blue-900/10 rounded-xl transition-all hover:scale-105"
                    >
                        Guardar Preferencias
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// Simple Switch Component for internal use
function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-pharma-blue)] focus:ring-offset-2
                ${checked ? 'bg-[var(--color-pharma-blue)]' : 'bg-gray-200'}
            `}
        >
            <span className="sr-only">Toggle setting</span>
            <span
                aria-hidden="true"
                className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${checked ? 'translate-x-5' : 'translate-x-0'}
                `}
            />
        </button>
    );
}
