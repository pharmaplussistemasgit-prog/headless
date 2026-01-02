"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

export type Category = { id: number; name: string; slug: string; count?: number; parent?: number };
export type Tag = { id: number; name: string; slug: string; count?: number };
export type AttributeTerm = { id: number; name: string; slug: string; count?: number };
export type AttributeWithTerms = { attribute: { id: number; name: string; slug: string }; terms: AttributeTerm[] };

interface FiltersSidebarProps {
  categories: Category[];
  tags: Tag[];
  attributes: AttributeWithTerms[];
  selected: {
    category?: string[];
    tag?: string[];
    attr_linea?: string[];
    attr_audiencia?: string[];
    attr_color?: string[];
    attr_talla?: string[];
    price_min?: number;
    price_max?: number;
    search?: string;
  };
  currentParams: Record<string, string>;
}

export function FiltersSidebar({
  categories,
  attributes,
  selected,
  currentParams,
}: FiltersSidebarProps) {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    departamentos: true,
    subcategorias: true,
    marca: true,
    precio: true,
    programate: true,
  });

  const [priceMin, setPriceMin] = useState(selected.price_min?.toString() || "");
  const [priceMax, setPriceMax] = useState(selected.price_max?.toString() || "");

  function toggleSection(section: string) {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  function makeHref(next: Record<string, string | undefined>) {
    const stringParams: Record<string, string> = {};
    Object.entries(currentParams).forEach(([key, value]) => {
      if (typeof value === 'string') stringParams[key] = value;
    });

    const params = new URLSearchParams(stringParams);
    Object.entries(next).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    params.delete("page");

    const queryString = params.toString();
    return queryString ? `/tienda?${queryString}` : '/tienda';
  }

  const clearAllFilters = () => router.push('/tienda');

  const handlePriceApply = () => {
    const href = makeHref({
      min_price: priceMin,
      max_price: priceMax
    });
    router.push(href);
  };

  // --- Data Processing for UI Sections ---

  // 1. Departamentos (Top Level Categories, e.g. "Salud y Medicamentos")
  const departamentos = categories.filter(c => c.parent === 0 && c.name.toLowerCase() !== 'uncategorized');

  // 2. Subcategorías (Level 1 Categories, e.g. "Capilar", "Facial")
  // For better UX, we should ideally show children of SELECTED parent. 
  // If no parent selected, maybe show popular ones or all.
  // Given the "fixed" request, let's show all non-parent for now, or refine if user complains.
  const subcategorias = categories.filter(c => c.parent !== 0);

  // 3. Marcas (Attribute 'Marca' or 'Laboratorio')
  const marcaAttribute = attributes.find(a =>
    a.attribute.name.toLowerCase() === 'marca' ||
    a.attribute.name.toLowerCase() === 'laboratorio'
  );
  const marcas = marcaAttribute ? marcaAttribute.terms : [];

  const SidebarSection = ({
    title,
    id,
    children,
    className = ""
  }: {
    title: string,
    id: string,
    children: React.ReactNode,
    className?: string
  }) => (
    <div className={`border-b border-gray-100 py-4 ${className}`}>
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between group px-1"
      >
        <h3 className="text-base font-bold text-gray-900 group-hover:text-[var(--color-primary-blue)] transition-colors text-left flex-1">
          {title}
        </h3>
        {openSections[id] ?
          <ChevronUp className="w-5 h-5 text-[var(--color-primary-blue)]" /> :
          <ChevronDown className="w-5 h-5 text-gray-400" />
        }
      </button>

      {openSections[id] && (
        <div className="mt-3 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );

  const CheckboxItem = ({
    label,
    count,
    isActive,
    onClick
  }: {
    label: string,
    count?: number,
    isActive?: boolean,
    onClick: () => void
  }) => (
    <div
      onClick={onClick}
      className="flex items-center justify-between py-2 cursor-pointer group hover:bg-gray-50 px-2 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors shadow-sm ${isActive
            ? 'border-[var(--color-primary-blue)] bg-[var(--color-primary-blue)]'
            : 'border-gray-300 bg-white group-hover:border-[var(--color-primary-blue)]'
          }`}>
          {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <span className={`text-sm truncate ${isActive ? 'font-bold text-[var(--color-primary-blue)]' : 'text-gray-600 group-hover:text-gray-900'}`}>
          {label}
        </span>
      </div>
      {(count !== undefined && count !== 0) && (
        <span className={`text-xs font-bold ml-2 ${isActive ? 'text-[var(--color-primary-blue)]' : 'text-gray-900'}`}>
          {count}
        </span>
      )}
    </div>
  );

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden font-sans">
      {/* Header Blue - Exact match to image 0 */}
      <div className="bg-[var(--color-primary-blue)] p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Filtros</h2>
        <button
          onClick={clearAllFilters}
          className="bg-white px-3 py-1 rounded-full text-xs font-bold text-[var(--color-primary-blue)] hover:bg-blue-50 transition-colors shadow-sm"
        >
          Limpiar Filtros
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">

        {/* Prográmate y Ahorra - Match image 1 */}
        <div className="flex items-center justify-between py-2 mb-2">
          <span className="text-base font-bold text-gray-900">Prográmate y Ahorra</span>
          <div className="w-5 h-5 rounded-full border border-gray-400 cursor-pointer hover:border-[var(--color-primary-blue)]"></div>
        </div>

        {/* Departamentos - Match image 1 */}
        <SidebarSection title="Departamentos" id="departamentos">
          <div className="max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
            {departamentos.map(cat => {
              const isActive = selected.category?.includes(cat.slug);
              return (
                <CheckboxItem
                  key={cat.id}
                  label={cat.name}
                  count={cat.count}
                  isActive={!!isActive}
                  onClick={() => router.push(makeHref({ category: isActive ? undefined : cat.slug }))}
                />
              );
            })}
          </div>
        </SidebarSection>

        {/* Categoría / Subcategoría - Match image 2 */}
        {subcategorias.length > 0 && (
          <SidebarSection title="Subcategoría" id="subcategorias">
            <div className="max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {subcategorias.slice(0, 50).map(cat => {
                const isActive = selected.category?.includes(cat.slug);
                return (
                  <CheckboxItem
                    key={cat.id}
                    label={cat.name}
                    count={cat.count}
                    isActive={!!isActive}
                    onClick={() => router.push(makeHref({ category: isActive ? undefined : cat.slug }))}
                  />
                );
              })}
            </div>
          </SidebarSection>
        )}

        {/* Marca - Match image 3 */}
        {marcas.length > 0 && (
          <SidebarSection title="Marca" id="marca">
            <div className="max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {marcas.map(term => {
                const isActive = selected.tag?.includes(term.slug) || false;
                return (
                  <CheckboxItem
                    key={term.id}
                    label={term.name}
                    count={term.count}
                    isActive={isActive}
                    onClick={() => {
                      // Assuming brand filtering might use 'search' or 'tag' param for now based on typical Woo setups
                      // Updating to use 'tag' param logic if available, else standard search
                      router.push(makeHref({ q: term.name }));
                    }}
                  />
                );
              })}
            </div>
          </SidebarSection>
        )}

        {/* Precio - Match image 3 */}
        <SidebarSection title="Precio" id="precio">
          <div className="px-2 pt-4 pb-2">
            {/* Visual Slider Representation */}
            <div className="relative h-1.5 bg-gray-200 rounded-full mb-6 mx-2">
              <div className="absolute top-0 bottom-0 left-[0%] right-[0%] bg-[var(--color-primary-blue)] rounded-full opacity-50"></div>
              <div className="absolute left-[0%] top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--color-primary-blue)] rounded-full shadow border-2 border-white cursor-pointer hover:scale-110 transition-transform"></div>
              <div className="absolute right-[0%] top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--color-primary-blue)] rounded-full shadow border-2 border-white cursor-pointer hover:scale-110 transition-transform"></div>
            </div>

            <div className="flex items-center justify-between text-gray-600 font-bold text-sm mb-4">
              <span>${priceMin || '0'}</span>
              <span>${priceMax || 'Max'}</span>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="number"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                placeholder="Min"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[var(--color-primary-blue)] outline-none transition-shadow"
              />
              <input
                type="number"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                placeholder="Max"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[var(--color-primary-blue)] outline-none transition-shadow"
              />
            </div>

            <button
              onClick={handlePriceApply}
              className="w-full mt-2 bg-[var(--color-primary-blue)] text-white py-2 rounded-lg text-sm font-bold hover:bg-[var(--color-dark-blue)] transition-colors shadow-md active:scale-95 transform"
            >
              Aplicar Precio
            </button>
          </div>
        </SidebarSection>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}