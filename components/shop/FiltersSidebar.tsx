"use client";

import { useState, useEffect, useRef } from "react";
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

// --- Helper Components (Defined OUTSIDE to prevent re-renders) ---

const SidebarSection = ({
  title,
  id,
  isOpen,
  onToggle,
  children,
  className = ""
}: {
  title: string,
  id: string,
  isOpen: boolean,
  onToggle: (id: string) => void,
  children: React.ReactNode,
  className?: string
}) => (
  <div className={`mb-8 ${className}`}>
    <div
      className="flex items-center justify-between cursor-pointer mb-4 group"
      onClick={() => onToggle(id)}
    >
      <h3 className="font-extrabold text-[#003876] uppercase tracking-wide text-xs">{title}</h3>
      <div className={`p-1 rounded-full transition-colors ${isOpen ? 'bg-blue-50 text-[var(--color-pharma-blue)]' : 'text-gray-400 group-hover:bg-gray-50'}`}>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </div>
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
      {children}
    </div>
  </div>
);

const CheckboxItem = ({
  label,
  count,
  isActive,
  onClick,
  className = ""
}: {
  label: string,
  count?: number,
  isActive?: boolean,
  onClick: (e?: React.MouseEvent) => void,
  className?: string
}) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between py-1.5 cursor-pointer group hover:bg-gray-50 px-2 rounded-lg transition-colors ${className}`}
  >
    <div className="flex items-center gap-3 overflow-hidden">
      <div className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors shadow-sm ${isActive
        ? 'border-[var(--color-pharma-blue)] bg-[var(--color-pharma-blue)]'
        : 'border-gray-300 bg-white group-hover:border-[var(--color-pharma-blue)]'
        }`}>
        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className={`text-sm truncate ${isActive ? 'font-bold text-[var(--color-pharma-blue)]' : 'text-gray-600 group-hover:text-gray-900'}`}>
        {label}
      </span>
    </div>
    {(count !== undefined) && (
      <span className={`text-xs font-bold ml-2 ${isActive ? 'text-[var(--color-pharma-blue)]' : 'text-gray-400'}`}>
        {count}
      </span>
    )}
  </div>
);

