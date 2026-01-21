"use client";

import { useState, useEffect } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";

interface LocationState {
    city: string | null;
    loading: boolean;
    error: string | null;
    requestLocation: () => void;
}

export function useGeolocation(): LocationState {
    const [city, setCity] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { consent, hasConsented } = useCookieConsent();

    const requestLocation = () => {
        // Si no han consentido cookies funcionales, podemos pedir los dos permisos:
        // 1. Consentimiento de cookies (implicito o pedir que acepten)
        // 2. Permiso del navegador

        // Estrategia: Si el usuario hace clic explícitamente en "Localizarme", 
        // asumimos interés y procedemos, pero idealmente deberíamos verificar 'functional'.
        // Aquí procedemos a pedir permiso al navegador directamente.

        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocalización no soportada");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    // Nominatim returns address object with flexible keys
                    const address = data.address;
                    console.log("📍 Dirección detectada (Nominatim):", address);

                    // Prioritize City/Municipality/County over Town to avoid smaller adjacent localities
                    const locationName =
                        address.city ||
                        address.municipality ||
                        address.county ||
                        address.town ||
                        address.village ||
                        "Ubicación detectada";

                    setCity(locationName);

                    // Simple caching to avoid re-fetching on valid session
                    localStorage.setItem("pharma_user_location", locationName);
                } catch (err) {
                    console.error("Error reversing geocode:", err);
                    setError("Error al obtener ciudad");
                    setCity(null);
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                console.warn("Geolocation error:", err);
                let errorMessage = "Ubicación no disponible";
                if (err.code === 1) errorMessage = "Permiso denegado";
                else if (err.code === 2) errorMessage = "Ubicación no disponible";
                else if (err.code === 3) errorMessage = "Tiempo de espera agotado";

                setError(errorMessage);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // High accuracy, no cache logic for GPS
        );
    };

    // Auto-load from cache if available on mount
    useEffect(() => {
        const cached = localStorage.getItem("pharma_user_location");
        if (cached) {
            setCity(cached);
        } else {
            // Updated Logic: Only auto-request if 'functional' cookies are consented
            if (hasConsented && consent.functional) {
                requestLocation();
            }
        }
    }, [hasConsented, consent.functional]); // Depend on consent changes

    return { city, loading, error, requestLocation };
}
