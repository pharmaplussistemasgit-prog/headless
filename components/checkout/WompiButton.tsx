'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';

/**
 * WompiButton – Componente de pago con Widget oficial de Wompi.
 *
 * Flujo:
 * 1. Recibe los datos del checkout (monto, referencia, cliente).
 * 2. Llama al servidor para obtener la firma SHA-256.
 * 3. Carga el script de Wompi dinámicamente y abre el widget.
 * 4. Cuando el usuario termina, llama a onSuccess/onError con el resultado.
 */

declare global {
    interface Window {
        WidgetCheckout: any;
    }
}

interface WompiButtonProps {
    /** Monto total en pesos COP (se multiplica x100 internamente) */
    amountCOP: number;
    /** Referencia única de la orden (ej: "ORD-12345") */
    reference: string;
    /** Datos del cliente para prellenar el widget */
    customerData?: {
        email?: string;
        fullName?: string;
        phoneNumber?: string;
        legalId?: string;
        legalIdType?: 'CC' | 'CE' | 'NIT' | 'PP' | 'TI';
    };
    /** Dirección de envío para prellenar */
    shippingAddress?: {
        addressLine1?: string;
        city?: string;
        region?: string;
        phoneNumber?: string;
    };
    /** URL de redirección tras pago completado */
    redirectUrl?: string;
    /** Callback cuando se completa la transacción (cualquier estado) */
    onResult?: (transaction: any) => void;
    /** Si el formulario está listo (validaciones OK) */
    disabled?: boolean;
}

const WOMPI_SCRIPT_SRC = 'https://checkout.wompi.co/widget.js';

export default function WompiButton({
    amountCOP,
    reference,
    customerData,
    shippingAddress,
    redirectUrl,
    onResult,
    disabled = false,
}: WompiButtonProps) {
    const [isLoadingSignature, setIsLoadingSignature] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scriptLoadedRef = useRef(false);

    // Pre-cargar el script de Wompi cuando el componente monta
    useEffect(() => {
        if (scriptLoadedRef.current) return;
        if (document.querySelector(`script[src="${WOMPI_SCRIPT_SRC}"]`)) {
            scriptLoadedRef.current = true;
            return;
        }

        const script = document.createElement('script');
        script.src = WOMPI_SCRIPT_SRC;
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => {
            scriptLoadedRef.current = true;
            console.log('✅ Wompi Widget script cargado');
        };
        script.onerror = () => {
            console.error('❌ Error cargando script de Wompi');
            setError('No se pudo cargar el sistema de pagos. Recarga la página.');
        };
        document.head.appendChild(script);
    }, []);

    const handlePay = async () => {
        if (disabled) return;

        setError(null);
        setIsLoadingSignature(true);

        try {
            const amountInCents = Math.round(amountCOP * 100);

            // 1. Obtener firma de integridad desde el servidor
            const sigRes = await fetch('/api/checkout/wompi-signature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference,
                    amountInCents,
                    currency: 'COP',
                }),
            });

            if (!sigRes.ok) {
                throw new Error('No se pudo generar la firma de pago');
            }

            const { signature } = await sigRes.json();
            const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;

            if (!publicKey || publicKey.includes('your_key')) {
                throw new Error('La llave pública de Wompi no está configurada');
            }

            // 2. Verificar que el script esté cargado
            if (!window.WidgetCheckout) {
                throw new Error('El widget de pago aún se está cargando. Intenta de nuevo.');
            }

            // 3. Inicializar y abrir el Widget de Wompi
            const checkout = new window.WidgetCheckout({
                currency: 'COP',
                amountInCents: amountInCents,
                reference: reference,
                publicKey: publicKey,
                signature: { integrity: signature },
                redirectUrl: redirectUrl,
                customerData: customerData
                    ? {
                        email: customerData.email,
                        fullName: customerData.fullName,
                        phoneNumber: customerData.phoneNumber,
                        phoneNumberPrefix: '+57',
                        legalId: customerData.legalId,
                        legalIdType: customerData.legalIdType || 'CC',
                    }
                    : undefined,
                shippingAddress: shippingAddress
                    ? {
                        addressLine1: shippingAddress.addressLine1,
                        city: shippingAddress.city,
                        region: shippingAddress.region,
                        phoneNumber: shippingAddress.phoneNumber,
                        country: 'CO',
                    }
                    : undefined,
            });

            checkout.open((result: any) => {
                const transaction = result?.transaction;
                console.log('Wompi transaction result:', transaction);

                if (onResult) {
                    onResult(transaction);
                }
            });
        } catch (err: any) {
            console.error('Error abriendo Wompi:', err);
            setError(err.message || 'Ocurrió un error al iniciar el pago');
        } finally {
            setIsLoadingSignature(false);
        }
    };

    return (
        <div className="w-full space-y-2">
            <button
                onClick={handlePay}
                disabled={disabled || isLoadingSignature}
                className={`
                    w-full py-4 rounded-xl font-bold text-base
                    flex items-center justify-center gap-3
                    transition-all duration-200 shadow-md
                    ${disabled
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[var(--color-pharma-green)] hover:bg-green-700 text-white active:scale-[0.98] cursor-pointer'
                    }
                `}
            >
                {isLoadingSignature ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Preparando pago seguro...</span>
                    </>
                ) : (
                    <>
                        <CreditCard size={20} />
                        <span>Pagar con Tarjeta / PSE / Nequi</span>
                    </>
                )}
            </button>

            {/* Métodos de pago aceptados */}
            {!disabled && (
                <div className="flex items-center justify-center gap-3 pt-1">
                    <img src="/images/payments/visa.svg" alt="Visa" className="h-5 opacity-70 hover:opacity-100 transition-opacity" />
                    <img src="/images/payments/mastercard.svg" alt="Mastercard" className="h-5 opacity-70 hover:opacity-100 transition-opacity" />
                    <img src="/images/payments/amex.svg" alt="Amex" className="h-5 opacity-70 hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                        <span className="text-[10px] font-bold text-gray-600">PSE</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#fc0] rounded px-2 py-1">
                        <span className="text-[10px] font-bold text-gray-800">Nequi</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                        <span className="text-[10px] font-bold text-gray-600">Efectivo</span>
                    </div>
                </div>
            )}

            {/* Sello de seguridad */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
                <ShieldCheck size={13} className="text-green-500" />
                <span>Pago 100% seguro · Procesado por</span>
                <span className="font-semibold text-gray-500">Wompi</span>
            </div>

            {/* Error */}
            {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
                    {error}
                </div>
            )}
        </div>
    );
}
