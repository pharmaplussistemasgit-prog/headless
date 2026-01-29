"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Clock, Search, Loader2 } from "lucide-react";
import Image from "next/image";
import { searchProducts } from "@/app/actions/products";
import { scheduleSMSReminder } from "@/lib/sms";

interface AddMedicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function AddMedicationModal({ isOpen, onClose, onSave }: AddMedicationModalProps) {
    const [step, setStep] = useState(1); // 1: Info, 2: Schedule
    const [formData, setFormData] = useState({
        productName: "",
        productImage: "",
        frequency: "Todos los días",
        dosage: "",
        times: ["08:00"],
        quantity: "",
        startDate: new Date().toISOString().split('T')[0],
        notify: true
    });

    // Search State
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setQuery("");
            setResults([]);
        }
    }, [isOpen]);

    // Handle Search Debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 3) {
                setIsSearching(true);
                setShowResults(true);
                try {
                    const products = await searchProducts(query);
                    setResults(products);
                } catch (error) {
                    console.error("Error searching:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside search results
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectProduct = (product: any) => {
        setFormData(prev => ({
            ...prev,
            productName: product.name,
            productImage: product.images[0] || ""
        }));
        setQuery(product.name);
        setShowResults(false);
    };

    if (!isOpen) return null;

    const handleSave = () => {
        // Fallback if user typed manually without selecting
        const finalName = formData.productName || query;
        if (!finalName) return;

        const payload = { ...formData, productName: finalName };
        onSave(payload);

        // T20: Simulate SMS Scheduling
        if (payload.notify) {
            scheduleSMSReminder(payload);
        }

        onClose();
        setStep(1); // Reset
        setQuery("");
    };

    const addTime = () => {
        setFormData(prev => ({ ...prev, times: [...prev.times, "12:00"] }));
    };

    const updateTime = (index: number, val: string) => {
        const newTimes = [...formData.times];
        newTimes[index] = val;
        setFormData(prev => ({ ...prev, times: newTimes }));
    };

    const removeTime = (index: number) => {
        if (formData.times.length === 1) return;
        setFormData(prev => ({ ...prev, times: prev.times.filter((_, i) => i !== index) }));
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* Left Panel: Basic Info */}
                <div className={`p-8 bg-white flex-1 overflow-y-auto ${step === 2 ? 'hidden md:block opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex justify-between items-center mb-6 md:hidden">
                        <h2 className="text-xl font-bold text-[var(--color-pharma-green)]">Agregar Medicamento</h2>
                        <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
                    </div>

                    <div className="bg-[var(--color-pharma-green)] text-white px-6 py-2 rounded-full text-center font-bold mb-8 hidden md:block">
                        Agregar medicamento
                    </div>

                    <div className="space-y-6">
                        {/* SEARCH INPUT */}
                        <div className="relative" ref={searchRef}>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Información del producto</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Agrega el nombre del producto"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-pharma-green)] focus:ring-0 outline-none transition-all placeholder:text-gray-400 font-medium"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setFormData(prev => ({ ...prev, productName: e.target.value }));
                                    }}
                                    onFocus={() => {
                                        if (query.length >= 3) setShowResults(true);
                                    }}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                </div>
                                {query && (
                                    <button
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => { setQuery(""); setFormData(prev => ({ ...prev, productName: "" })); }}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {showResults && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                    {results.length > 0 ? (
                                        results.map((product) => (
                                            <div
                                                key={product.id}
                                                onClick={() => handleSelectProduct(product)}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                                            >
                                                <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex-shrink-0 relative p-1">
                                                    <Image
                                                        src={product.images[0] || '/placeholder.png'}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                                                    <p className="text-xs text-[var(--color-pharma-green)] font-bold">
                                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        !isSearching && (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                No encontramos productos.
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">¿Con qué frecuencia que debes tomarla?</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-pharma-green)] focus:border-transparent outline-none transition-all bg-white"
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                            >
                                <option>Todos los días</option>
                                <option>Día de por medio</option>
                                <option>Solo cuándo lo necesite</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Dosis</label>
                            <input
                                type="text"
                                placeholder="Ej: 1 tableta, 5ml"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-pharma-green)] focus:border-transparent outline-none transition-all"
                                value={formData.dosage}
                                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">¿Cuántas veces al día?</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-pharma-green)] focus:border-transparent outline-none transition-all bg-white"
                                onChange={(e) => {
                                    const count = parseInt(e.target.value);
                                    setFormData(prev => ({
                                        ...prev,
                                        times: Array(count).fill("08:00")
                                    }));
                                }}
                            >
                                <option value="1">1 vez</option>
                                <option value="2">2 veces</option>
                                <option value="3">3 veces</option>
                                <option value="4">4 veces</option>
                            </select>
                        </div>

                        {/* Times Input for Step 1 on Mobile */}
                        <div className="space-y-3">
                            {formData.times.map((t, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <span className="text-sm font-medium w-16 text-gray-500">Hora {i + 1}</span>
                                    <div className="relative flex-1">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="time"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-green)] focus:ring-0"
                                            value={t}
                                            onChange={(e) => updateTime(i, e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className="md:hidden w-full mt-8 bg-[var(--color-pharma-green)] text-white font-bold py-4 rounded-xl shadow-lg"
                        onClick={() => setStep(2)}
                    >
                        Siguiente
                    </button>
                </div>

                {/* Right Panel: Quantity & Save */}
                <div className={`p-8 bg-gray-50 flex-1 overflow-y-auto ${step === 1 ? 'hidden md:block' : ''}`}>
                    <div className="flex justify-between items-center mb-6 md:hidden">
                        <h2 className="text-xl font-bold text-[var(--color-pharma-green)]">Detalles Finales</h2>
                        <button onClick={() => setStep(1)} className="text-sm text-gray-500 underline">Atrás</button>
                    </div>

                    <div className="bg-[var(--color-pharma-green)] text-white px-6 py-2 rounded-full text-center font-bold mb-8 hidden md:block">
                        Cantidad medicamento
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">¿Cuánto medicamento tienes?</label>
                            <input
                                type="number"
                                placeholder="Escribe la cantidad (tabletas/ml)"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-pharma-green)] focus:border-transparent outline-none transition-all"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Duración del medicamento</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-pharma-green)] focus:border-transparent"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Avísame cuando se estén acabando</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="low_stock"
                                        className="w-5 h-5 text-[var(--color-pharma-green)] focus:ring-[var(--color-pharma-green)]"
                                        checked={true}
                                        readOnly
                                    />
                                    <span className="text-gray-700">Si</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="low_stock"
                                        className="w-5 h-5 text-[var(--color-pharma-green)] focus:ring-[var(--color-pharma-green)]"
                                        checked={false}
                                        readOnly
                                    />
                                    <span className="text-gray-700">No</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">¿Con qué cantidad de medicamento deseas que te avisemos?</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white">
                                <option>5 unidades</option>
                                <option>10 unidades</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="hidden md:block px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="w-full md:w-auto px-8 py-3 rounded-xl bg-[var(--color-pharma-green)] text-white font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:-translate-y-0.5 transition-all"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
