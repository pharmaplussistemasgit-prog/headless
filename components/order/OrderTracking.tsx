'use client';

import { Truck, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrderTrackingProps {
    company: string;
    trackingNumber: string;
}

const CARRIER_LINKS: Record<string, string> = {
    'coordinadora': 'https://coordinadora.com/rastreo/rastreo-de-guia/',
    'servientrega': 'https://www.servientrega.com/wps/portal/rastreo-envio',
    'interrapidisimo': 'https://interrapidisimo.com/sigue-tu-envio/',
    'envia': 'https://envia.co/',
    'liberty': 'https://iqpack.libertyexpress.com/SearchGuide?hreflang=es-co',
    '4-72': 'https://www.4-72.com.co/',
    'fedex': 'https://www.fedex.com/es-co/home.html',
    'mensajeros': 'https://mensajerosurbanos.com/',
    'deprisa': 'https://www.deprisa.com/rastreo',
    'tcc': 'https://tcc.com.co/rastreo/',
};

export default function OrderTracking({ company, trackingNumber }: OrderTrackingProps) {
    const [copied, setCopied] = useState(false);

    if (!company || !trackingNumber) return null;

    const normalizeCarrier = (name: string) => {
        const lower = name.toLowerCase();
        for (const key of Object.keys(CARRIER_LINKS)) {
            if (lower.includes(key)) return CARRIER_LINKS[key];
        }
        return null;
    };

    const trackingUrl = normalizeCarrier(company);

    const handleCopy = () => {
        navigator.clipboard.writeText(trackingNumber);
        setCopied(true);
        toast.success('Número de guía copiado');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                <Truck className="w-4 h-4 text-[var(--color-pharma-blue)]" />
                Información de Envío
            </h4>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                        {company}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-gray-900 text-lg">
                            {trackingNumber}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="text-gray-400 hover:text-[var(--color-pharma-blue)] transition-colors p-1"
                            title="Copiar guía"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                {trackingUrl && (
                    <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-white text-[var(--color-pharma-blue)] border border-blue-200 hover:border-[var(--color-pharma-blue)] px-4 py-2 rounded-md transition-all text-sm font-bold shadow-sm hover:shadow-md"
                    >
                        Rastrear Pedido
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}
            </div>
        </div>
    );
}
