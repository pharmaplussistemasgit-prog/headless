import { Check, Clock, Package, Truck, XCircle } from 'lucide-react';

interface OrderTimelineProps {
    status: string;
    dateCreated: string;
    trackingNumber?: string;
}

export default function OrderTimeline({ status, dateCreated, trackingNumber }: OrderTimelineProps) {
    // Mapeo extendido para incluir todos los estados personalizados mencionados
    const steps = [
        { id: 'received', label: 'Recibido', icon: Clock },
        { id: 'preparing', label: 'Alistamiento', icon: Package }, // Facturado, En alistamiento
        { id: 'shipped', label: 'Enviado', icon: Truck },
        { id: 'delivered', label: 'Entregado', icon: Check },
    ];

    // Normalizar estado (slugs típicos de WC o personalizados)
    // Slugs probables: 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'
    // Custom probables: 'entregado', 'en-alistamiento', 'facturado', 'confirmado-en-pagina', 'enviado'
    let currentStepIndex = 0;
    let isCancelled = false;

    const s = (status || '').toLowerCase(); // Ensure status is string

    if (['cancelled', 'refunded', 'failed', 'cancelado', 'reembolsado', 'fallido'].some(x => s.includes(x))) {
        isCancelled = true;
    } else if (['completed', 'entregado', 'wc-entregado'].some(x => s.includes(x))) {
        currentStepIndex = 3; // Estado final
    } else if (['shipped', 'enviado', 'wc-enviado'].some(x => s.includes(x))) {
        currentStepIndex = 2; // Enviado
    } else if (trackingNumber && !['completed', 'entregado', 'wc-entregado'].some(x => s.includes(x))) {
        // Si tiene guía y no está entregado, asumimos enviado como mínimo
        currentStepIndex = 2;
    } else if (['processing', 'en-alistamiento', 'facturado', 'wc-en-alistamiento', 'wc-facturado', 'en proceso'].some(x => s.includes(x))) {
        currentStepIndex = 1; // Alistamiento / Procesando
    } else {
        // Default: Recibido / Pendiente / Confirmado en página
        currentStepIndex = 0;
    }

    if (isCancelled) {
        return (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Pedido Cancelado</span>
            </div>
        );
    }

    return (
        <div className="w-full py-4">
            <div className="relative flex justify-between">
                {/* Linea de fondo */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full -z-10" />

                {/* Linea de progreso */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-[var(--color-pharma-blue)] -translate-y-1/2 rounded-full -z-10 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative">
                            <div
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white z-10
                                    ${isActive
                                        ? 'border-[var(--color-pharma-blue)] text-[var(--color-pharma-blue)]'
                                        : 'border-gray-200 text-gray-300'
                                    }
                                    ${isCurrent ? 'ring-4 ring-blue-50 scale-110' : ''}
                                `}
                            >
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-medium text-center absolute top-10 whitespace-nowrap ${isActive ? 'text-[var(--color-pharma-blue)]' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="h-6"></div> {/* Spacer for text labels */}
        </div>
    );
}
