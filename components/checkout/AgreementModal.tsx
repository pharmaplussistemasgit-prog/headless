'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { orbisService, OrbisInitResponse } from '@/lib/orbisfarma';
import { toast } from 'sonner';

interface AgreementModalProps {
    onAuthorized: (data: OrbisInitResponse) => void;
    onCancel: () => void;
}

export default function AgreementModal({ onAuthorized, onCancel }: AgreementModalProps) {
    const [idNumber, setIdNumber] = useState('');
    const [provider, setProvider] = useState<'coopmsd' | 'inicio_tx'>('inicio_tx'); // Default provider
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleValidate = async () => {
        if (!idNumber || idNumber.length < 4) {
            setError('Ingresa un número de documento válido');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log(`Validating ID: ${idNumber} with Provider: ${provider}`);

            // Call our unified proxy
            const response = await fetch('/api/checkout/validate-agreement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    documentId: idNumber
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Convenio ${provider === 'coopmsd' ? 'Coopmsd' : 'Inicio TX'} Validado`);
                // Standardize response for the parent component
                onAuthorized({
                    ...result,
                    provider // Pass back which provider was used
                });
            } else {
                setError(result.message || 'No se encontró convenio activo o cupo disponible.');
            }

        } catch (err: any) {
            console.error(err);
            setError('Error de conexión con el servicio de convenios.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[var(--color-pharma-blue)]">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Validar Convenio</h3>
                        <p className="text-sm text-gray-500">Ingresa tu documento para verificar cupo.</p>
                    </div>
                </div>

                {/* Input */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Selecciona tu Convenio / Fondo
                        </label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value as 'coopmsd' | 'inicio_tx')}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-pharma-blue)] focus:border-transparent outline-none transition-all text-base mb-4 bg-white"
                            disabled={isLoading}
                        >
                            <option value="inicio_tx">Inicio TX (OrbisFarma)</option>
                            <option value="coopmsd">Coopmsd</option>
                        </select>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número de Cédula / Identificación
                        </label>
                        <input
                            type="text"
                            value={idNumber}
                            onChange={(e) => {
                                setIdNumber(e.target.value.replace(/\D/g, ''));
                                setError(null);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                            placeholder="Ej: 1010123456"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-pharma-blue)] focus:border-transparent outline-none transition-all text-lg font-bold text-center tracking-wider"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold transition-colors"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleValidate}
                            disabled={isLoading || !idNumber}
                            className="flex-1 bg-[var(--color-pharma-blue)] hover:bg-[#005a9c] text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Validando...
                                </>
                            ) : (
                                <>
                                    Validar
                                    <CheckCircle2 className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
