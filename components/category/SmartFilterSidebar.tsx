import { CategoryTree } from '@/types/woocommerce';
import CategorySidebar from './CategorySidebar';

interface SmartFilterSidebarProps {
    className?: string;
    categoryTree?: CategoryTree[];
    currentCategory?: CategoryTree;
}

export default function SmartFilterSidebar({
    className = '',
    categoryTree = [],
    currentCategory
}: SmartFilterSidebarProps) {
    // Archetype Detection
    const isColdChain = currentCategory?.slug.includes('cadena-de-frio') || currentCategory?.slug.includes('frio');

    return (
        <aside className={`w-full md:w-72 bg-white rounded-2xl border-2 border-blue-600/10 shadow-xl shadow-blue-900/5 overflow-hidden sticky top-24 max-h-[calc(100vh-120px)] flex flex-col ${className}`}>

            {/* Header: Categorías (Fixed) */}
            <div className="bg-[var(--pharma-blue)] p-4 flex justify-between items-center shadow-lg shrink-0 z-10">
                <h2 className="text-xl font-black text-white tracking-tight">Categorías</h2>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-4">

                {/* 1. SECCIÓN DEPARTAMENTOS (Siempre visible si hay tree) */}
                {categoryTree.length > 0 && (
                    <CategorySidebar
                        currentCategory={currentCategory!}
                        categoryTree={categoryTree}
                        embedded={true}
                    />
                )}

                {/* 2. SPECIALTY BADGES */}
                {isColdChain && (
                    <div className="mx-2 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <div className="text-2xl animate-pulse">❄️</div>
                        <div>
                            <h4 className="font-bold text-blue-900 text-xs uppercase tracking-tighter">Manejo Especial</h4>
                            <p className="text-[10px] text-blue-700 mt-0.5 leading-tight font-medium">
                                REFRIGERACIÓN GARANTIZADA.
                            </p>
                        </div>
                    </div>
                )}


            </div>
        </aside>
    );
}
