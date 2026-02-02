
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6"
            >
                <CheckCircle className="w-10 h-10" />
            </motion.div>

            <h1 className="text-3xl font-bold text-[var(--color-pharma-blue)] mb-2">¡Gracias por tu compra!</h1>
            <p className="text-gray-500 mb-8 max-w-md">
                Tu pedido ha sido recibido correctamente. Hemos enviado un correo de confirmación con los detalles.
            </p>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm mb-8">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Orden #</p>
                <p className="text-4xl font-bold text-gray-900">{orderId || 'Pendiente'}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-green-600 font-medium bg-green-50 py-2 rounded-lg">
                    <Package size={18} />
                    <span>Preparando tu pedido</span>
                </div>
            </div>

            <div className="flex gap-4">
                <Link href="/" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Home size={18} />
                    Ir al Inicio
                </Link>
                <Link href="/tienda" className="px-6 py-3 rounded-xl bg-[var(--color-pharma-blue)] text-white font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
                    Continuar Comprando
                    <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
