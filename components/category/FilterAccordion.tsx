'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FilterItem {
    id: string;
    label: string;
    count: number;
    active: boolean;
}

interface FilterAccordionProps {
    title: string;
    items: FilterItem[];
    onToggle: (id: string) => void;
    icon?: React.ReactNode;
    searchable?: boolean;
    initiallyOpen?: boolean;
}

export default function FilterAccordion({
    title,
    items,
    onToggle,
    icon,
    searchable = false,
    initiallyOpen = true
}: FilterAccordionProps) {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    const [searchTerm, setSearchTerm] = useState('');

    const visibleItems = items.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [showAll, setShowAll] = useState(false);
    const DISPLAY_LIMIT = 6;
    const finalItems = (showAll || searchTerm) ? visibleItems : visibleItems.slice(0, DISPLAY_LIMIT);

    return (
        <div className="bg-white overflow-hidden transition-all duration-200">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 px-3 bg-white"
            >
                <div className="flex items-center gap-2 font-black text-[15px] text-[#1e3a8a] uppercase tracking-wide">
                    {icon}
                    <span>{title}</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[var(--pharma-blue)]">
                    {isOpen ? <ChevronUp size={14} strokeWidth={3} /> : <ChevronDown size={14} strokeWidth={3} />}
                </div>
            </button>

            {/* Content */}
            {isOpen && (
                <div className="px-1 pb-4">
                    {/* Internal Search */}
                    {searchable && items.length > 8 && (
                        <div className="relative mb-3 mx-2">
                            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-300" />
                            <input
                                type="text"
                                placeholder={`BUSCAR...`}
                                className="w-full pl-8 pr-3 py-2 text-[10px] font-bold border border-gray-100 rounded-lg focus:border-[var(--pharma-blue)] focus:outline-none bg-gray-50/50 transition-colors uppercase tracking-widest"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Checkbox List */}
                    <div className="space-y-0.5">
                        {finalItems.length > 0 ? (
                            finalItems.map(item => (
                                <label
                                    key={item.id}
                                    className={`
                                        group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all duration-200
                                        ${item.active ? 'bg-blue-50/50' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Circular Indicator (Radio style) */}
                                        <div className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                            ${item.active
                                                ? 'bg-[var(--pharma-blue)] border-[var(--pharma-blue)] shadow-[0_0_8px_rgba(0,80,216,0.2)]'
                                                : 'border-gray-200 bg-white group-hover:border-[var(--pharma-blue)]'}
                                        `}>
                                            {item.active && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                        </div>

                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={item.active}
                                            onChange={() => onToggle(item.id)}
                                        />

                                        <span className={`text-[13px] uppercase truncate tracking-tight transition-colors ${item.active ? 'text-[var(--pharma-blue)] font-bold' : 'text-slate-500 font-normal group-hover:text-slate-800'}`}>
                                            {item.label}
                                        </span>
                                    </div>

                                    <span className="text-xs font-bold text-slate-300 ml-2">
                                        {item.count}
                                    </span>
                                </label>
                            ))
                        ) : (
                            <p className="text-[10px] uppercase font-bold text-slate-300 text-center py-4 bg-gray-50/30 rounded-lg mx-2">
                                Sin resultados
                            </p>
                        )}
                    </div>

                    {/* Show More Button */}
                    {!searchTerm && visibleItems.length > DISPLAY_LIMIT && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="w-full text-center text-[11px] font-black text-[var(--pharma-blue)] mt-3 py-2 bg-blue-50/30 rounded-lg hover:bg-blue-50 transition-all uppercase tracking-tighter"
                        >
                            {showAll ? 'MOSTRAR MENOS' : `VER TODOS (${items.length})`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
