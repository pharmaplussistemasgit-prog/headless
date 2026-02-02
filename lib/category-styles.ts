import { Pill, Sparkles, Baby, Apple, Tag, Heart, Stethoscope, Store, Bath, Activity, Crown, Zap, Thermometer, BriefcaseMedical, Smile, Sun, Snowflake, Leaf, SprayCan, PawPrint, Gift, ShoppingBag, User, Package, Umbrella, ShieldCheck, Droplet, Feather, Wheat, Milk, Brush, Eraser, Shield, Flower } from 'lucide-react';

export interface CategoryStyle {
    icon: React.ElementType;
    bgColor: string;
    textColor: string;
    iconColor: string;
    borderColor: string;
}

// Mapeo de keywords a estilos. El orden importa: las primeras coincidencias ganan.
const KEYWORD_MAPPINGS: { keywords: string[], style: CategoryStyle }[] = [
    // 1. Cadena de Frio / Especiales
    // ------------------------------------------------------------------
    // SPECIFIC BEAUTY & DERMA CATEGORIES (High Priority)
    // ------------------------------------------------------------------

    // 1. Limpieza Facial
    {
        keywords: ['limpiador', 'limpieza', 'desmaquillante', 'micelar', 'jabón', 'jabon', 'tónico', 'tonico', 'gel limpiador'],
        style: {
            icon: Droplet, // Agua / Limpieza (Restored)
            bgColor: 'bg-cyan-50',
            textColor: 'text-cyan-700',
            iconColor: 'text-cyan-600',
            borderColor: 'border-cyan-200'
        }
    },
    // 2.a Antiedad (Flower - Juventud/Flor)
    {
        keywords: ['antiedad', 'anti-edad', 'arrugas', 'rejuvenec', 'retinol', 'firmeza', 'lifting'],
        style: {
            icon: Flower, // Flor / Juventud / Renacer
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-200'
        }
    },
    // 2.b Despigmentantes (Sparkles - Luminosidad/Tono)
    {
        keywords: ['despigmentante', 'manchas', 'aclarante', 'tono', 'brillo', 'luminosidad'],
        style: {
            icon: Sparkles, // Brillo / Luminosidad
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-700',
            iconColor: 'text-yellow-600',
            borderColor: 'border-yellow-200'
        }
    },
    // 2.c Acné y Grasa (Zap - Acción focalizada)
    {
        keywords: ['acné', 'acne', 'grasa', 'sebo', 'imperfeccion', 'poros'],
        style: {
            icon: Zap, // Acción rápida / Anti-grasa
            bgColor: 'bg-teal-50',
            textColor: 'text-teal-700',
            iconColor: 'text-teal-600',
            borderColor: 'border-teal-200'
        }
    },
    // 2.d Reparador (Heart/Shield - Cuidado intensivo)
    {
        keywords: ['reparador', 'cicatrizante', 'calmante', 'sensible', 'rojez'],
        style: {
            icon: Heart, // Cuidado delicado
            bgColor: 'bg-rose-50',
            textColor: 'text-rose-700',
            iconColor: 'text-rose-600',
            borderColor: 'border-rose-200'
        }
    },
    // 3. Hidratación
    {
        keywords: ['hidratante', 'hidratacion', 'humectante', 'sequedad', 'seca', 'hidrata'],
        style: {
            icon: Droplet,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
            iconColor: 'text-blue-500',
            borderColor: 'border-blue-200'
        }
    },
    // 4. Exfoliantes
    {
        keywords: ['exfoliante', 'exfolia', 'scrub', 'peeling'],
        style: {
            icon: Feather, // Suavidad (Softness) - Removed Eraser
            bgColor: 'bg-rose-50',
            textColor: 'text-rose-700',
            iconColor: 'text-rose-500',
            borderColor: 'border-rose-200'
        }
    },
    // 5. Solar y Protección
    {
        keywords: ['solar', 'bloqueador', 'sol', 'protecc', 'uv', 'broncea', 'sun'],
        style: {
            icon: Shield, // Escudo protector
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-700',
            iconColor: 'text-orange-500',
            borderColor: 'border-orange-200'
        }
    },
    // 6. Maquillaje
    {
        keywords: ['maquillaje', 'makeup', 'polvo', 'base', 'labial', 'pestañina', 'mascara', 'cosmetico'],
        style: {
            icon: Brush, // Brocha de maquillaje
            bgColor: 'bg-fuchsia-50',
            textColor: 'text-fuchsia-700',
            iconColor: 'text-fuchsia-500',
            borderColor: 'border-fuchsia-200'
        }
    },

    // ------------------------------------------------------------------
    // GENERIC / BROAD CATEGORIES (Low Priority - Fallbacks)
    // ------------------------------------------------------------------

    // 7. Cadena de Frio / Especiales
    {
        keywords: ['frio', 'cadena', 'refrigera', 'nevera', 'hielo', 'insulin'],
        style: {
            icon: Snowflake,
            bgColor: 'bg-sky-50',
            textColor: 'text-sky-700',
            iconColor: 'text-sky-500',
            borderColor: 'border-sky-200'
        }
    },
    // 8. Facial y Rostro (Generic)
    {
        keywords: ['facial', 'rostro', 'cara', 'ojos', 'labios', 'pestañas', 'cejas'],
        style: {
            icon: Smile,
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-700',
            iconColor: 'text-indigo-500',
            borderColor: 'border-indigo-200'
        }
    },
    // 9. Capilar / Cabello
    {
        keywords: ['capilar', 'cabello', 'pelo', 'shampoo', 'acondicionador', 'tratamiento capilar'],
        style: {
            icon: Feather, // Suavidad / Cabello
            bgColor: 'bg-violet-50',
            textColor: 'text-violet-700',
            iconColor: 'text-violet-500',
            borderColor: 'border-violet-200'
        }
    },
    // 10. Corporal / Usuario
    {
        keywords: ['corporal', 'cuerpo', 'manos', 'pies', 'piernas'],
        style: {
            icon: User,
            bgColor: 'bg-rose-50',
            textColor: 'text-rose-700',
            iconColor: 'text-rose-500',
            borderColor: 'border-rose-200'
        }
    },
    // 11. Kits y Paquetes
    {
        keywords: ['kit', 'set', 'pack', 'estuche', 'ancheta', 'regalo', 'sorpresa'],
        style: {
            icon: Package, // Caja / Paquete
            bgColor: 'bg-fuchsia-50',
            textColor: 'text-fuchsia-700',
            iconColor: 'text-fuchsia-500',
            borderColor: 'border-fuchsia-200'
        }
    },
    // 12. Medicamentos General
    {
        keywords: ['medicamento', 'farma', 'salud', 'rx', 'droga', 'medicina', 'dolor', 'gripa', 'antibiotico'],
        style: {
            icon: Pill,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200'
        }
    },
    // 13. Derma General (Fallback para otras cosas de belleza)
    {
        keywords: ['derma', 'piel', 'belleza', 'antiage', 'arrugas', 'estetica', 'cosmetica'],
        style: {
            icon: Sparkles,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700',
            iconColor: 'text-purple-500',
            borderColor: 'border-purple-200'
        }
    },
    // 14. Bebés
    {
        keywords: ['bebe', 'infantil', 'nino', 'nina', 'matern', 'panal', 'leche', 'formula', 'pediat'],
        style: {
            icon: Baby,
            bgColor: 'bg-pink-50',
            textColor: 'text-pink-700',
            iconColor: 'text-pink-500',
            borderColor: 'border-pink-200'
        }
    },
    // 15. Nutrición
    {
        keywords: ['nutri', 'vitamin', 'suplem', 'alimento', 'alimentacion', 'aliment', 'diet', 'protein', 'fitness', 'ensure', 'pediasure', 'sport', 'gimnasio'],
        style: {
            icon: Milk, // Botella/Caja (Ensure, Pediasure, Suplementos)
            bgColor: 'bg-green-50',
            textColor: 'text-green-700',
            iconColor: 'text-green-600',
            borderColor: 'border-green-200'
        }
    },
    // 16. Aseo Personal
    {
        keywords: ['aseo', 'cuidado', 'personal', 'higiene', 'jabon', 'oral', 'dental', 'desodorante', 'afeitad'],
        style: {
            icon: SprayCan,
            bgColor: 'bg-cyan-50',
            textColor: 'text-cyan-700',
            iconColor: 'text-cyan-600',
            borderColor: 'border-cyan-200'
        }
    },
    // 17. Salud Sexual
    {
        keywords: ['sexual', 'adulto', 'preservativo', 'lubricante', 'intima', 'test', 'placer', 'condon'],
        style: {
            icon: Heart,
            bgColor: 'bg-rose-50',
            textColor: 'text-rose-700',
            iconColor: 'text-rose-600',
            borderColor: 'border-rose-200'
        }
    },
    // 18. Equipos Médicos
    {
        keywords: ['equipo', 'dispositivo', 'movilidad', 'silla', 'tensiometro', 'gluco', 'botiquin', 'ortopedia'],
        style: {
            icon: Stethoscope,
            bgColor: 'bg-teal-50',
            textColor: 'text-teal-700',
            iconColor: 'text-teal-600',
            borderColor: 'border-teal-200'
        }
    },
    // 19. Natural
    {
        keywords: ['natural', 'fitotera', 'homeo', 'planta', 'botanic', 'bio'],
        style: {
            icon: Leaf,
            bgColor: 'bg-lime-50',
            textColor: 'text-lime-700',
            iconColor: 'text-lime-600',
            borderColor: 'border-lime-200'
        }
    },
    // 20. Ofertas
    {
        keywords: ['oferta', 'descuento', 'outlet', 'promo', 'rebaja', 'liquidacion'],
        style: {
            icon: Tag,
            bgColor: 'bg-red-50',
            textColor: 'text-red-700',
            iconColor: 'text-red-600',
            borderColor: 'border-red-200'
        }
    },
    // 21. Mascotas
    {
        keywords: ['mascota', 'perro', 'gato', 'veterin'],
        style: {
            icon: PawPrint,
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-700',
            iconColor: 'text-amber-600',
            borderColor: 'border-amber-200'
        }
    },
    // 22. Vital / Bienestar
    {
        keywords: ['vital', 'vida', 'bienestar'],
        style: {
            icon: Activity,
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-700',
            iconColor: 'text-indigo-600',
            borderColor: 'border-indigo-200'
        }
    }
];

const DEFAULT_STYLE: CategoryStyle = {
    icon: Store, // Icono genérico pero visible
    bgColor: 'bg-slate-100', // Un gris claro distintivo
    textColor: 'text-slate-800',
    iconColor: 'text-slate-600', // Contraste suficiente
    borderColor: 'border-slate-200'
};

export const getCategoryStyle = (slug: string): CategoryStyle => {
    const lowerSlug = slug.toLowerCase();

    // Búsqueda secuencial por keywords
    for (const mapping of KEYWORD_MAPPINGS) {
        if (mapping.keywords.some(keyword => lowerSlug.includes(keyword))) {
            return mapping.style;
        }
    }

    return DEFAULT_STYLE;
};
