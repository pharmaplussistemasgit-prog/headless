'use client';

import { Bell, Info } from 'lucide-react';

export default function NotificationsPage() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-8 h-8 text-[var(--color-pharma-blue)]" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Centro de Notificaciones</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
                Aquí podrás gestionar tus preferencias de contacto y ver el historial de alertas enviadas por el Pastillero Virtual y tus pedidos.
            </p>

            <div className="bg-blue-50/50 rounded-xl p-4 max-w-lg mx-auto flex items-start gap-3 text-left">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-blue-900 text-sm">¿Cómo funcionan las alertas?</h4>
                    <p className="text-xs text-blue-700 mt-1">
                        Actualmente, las notificaciones de recordatorios se envían directamente por SMS a tu celular registrado en la sección de Pastillero. Pronto podrás ver un historial aquí.
                    </p>
                </div>
            </div>
        </div>
    );
}
