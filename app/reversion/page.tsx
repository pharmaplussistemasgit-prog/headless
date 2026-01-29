import type { Metadata } from 'next';
import { ShieldCheck, ArrowLeft, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Reversión de Pagos | PharmaPlus',
    description: 'Solicitud de reversión de pagos conforme a la ley.',
};

export default function ReversionPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <Link href="/mi-cuenta" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Mi Cuenta
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-[var(--color-pharma-blue)] p-8 text-center text-white">
                        <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-90" />
                        <h1 className="text-3xl font-bold mb-2">Solicitud de Reversión de Pago</h1>
                        <p className="text-blue-100">
                            Conforme al Artículo 51 de la Ley 1480 de 2011 (Estatuto del Consumidor)
                        </p>
                    </div>

                    <div className="p-8 space-y-6 text-gray-600">
                        <p>
                            Si realizaste una compra por medio electrónico (Tarjeta de Crédito, Débito, PSE), puedes solicitar la reversión del pago si te encuentras en alguna de las siguientes causales:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Fuiste objeto de fraude.</li>
                            <li>Fue una operación no solicitada.</li>
                            <li>El producto adquirido no fue recibido.</li>
                            <li>El producto entregado no corresponde a lo solicitado o es defectuoso.</li>
                        </ul>

                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 mt-6">
                            <h3 className="font-bold text-yellow-800 mb-2">¿Cómo solicitarla?</h3>
                            <p className="text-sm text-yellow-700 mb-4">
                                Debes presentar tu solicitud ante PharmaPlus dentro de los cinco (5) días hábiles siguientes a la fecha en que tuviste noticia de la causal.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="mailto:atencionalusuario@pharmaplus.com.co" className="flex items-center gap-2 text-sm font-bold text-yellow-900 hover:underline">
                                    <Mail className="w-4 h-4" />
                                    Enviar Correo de Solicitud
                                </a>
                                <a href="tel:6015934005" className="flex items-center gap-2 text-sm font-bold text-yellow-900 hover:underline">
                                    <Phone className="w-4 h-4" />
                                    Llamar a Servicio al Cliente
                                </a>
                            </div>
                        </div>

                        <p className="text-sm italic text-gray-400">
                            * Recuerda que también debes notificar al emisor de tu instrumento de pago (Banco) sobre esta solicitud.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