// Price Slider Component
const PriceSlider = ({ min, max, valueMin, valueMax, onChange }: { min: number, max: number, valueMin: number, valueMax: number, onChange: (min: number, max: number) => void }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (value: number) => Math.round(((value - min) / (max - min)) * 100);

  const handleMouseDown = (event: React.MouseEvent, thumb: 'min' | 'max') => {
    event.preventDefault();
    const startX = event.clientX;
    const sliderWidth = sliderRef.current?.getBoundingClientRect().width || 0;
    const startMin = valueMin;
    const startMax = valueMax;

    const onMouseMove = (e: MouseEvent) => {
      if (!sliderWidth) return;
      const deltaX = e.clientX - startX;
      const deltaValue = Math.round((deltaX / sliderWidth) * (max - min));

      if (thumb === 'min') {
        let newValue = Math.max(min, Math.min(startMin + deltaValue, valueMax - 1000));
        onChange(newValue, valueMax);
      } else {
        let newValue = Math.min(max, Math.max(startMax + deltaValue, valueMin + 1000));
        onChange(valueMin, newValue);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="relative h-6 mb-6 mx-2 select-none touch-none" ref={sliderRef}>
      {/* Background Track */}
      <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-200 rounded-full -translate-y-1/2"></div>

      {/* Active Range Track */}
      <div
        className="absolute top-1/2 h-1.5 bg-[var(--color-pharma-blue)] rounded-full -translate-y-1/2 opacity-50"
        style={{ left: `${getPercentage(valueMin)}%`, right: `${100 - getPercentage(valueMax)}%` }}
      ></div>

      {/* Min Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--color-pharma-blue)] rounded-full shadow border-2 border-white cursor-pointer hover:scale-110 active:scale-125 transition-transform z-10"
        style={{ left: `${getPercentage(valueMin)}%`, transform: 'translate(-50%, -50%)' }}
        onMouseDown={(e) => handleMouseDown(e, 'min')}
      ></div>

      {/* Max Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--color-pharma-blue)] rounded-full shadow border-2 border-white cursor-pointer hover:scale-110 active:scale-125 transition-transform z-10"
        style={{ left: `${getPercentage(valueMax)}%`, transform: 'translate(-50%, -50%)' }}
        onMouseDown={(e) => handleMouseDown(e, 'max')}
      ></div>
    </div>
  );
};

export function FiltersSidebar({
  categories,
  attributes,
  selected = {},
  currentParams = {},
}: FiltersSidebarProps) {
  const router = useRouter();

  // State for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    departamentos: true,
    marca: true,
    precio: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Internal state for Price inputs
  const [priceMin, setPriceMin] = useState(currentParams.min_price || '');
  const [priceMax, setPriceMax] = useState(currentParams.max_price || '');

  // Sync state with URL params when they change externally
  useEffect(() => {
    if (currentParams.min_price !== undefined) setPriceMin(currentParams.min_price);
    if (currentParams.max_price !== undefined) setPriceMax(currentParams.max_price);
  }, [currentParams.min_price, currentParams.max_price]);

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

  // Slider Logic Constants
  const SLIDER_MIN = 0;
  const SLIDER_MAX = 500000;

  // --- Data Processing for UI Sections ---

  // Build Category Tree
  const categoryTree = categories
    .filter(cat => cat.parent === 0 && cat.name.toLowerCase() !== 'uncategorized')
    .map(parent => ({
      ...parent,
      children: categories.filter(child => child.parent === parent.id)
    }));

  // Marcas
  const marcaAttribute = attributes.find(a =>
    a.attribute.name.toLowerCase() === 'marca' ||
    a.attribute.name.toLowerCase() === 'laboratorio'
  );
  const marcas = marcaAttribute ? marcaAttribute.terms : [];

  return (
    <div className="w-full bg-white rounded-xl shadow-[0_0_15px_rgba(0,80,216,0.1)] border-2 border-[var(--color-pharma-blue)] overflow-hidden font-sans">
      {/* Header Blue */}
      <div className="bg-[var(--color-pharma-blue)] p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Filtros</h2>
        <button
          onClick={clearAllFilters}
          className="bg-white px-3 py-1 rounded-full text-xs font-bold text-[var(--color-pharma-blue)] hover:bg-blue-50 transition-colors shadow-sm"
        >
          Limpiar
        </button>
      </div>

      <div className="p-4">

        {/* Departamentos (Hierarchy Tree) */}
        <SidebarSection title="Departamentos" id="departamentos" isOpen={openSections['departamentos']} onToggle={toggleSection}>
          <div className="pr-2">
            {categoryTree.map(cat => {
              const highlightParent = selected.category?.includes(cat.slug);
              return (
                <div key={cat.id} className="mb-3">
                  {/* Parent Category */}
                  <div className="mb-1">
                    <CheckboxItem
                      label={cat.name}
                      count={cat.count}
                      isActive={!!highlightParent}
                      onClick={() => router.push(makeHref({ category: highlightParent ? undefined : cat.slug }))}
                      className="font-bold text-gray-800 hover:bg-gray-50 bg-gray-50/50 rounded-lg"
                    />
                  </div>

                  {/* Child Categories (Subcategories) */}
                  {cat.children && cat.children.length > 0 && (
                    <div className="ml-3 pl-3 border-l-2 border-gray-100 flex flex-col gap-1">
                      {cat.children.map(child => {
                        const highlightChild = selected.category?.includes(child.slug);
                        return (
                          <CheckboxItem
                            key={child.id}
                            label={child.name}
                            count={child.count}
                            isActive={!!highlightChild}
                            onClick={(e) => {
                              e?.stopPropagation();
                              router.push(makeHref({ category: highlightChild ? undefined : child.slug }));
                            }}
                            className="py-1 text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] hover:bg-transparent"
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SidebarSection>

        {/* Marca */}
        {marcas.length > 0 && (
          <SidebarSection title="Marca" id="marca" isOpen={openSections['marca']} onToggle={toggleSection}>
            <div className="pr-2">
              {marcas.map(term => {
                const isActive = selected.tag?.includes(term.slug) || false;
                return (
                  <CheckboxItem
                    key={term.id}
                    label={term.name}
                    count={term.count}
                    isActive={isActive}
                    onClick={() => {
                      router.push(makeHref({ q: term.name }));
                    }}
                  />
                );
              })}
            </div>
          </SidebarSection>
        )}

        {/* Precio */}
        <SidebarSection title="Precio" id="precio" isOpen={openSections['precio']} onToggle={toggleSection}>
          <div className="px-2 pt-4 pb-2">

            <PriceSlider
              min={SLIDER_MIN}
              max={SLIDER_MAX}
              valueMin={priceMin ? Number(priceMin) : SLIDER_MIN}
              valueMax={priceMax ? Number(priceMax) : SLIDER_MAX}
              onChange={(newMin, newMax) => {
                setPriceMin(newMin.toString());
                setPriceMax(newMax.toString());
              }}
            />

            <div className="flex items-center justify-between text-gray-600 font-bold text-sm mb-4">
              <span>${priceMin ? parseInt(priceMin).toLocaleString('es-CO') : SLIDER_MIN.toLocaleString('es-CO')}</span>
              <span>${priceMax ? parseInt(priceMax).toLocaleString('es-CO') : SLIDER_MAX.toLocaleString('es-CO')}+</span>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="number"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                placeholder="Min"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[var(--color-pharma-blue)] outline-none transition-shadow"
              />
              <input
                type="number"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                placeholder="Max"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[var(--color-pharma-blue)] outline-none transition-shadow"
              />
            </div>

            <button
              onClick={handlePriceApply}
              className="w-full mt-2 bg-[var(--color-pharma-blue)] text-white py-2 rounded-lg text-sm font-bold hover:bg-[var(--color-blue-classic)] transition-colors shadow-md active:scale-95 transform"
            >
              Aplicar Precio
            </button>
          </div>
        </SidebarSection>

      </div>

      <style jsx global>{`
        /* Webkit scrollbar styles */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
}