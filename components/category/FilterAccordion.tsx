'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Check } from 'lucide-react';

interface FilterItem {
    id: string; // or name
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

    // Limit items shown initially to avoid massive lists, unless searching
    const [showAll, setShowAll] = useState(false);
    const DISPLAY_LIMIT = 5;
    const finalItems = (showAll || searchTerm) ? visibleItems : visibleItems.slice(0, DISPLAY_LIMIT);

    return (
        <div className="border border-gray-100 rounded-lg bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2 font-outfit font-bold text-sm text-[var(--color-primary-blue)]">
                    {icon}
                    <span>{title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Content */}
            {isOpen && (
                <div className="p-4 pt-2">
                    {/* Internal Search */}
                    {searchable && items.length > 5 && (
                        <div className="relative mb-3">
                            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Buscar ${title.toLowerCase()}...`}
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:border-[var(--color-primary-blue)] focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Checkbox List */}
                    <div className="space-y-1">
                        {finalItems.length > 0 ? (
                            finalItems.map(item => (
                                <label
                                    key={item.id}
                                    className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-gray-50/50 cursor-pointer group transition-colors"
                                >
                                    <div className={`
                                        w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-200
                                        ${item.active
                                            ? 'bg-[var(--color-primary-blue)] border-[var(--color-primary-blue)]'
                                            : 'border-gray-300 bg-white group-hover:border-[var(--color-primary-blue)]'}
                                    `}>
                                        {item.active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                    </div>

                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={item.active}
                                        onChange={() => onToggle(item.id)}
                                    />

                                    <span className={`text-sm flex-1 truncate transition-colors ${item.active ? 'text-[var(--color-primary-blue)] font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                        {item.label}
                                    </span>

                                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full min-w-[24px] text-center">
                                        {item.count}
                                    </span>
                                </label>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-2 italic opacity-75">
                                No se encontraron resultados.
                            </p>
                        )}
                    </div>

                    {/* Show More Button */}
                    {!searchTerm && visibleItems.length > DISPLAY_LIMIT && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="w-full text-center text-xs font-semibold text-[var(--color-primary-blue)] mt-3 hover:underline pt-2 border-t border-gray-50"
                        >
                            {showAll ? 'Mostrar menos' : `Ver todos (${items.length})`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
