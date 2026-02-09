'use client';

import React from 'react';
import { Truck, MapPin } from 'lucide-react';
import ShippingCalculator from '@/components/shipping/ShippingCalculator';
import { COLOMBIA_STATES } from '@/lib/colombia-data';

export default function ShippingQuotePage() {
    const [selectedState, setSelectedState] = React.useState('');
    const [city, setCity] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [result, setResult] = React.useState<{ cost: number, days: number } | null>(null);
    const [availableCities, setAvailableCities] = React.useState<{ code: string, name: string }[]>([]);

    // Load cities when state changes (Reused from Checkout logic)
    React.useEffect(() => {
        setCity('');
        setResult(null);
        if (!selectedState) {
            setAvailableCities([]);
            return;
        }
        // Mock load or fetch
        // For simplicity and speed, let's use the API if it accepts stateCode to list cities?
        // CheckoutForm uses: `/api/shipping/cities?stateCode=${selectedState}`
        fetch(`/api/shipping/cities?stateCode=${selectedState}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setAvailableCities(data.data);
            })
            .catch(err => console.error(err));
    }, [selectedState]);

    const handleCalculate = async () => {
        if (!selectedState || !city) return;
        setLoading(true);
        try {
            // Find city code
            const cityObj = availableCities.find(c => c.name === city);
            const stateObj = COLOMBIA_STATES.find(s => s.code === selectedState);

            const response = await fetch('/api/shipping/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cityCode: cityObj?.code || '',
                    cityName: city,
                    stateName: stateObj?.name || ''
                })
            });

            const data = await response.json();
            if (data.success) {
                setResult({
                    cost: data.data.shippingCost,
                    days: data.data.deliveryDays
                });
            } else {
                alert("No pudimos cotizar el envío para esta ubicación.");
            }
        } catch (error) {
            console.error(error);
            alert("Error al calcular el envío.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white py-12 px-4 shadow-sm">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-[var(--color-pharma-blue)] mb-2 flex items-center justify-center gap-3">
                        <Truck className="w-8 h-8" />
                        Cotizador de Envíos
                    </h1>
                    <p className="text-gray-500">Consulta el valor y tiempo de entrega de tu pedido.</p>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Departamento</label>
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[var(--color-pharma-blue)]"
                            >
                                <option value="">-- Seleccionar --</option>
                                {COLOMBIA_STATES.map(s => (
                                    <option key={s.code} value={s.code}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ciudad</label>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                disabled={!selectedState}
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[var(--color-pharma-blue)] disabled:bg-gray-50 disabled:text-gray-400"
                            >
                                <option value="">-- Seleccionar --</option>
                                {availableCities.map(c => (
                                    <option key={c.code} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={!city || loading}
                            className="w-full py-3 bg-[var(--color-pharma-blue)] text-white font-bold rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-70"
                        >
                            {loading ? 'Consultando...' : 'Cotizar Envío'}
                        </button>
                    </div>

                    {result && (
                        <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div>
                                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Costo de Envío</p>
                                    <p className="text-2xl font-bold text-[var(--color-pharma-blue)]">
                                        ${result.cost.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Tiempo Estimado</p>
                                    <p className="text-lg font-bold text-gray-700">
                                        {result.days} {result.days === 1 ? 'Día' : 'Días'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 text-center mt-4">
                                * Los tiempos de entrega son hábiles y pueden variar según la disponibilidad.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
