import { InfoIcon } from "lucide-react";

import { isColdChain } from "@/lib/coldChain";

import { MappedProduct } from "@/types/product";

export default function ColdChainAlert({ categories, product }: { categories?: any[], product?: MappedProduct | any }) {
    // Consolidate check
    if (!isColdChain(categories, product)) return null;

    return (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r my-4 shadow-sm">
            <div className="flex">
                <div className="flex-shrink-0">
                    <InfoIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <p className="text-sm text-blue-800 font-bold uppercase tracking-wide">
                        ❄️ Producto de Cadena de Frío
                    </p>
                    <div className="mt-2 text-xs text-blue-700 space-y-1.5 font-medium">
                        <p>
                            • Garantizamos 24 horas de frescura. <span className="font-bold">Requiere recepción personal inmediata.</span>
                        </p>
                        <p className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded w-fit">
                            • 🚫 POR SEGURIDAD, NO SE ACEPTAN DEVOLUCIONES EN ESTE PRODUCTO.
                        </p>
                        <p className="font-bold text-blue-900">
                            • Aplica recargo de $12.000 COP por nevera y geles refrigerantes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
