"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://api.whatsapp.com/send/?phone=573019086637&text&type=phone_number&app_absent=0";

export default function HolidayNoticePopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Solo mostrar una vez por sesión
        const hasShown = sessionStorage.getItem("holidayPopupShown");
        if (hasShown) return;

        let triggered = false;

        const triggerPopup = () => {
            if (triggered) return;
            triggered = true;
            sessionStorage.setItem("holidayPopupShown", "true");
            setIsOpen(true);
            // Pequeño delay para la animación de entrada
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        };

        // Timer de 4 segundos
        const timer = setTimeout(triggerPopup, 4000);

        // Scroll del 40%
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight > 0) {
                const scrollPercent = (window.scrollY / scrollHeight) * 100;
                if (scrollPercent >= 40) {
                    triggerPopup();
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            clearTimeout(timer);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const closePopup = () => {
        setIsVisible(false);
        setTimeout(() => setIsOpen(false), 200);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closePopup();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Popup Card */}
            <div
                className={`relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl transition-transform duration-200 ${isVisible ? "scale-100" : "scale-95"}`}
                style={{
                    background: "linear-gradient(135deg, #060321 0%, #1a1040 50%, #060321 100%)",
                    border: "2px solid #3B00FF",
                }}
            >
                {/* Content container */}
                <div className="relative z-10 p-6 md:p-8">
                    {/* Close button */}
                    <button
                        onClick={closePopup}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#3B00FF] hover:bg-[#5a2fff] transition-colors"
                        aria-label="Cerrar popup"
                    >
                        <X className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </button>

                    {/* Alert icon */}
                    <div className="mb-5 flex justify-center">
                        <div
                            className="flex h-16 w-16 items-center justify-center rounded-full"
                            style={{ background: "#90FF00" }}
                        >
                            <AlertTriangle className="h-8 w-8 text-[#060321]" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Title */}
                    <h2
                        className="mb-4 text-center text-2xl font-extrabold tracking-tight md:text-3xl"
                        style={{
                            fontFamily: "var(--font-jost)",
                            color: "#90FF00",
                        }}
                    >
                        ⚠️ Aviso Importante
                    </h2>

                    {/* Message card */}
                    <div
                        className="mb-5 rounded-xl p-4"
                        style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(144, 255, 0, 0.2)",
                        }}
                    >
                        <p className="text-sm leading-relaxed text-gray-200 md:text-base mb-3">
                            Las compras realizadas entre el{" "}
                            <span className="font-bold text-[#90FF00]">31 de diciembre</span>{" "}
                            y el{" "}
                            <span className="font-bold text-[#90FF00]">4 de enero</span>{" "}
                            serán despachadas a partir del{" "}
                            <span className="font-bold text-[#3B00FF]">5 de enero de 2026</span>.
                        </p>
                        <p className="text-sm text-gray-300">
                            Agradecemos tu <span className="font-semibold text-white">comprensión</span> y{" "}
                            <span className="font-semibold text-white">confianza</span>.
                        </p>
                    </div>

                    {/* Happy New Year Message */}
                    <div
                        className="mb-5 rounded-xl p-3 text-center"
                        style={{
                            background: "rgba(59, 0, 255, 0.15)",
                            border: "1px solid rgba(144, 255, 0, 0.3)",
                        }}
                    >
                        <p className="text-lg font-bold text-white md:text-xl">
                            🎉✨ ¡Feliz Fin de Año y Próspero 2026! ✨🎉
                        </p>
                        <p className="mt-1 text-sm text-gray-300">
                            El equipo Saprix te desea lo mejor 🎊🥳
                        </p>
                    </div>

                    {/* WhatsApp Button */}
                    <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-3 rounded-xl py-3 font-bold transition-transform hover:scale-[1.02]"
                        style={{
                            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                        }}
                    >
                        <MessageCircle className="h-5 w-5 text-white" />
                        <span className="text-white text-sm md:text-base">¿Alguna duda? Más información aquí</span>
                    </a>

                    {/* Footer note */}
                    <p className="mt-3 text-center text-xs text-gray-400">
                        Haz clic fuera del popup o en la X para cerrar
                    </p>
                </div>
            </div>
        </div>
    );
}
