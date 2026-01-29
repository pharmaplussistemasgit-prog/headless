'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Clock, Navigation, Search } from 'lucide-react';
import { STORES, Store } from '@/lib/stores-data';

export default function StoresPage() {
    const [selectedStore, setSelectedStore] = useState<Store>(STORES[0]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStores = STORES.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">

            {/* SIDEBAR LIST */}
            <div className="w-full md:w-1/3 lg:w-[400px] bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-xl">

                {/* Header Sidebar */}
                <div className="p-6 border-b border-gray-100 bg-white">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Nuestras Tiendas</h1>
                    <p className="text-sm text-gray-500 mb-4">Encuentra tu punto PharmaPlus más cercano</p>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por ciudad o dirección..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-pharma-blue)] focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {filteredStores.length > 0 ? (
                        filteredStores.map((store) => (
                            <div
                                key={store.id}
                                onClick={() => setSelectedStore(store)}
                                className={`
                                    p-4 rounded-xl border cursor-pointer transition-all duration-200 group relative overflow-hidden
                                    ${selectedStore.id === store.id
                                        ? 'bg-blue-50 border-[var(--color-pharma-blue)] ring-1 ring-[var(--color-pharma-blue)]'
                                        : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold ${selectedStore.id === store.id ? 'text-[var(--color-pharma-blue)]' : 'text-gray-900'}`}>
                                        {store.name}
                                    </h3>
                                    {selectedStore.id === store.id && (
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-pharma-blue)] animate-pulse" />
                                    )}
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                                        <span>{store.address}, {store.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Navigation className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                        <span>2.5 km</span> {/* Placeholder distance logic */}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className={`w-4 h-4 flex-shrink-0 ${selectedStore.id === store.id ? 'text-green-600' : 'text-green-500'}`} />
                                        <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded-full">Abierto ahora</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No encontramos tiendas con esa búsqueda</p>
                        </div>
                    )}
                </div>

                {/* Footer Sidebar (Selected Store Actions) */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <button className="w-full bg-[var(--color-pharma-blue)] text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2">
                        <Navigation className="w-5 h-5" />
                        Cómo llegar
                    </button>
                    <div className="mt-3 flex gap-3 text-sm justify-center text-gray-500">
                        <button className="hover:text-[var(--color-pharma-blue)] flex items-center gap-1">
                            <Phone className="w-4 h-4" /> Llamar
                        </button>
                    </div>
                </div>
            </div>

            {/* MAP SECTION */}
            <div className="flex-1 relative bg-gray-200">
                <iframe
                    src={selectedStore.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                />

                {/* Floating Store Card on Mobile (Hidden on Desktop) */}
                <div className="md:hidden absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <h3 className="font-bold text-gray-900">{selectedStore.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{selectedStore.address}</p>
                    <div className="flex gap-2">
                        <button className="flex-1 bg-[var(--color-pharma-blue)] text-white text-sm font-bold py-2 rounded-lg">
                            Cómo llegar
                        </button>
                        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <Phone className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
