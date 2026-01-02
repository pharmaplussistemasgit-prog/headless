'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export default function QuickSearch() {
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (category || brand) {
            const params = new URLSearchParams();
            if (category) params.set('category', category);
            if (brand) params.set('brand', brand);
            window.location.href = `/tienda?${params.toString()}`;
        }
    };

    return (
        <section className="w-full bg-[#f8f9fa] py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-full shadow-lg border border-gray-100 p-2 flex flex-col md:flex-row items-center">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center w-full gap-2">

                        <div className="flex-1 w-full px-6 flex items-center border-b md:border-b-0 md:border-r border-gray-100 h-10">
                            <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                            <div className="relative w-full">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-transparent text-sm text-gray-600 outline-none appearance-none cursor-pointer py-2"
                                >
                                    <option value="">Buscar por Categoría</option>
                                    <option value="medicamentos">Medicamentos</option>
                                    <option value="dermocosmetica">Dermocosmética</option>
                                    <option value="cuidado-personal">Cuidado Personal</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 w-full px-6 flex items-center h-10">
                            <div className="relative w-full">
                                <select
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="w-full bg-transparent text-sm text-gray-600 outline-none appearance-none cursor-pointer py-2"
                                >
                                    <option value="">Filtrar por Marca</option>
                                    <option value="la-roche-posay">La Roche-Posay</option>
                                    <option value="vichy">Vichy</option>
                                    <option value="eucerin">Eucerin</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full md:w-auto bg-[var(--color-pharma-green)] hover:opacity-90 text-white font-bold text-sm px-8 py-2.5 rounded-full transition-all shadow-md active:scale-95"
                        >
                            Buscar
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
