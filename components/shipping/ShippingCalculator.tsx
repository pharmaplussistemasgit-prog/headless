'use client';

import { useState, useMemo } from 'react';
import { Truck, MapPin, Search, PackageCheck } from 'lucide-react';
import { ShippingRule } from '@/lib/shipping';
import { ShippingRate } from '@/lib/shipping-rates';

interface ShippingCalculatorProps {
    rules: ShippingRule[];
    rates: ShippingRate[];
}

export default function ShippingCalculator({ rules, rates = [] }: ShippingCalculatorProps) {
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedCityCode, setSelectedCityCode] = useState('');
    const [resultRate, setResultRate] = useState<ShippingRate | null>(null);

    // 1. Extract Unique States from Rates
    const states = useMemo(() => {
        const uniqueStates = new Map();
        rates.forEach(rate => {
            if (!uniqueStates.has(rate.stateCode)) {
                uniqueStates.set(rate.stateCode, rate.stateName);
            }
        });
        return Array.from(uniqueStates.entries())
            .map(([code, name]) => ({ code, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [rates]);

    // 2. Filter Cities by Selected State
    const availableCities = useMemo(() => {
        if (!selectedStateCode) return [];
        return rates
            .filter(r => r.stateCode === selectedStateCode)
            .sort((a, b) => a.cityName.localeCompare(b.cityName));
    }, [rates, selectedStateCode]);

    const handleCalculate = (cityCode: string) => {
        setSelectedCityCode(cityCode);
        const rate = rates.find(r => r.cityCode === cityCode) || null;
        setResultRate(rate);
    };

    const fmt = new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    });

    return (
        <div className="w-full h-full bg-gradient-to-br from-[#F5F7FA] to-[#E4E9F2]">
            {/* Background Decorativo */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-purple-400/20 rounded-full blur-[80px]"></div>
            </div>

            <div className="relative z-10 p-6 flex flex-col h-full">

                {/* Header Fintech Style */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Cotizador</p>
                        <h3 className="text-2xl font-bold text-gray-800">Envíos</h3>
                    </div>
                    <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-[#0033A0]">
                        <Truck size={20} />
                    </div>
                </div>

                {/* Card Principal Glassmorphism */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl rounded-[2rem] p-6 flex-1 flex flex-col">

                    {/* Inputs Group */}
                    <div className="space-y-4 mb-8">
                        {/* Selector Departamento */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">DEPARTAMENTO</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin className="text-gray-400 group-focus-within:text-[#0033A0] transition-colors" size={18} />
                                </div>
                                <select
                                    value={selectedStateCode}
                                    onChange={(e) => {
                                        setSelectedStateCode(e.target.value);
                                        setSelectedCityCode('');
                                        setResultRate(null);
                                    }}
                                    className="block w-full pl-11 pr-10 py-4 text-sm font-semibold text-gray-700 bg-white border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0033A0] focus:bg-white/80 transition-all outline-none appearance-none cursor-pointer shadow-sm"
                                >
                                    <option value="">Seleccionar...</option>
                                    {states.map(st => (
                                        <option key={st.code} value={st.code}>{st.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Selector Ciudad (Dinámico) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">CIUDAD</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="text-gray-400 group-focus-within:text-[#0033A0] transition-colors" size={18} />
                                </div>
                                <select
                                    value={selectedCityCode}
                                    onChange={(e) => handleCalculate(e.target.value)}
                                    disabled={!selectedStateCode}
                                    className="block w-full pl-11 pr-10 py-4 text-sm font-semibold text-gray-700 bg-white border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0033A0] focus:bg-white/80 transition-all outline-none appearance-none cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {!selectedStateCode ? 'Selecciona Dpto primero' : 'Seleccionar Ciudad...'}
                                    </option>
                                    {availableCities.map((city) => (
                                        <option key={city.cityCode} value={city.cityCode}>{city.cityName}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resultados Widget */}
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-400 mb-4 ml-1 uppercase tracking-wider">
                            Resultados Estimados
                        </label>

                        {!selectedCityCode || !resultRate ? (
                            <div className="h-32 flex flex-col items-center justify-center text-center p-4 rounded-3xl border-2 border-dashed border-gray-200/60 bg-white/30">
                                <p className="text-sm text-gray-400 font-medium">Selecciona un destino para calcular</p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative bg-white rounded-3xl p-5 shadow-lg shadow-blue-900/5 hover:scale-[1.02] transition-transform duration-300 border border-gray-50">
                                    {/* Gradient Accent */}
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-[4rem] rounded-tr-3xl -z-0"></div>

                                    <div className="relative z-10 flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="bg-blue-50 text-[#0033A0] p-1.5 rounded-lg">
                                                    <PackageCheck size={16} />
                                                </div>
                                                <p className="font-bold text-gray-800 text-sm">Envío Estándar</p>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium ml-1">
                                                Tiempo estimado: {resultRate.deliveryDays} {resultRate.deliveryDays === 1 ? 'día' : 'días'} hábiles
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {resultRate.shippingCost === 0 ? (
                                                <span className="inline-block px-3 py-1 bg-green-100/80 text-green-700 text-xs font-bold rounded-full backdrop-blur-sm">
                                                    Gratis
                                                </span>
                                            ) : (
                                                <span className="block text-xl font-black text-gray-900 tracking-tight">
                                                    {fmt.format(resultRate.shippingCost)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
