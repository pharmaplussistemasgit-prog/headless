
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, Loader2, ShoppingBag, ArrowRight, Phone } from 'lucide-react';

/**
 * /checkout/resultado
 *
 * Handles return from Wompi (?id=...) and Credibanco (?ref=...)
 */

type TransactionStatus = 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';

interface PaymentResult {
    status: TransactionStatus;
    id: string; // Transaction ID
    reference: string; // Order Reference
    amount: number;
    currency: string;
    method: string;
    date?: string;
}

function ResultadoContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Wompi
    const wompiId = searchParams.get('id');
    // Credibanco (We use 'ref' for order number)
    const credibancoRef = searchParams.get('ref');
    // Manual Methods (cod, bacs)
    const methodParam = searchParams.get('method');
    const orderIdParam = searchParams.get('id');

    const [result, setResult] = useState<PaymentResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Handle Manual Methods
        if (methodParam === 'cod' || methodParam === 'bacs') {
            setTimeout(() => {
                setResult({
                    status: 'APPROVED', // We treat them as approved/confirmed orders for display purposes
                    id: orderIdParam || 'N/A',
                    reference: orderIdParam || 'N/A',
                    amount: 0, // We might not have amount here, but it's optional for these screens
                    currency: 'COP',
                    method: methodParam,
                    date: new Date().toISOString()
                });
                setLoading(false);
            }, 1000);
            return;
        }

        const fetchWompi = async () => {
            try {
                const isProduction = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.startsWith('pub_prod');
                const baseUrl = isProduction
                    ? 'https://production.wompi.co/v1'
                    : 'https://sandbox.wompi.co/v1';

                const res = await fetch(`${baseUrl}/transactions/${wompiId}`);
                const data = await res.json();

                if (data.error) throw new Error(data.error.type);

                const t = data.data;
                setResult({
                    status: t.status,
                    id: t.id,
                    reference: t.reference,
                    amount: t.amount_in_cents / 100,
                    currency: t.currency,
                    method: t.payment_method_type,
                    date: t.created_at
                });

            } catch (err) {
                console.error(err);
                setError('No se pudo verificar el estado del pago Wompi');
            } finally {
                setLoading(false);
            }
        };

        const fetchCredibanco = async () => {
            try {
                // Call our own API to check status
                const res = await fetch('/api/checkout/credibanco/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderNumber: credibancoRef })
                });

                const data = await res.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                // data.status is APPROVED, DECLINED, PENDING
                // data.raw contains Credibanco details
                const raw = data.raw || {};

                setResult({
                    status: data.status as TransactionStatus,
                    id: raw.orderId || credibancoRef!, // Credibanco ID
                    reference: credibancoRef!, // Order Number
                    amount: raw.amount ? Number(raw.amount) / 100 : 0, // Credibanco returns cents? Manual says amount is string.
                    currency: 'COP',
                    method: 'Credibanco',
                    date: new Date().toISOString()
                });

            } catch (err: any) {
                console.error(err);
                setError(err.message || 'No se pudo verificar el estado de Credibanco');
            } finally {
                setLoading(false);
            }
        };

        if (wompiId) {
            fetchWompi();
        } else if (credibancoRef) {
            fetchCredibanco();
        } else {
            setError('No se encontró referencia de pago válida.');
            setLoading(false);
        }
    }, [wompiId, credibancoRef]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 size={48} className="animate-spin text-[var(--color-pharma-blue)] mx-auto" />
                    <p className="text-gray-600 font-medium">Verificando tu pago...</p>
                    <p className="text-sm text-gray-400">Por favor espera un momento</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
                    <XCircle size={56} className="text-red-400 mx-auto" />
                    <h1 className="text-2xl font-bold text-gray-800">Error de verificación</h1>
                    <p className="text-gray-500">{error || 'No se encontró información del pago'}</p>
                    <Link
                        href="/checkout"
                        className="inline-flex items-center gap-2 bg-[var(--color-pharma-blue)] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Volver al checkout
                    </Link>
                </div>
            </div>
        );
    }

    const { status, amount, method, reference, id } = result;

    const formattedAmount = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(amount);

    const paymentMethodLabels: Record<string, string> = {
        CARD: 'Tarjeta de crédito/débito',
        PSE: 'PSE - Débito bancario',
        NEQUI: 'Nequi',
        BANCOLOMBIA_TRANSFER: 'Bancolombia',
        EFECTY: 'Efecty',
        Credibanco: 'Tarjeta Crédito/Débito (Credibanco)',
    };
    const paymentLabel = paymentMethodLabels[method] || method;

    // ---- PAGO CONTRA ENTREGA ----
    if (method === 'cod') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-200 ring-offset-2 animate-[pulse_2s_ease-in-out_once]">
                        <ShoppingBag size={44} className="text-green-600" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">¡Pedido Confirmado!</h1>
                        <p className="text-gray-500">Tu pedido ha sido creado exitosamente.</p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-5 text-left border border-green-100">
                        <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                            <CheckCircle size={16} />
                            Instrucciones
                        </h4>
                        <p className="text-sm text-green-700">
                            Recuerda tener el efectivo listo o un medio de pago habilitado (si aplica datafono) al momento de recibir tu pedido.
                        </p>
                        <div className="mt-4 pt-3 border-t border-green-200 flex justify-between text-sm">
                            <span className="font-semibold text-green-800">Total a Pagar:</span>
                            {/* We don't have amount here easily without fetching, use generic or passed param if available */}
                            <span className="font-bold text-green-800">Contra Entrega</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/" className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-center">
                            Ir al inicio
                        </Link>
                        <Link href="/mi-cuenta/pedidos" className="flex-1 py-3 bg-[var(--color-pharma-blue)] text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                            Ver mis pedidos <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ---- TRANSFERENCIA BANCARIA ----
    if (method === 'bacs') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto ring-4 ring-blue-200 ring-offset-2">
                        <Clock size={44} className="text-blue-600" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">¡Pedido Recibido!</h1>
                        <p className="text-gray-500">Tu pedido está en espera de pago.</p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-5 text-left border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <Loader2 size={16} />
                            Instrucciones para Transferir
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 mb-3 text-xs text-blue-900">
                            <li><strong>Bancolombia Ahorros:</strong> 031-000000-00</li>
                            <li><strong>Nequi / Daviplata:</strong> 300-123-4567</li>
                        </ul>
                        <p className="text-xs text-blue-700 mt-2">
                            Envía tu comprobante a nuestro WhatsApp indicando el pedido <strong>#{reference}</strong>.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href={`https://wa.me/573001234567?text=Hola,%20envio%20comprobante%20para%20pedido%20${reference}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Phone size={16} />
                            Enviar Comprobante
                        </a>
                        <Link href="/mi-cuenta/pedidos" className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-center">
                            Mis Pedidos
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ---- APROBADO (WOMPI/CREDIBANCO) ----
    if (status === 'APPROVED') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-6">
                    {/* Ícono animado */}
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-200 ring-offset-2 animate-[pulse_2s_ease-in-out_once]">
                        <CheckCircle size={44} className="text-green-500" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">¡Pago exitoso!</h1>
                        <p className="text-gray-500">Tu pedido ha sido confirmado</p>
                    </div>

                    {/* Detalles */}
                    <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Referencia</span>
                            <span className="font-mono font-semibold text-gray-800">{reference}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Método de pago</span>
                            <span className="font-medium text-gray-800">{paymentLabel}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">ID Transacción</span>
                            <span className="font-mono text-xs text-gray-600">{id}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between">
                            <span className="font-semibold text-gray-700">Total pagado</span>
                            <span className="font-bold text-xl text-green-600">{formattedAmount}</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500">
                        Recibirás un correo de confirmación con los detalles de tu pedido. <br />
                        ¿Tienes dudas?{' '}
                        <a href="https://wa.me/573001234567" className="text-[var(--color-pharma-blue)] hover:underline font-medium">
                            Contáctanos por WhatsApp
                        </a>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/"
                            className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
                        >
                            Ir al inicio
                        </Link>
                        <Link
                            href="/mi-cuenta/pedidos"
                            className="flex-1 py-3 bg-[var(--color-pharma-blue)] text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            Ver mis pedidos
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ---- PENDIENTE ----
    if (status === 'PENDING') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50 px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto ring-4 ring-yellow-200">
                        <Clock size={44} className="text-yellow-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">Pago en proceso</h1>
                        <p className="text-gray-500">Tu pago está siendo verificado por el banco</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                        <p className="text-sm text-yellow-800">
                            Esto puede tomar algunos minutos. Recibirás una confirmación por correo electrónico en cuanto se apruebe.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/" className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-center">
                            Ir al inicio
                        </Link>
                        <Link href="/mi-cuenta/pedidos" className="flex-1 py-3 bg-[var(--color-pharma-blue)] text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                            Ver mis pedidos <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ---- RECHAZADO / ERROR ----
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-200">
                    <XCircle size={44} className="text-red-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">Pago rechazado</h1>
                    <p className="text-gray-500">No fue posible procesar tu pago</p>
                </div>
                <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                    <p className="text-sm text-red-700">
                        Por favor verifica los datos de tu tarjeta o intenta con otro método de pago. Si el problema persiste, comunícate con nosotros.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/checkout"
                        className="flex-1 py-3 bg-[var(--color-pharma-green)] text-white rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                        <ShoppingBag size={16} />
                        Intentar de nuevo
                    </Link>
                    <a
                        href="https://wa.me/573001234567"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Phone size={16} />
                        Soporte
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function ResultadoPagoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={40} className="animate-spin text-[var(--color-pharma-blue)]" />
            </div>
        }>
            <ResultadoContent />
        </Suspense>
    );
}
