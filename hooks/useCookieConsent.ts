import { useState, useEffect } from 'react';

// Tipos de Cookies
export type CookieCategory = 'essential' | 'analytics' | 'marketing' | 'functional';

export interface CookieConsent {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
    timestamp?: string;
    version?: string;
}

const COOKIE_CONSENT_KEY = 'pharma_cookie_consent';
const CURRENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 180; // 6 Meses

const DEFAULT_CONSENT: CookieConsent = {
    essential: true, // Siempre true
    analytics: false,
    marketing: false,
    functional: false
};

// Evento personalizado para sincronizar pestañas o componentes
const CONSENT_UPDATE_EVENT = 'pharma-cookie-update';

export function useCookieConsent() {
    const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);
    const [hasConsented, setHasConsented] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    // Cargar consentimiento al montar
    useEffect(() => {
        loadConsent();

        // Escuchar cambios desde otras instancias
        const handleUpdate = () => loadConsent();
        window.addEventListener(CONSENT_UPDATE_EVENT, handleUpdate);

        return () => window.removeEventListener(CONSENT_UPDATE_EVENT, handleUpdate);
    }, []);

    const loadConsent = () => {
        try {
            const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (stored) {
                const parsed: CookieConsent = JSON.parse(stored);

                // Verificar versión y expiración
                const now = new Date();
                const consentDate = parsed.timestamp ? new Date(parsed.timestamp) : new Date(0);
                const diffDays = (now.getTime() - consentDate.getTime()) / (1000 * 3600 * 24);

                if (parsed.version === CURRENT_VERSION && diffDays < CONSENT_EXPIRY_DAYS) {
                    setConsent(parsed);
                    setHasConsented(true);
                } else {
                    // Si expiró o cambió versión, resetear pero mantener preferencias previas como "propuesta" si se desea
                    // Por ahora, reseteamos a default para forzar revisión nueva
                    setHasConsented(false);
                }
            } else {
                setHasConsented(false);
            }
        } catch (e) {
            console.error("Error loading cookie consent", e);
            setHasConsented(false);
        } finally {
            setIsLoaded(true);
        }
    };

    const saveConsent = (newConsent: CookieConsent) => {
        const consentToSave = {
            ...newConsent,
            essential: true, // Asegurar essential
            timestamp: new Date().toISOString(),
            version: CURRENT_VERSION
        };

        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentToSave));
        setConsent(consentToSave);
        setHasConsented(true);

        // Disparar evento
        window.dispatchEvent(new Event(CONSENT_UPDATE_EVENT));
    };

    const acceptAll = () => {
        saveConsent({
            essential: true,
            analytics: true,
            marketing: true,
            functional: true
        });
    };

    const rejectAll = () => {
        saveConsent({
            essential: true,
            analytics: false,
            marketing: false,
            functional: false
        });
    };

    const updatePreferences = (preferences: Partial<CookieConsent>) => {
        saveConsent({
            ...consent,
            ...preferences,
            essential: true
        });
    };

    const resetConsent = () => {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        setHasConsented(false);
        setConsent(DEFAULT_CONSENT);
        window.dispatchEvent(new Event(CONSENT_UPDATE_EVENT));
    };

    return {
        consent,
        hasConsented,
        isLoaded,
        acceptAll,
        rejectAll,
        updatePreferences,
        resetConsent
    };
}
