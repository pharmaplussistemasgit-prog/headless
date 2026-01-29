import { Pill, Sparkles, Baby, Apple, Tag, Heart, Stethoscope, Store, Bath, Activity, Crown, Zap, Thermometer, BriefcaseMedical, Smile, Sun } from 'lucide-react';

export interface CategoryStyle {
    icon: React.ElementType;
    bgColor: string;
    textColor: string;
    iconColor: string;
    borderColor: string;
}

// Mapeo de keywords a estilos. El orden importa: las primeras coincidencias ganan.
const KEYWORD_MAPPINGS: { keywords: string[], style: CategoryStyle }[] = [
    {
        keywords: ['medicamento', 'farma', 'salud', 'rx', 'droga', 'medicina', 'dolor', 'gripa'],
        style: {
            icon: Pill,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200'
        }
    },
    {
        keywords: ['derma', 'piel', 'belleza', 'facial', 'corporal', 'capilar', 'rostro', 'crema', 'bloqueador', 'solar'],
        style: {
            icon: Sparkles,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700',
            iconColor: 'text-purple-500', // Un poco más vibrante
            borderColor: 'border-purple-200'
        }
    },
    {
        keywords: ['bebe', 'infantil', 'nino', 'nina', 'matern', 'panal', 'leche', 'formula'],
        style: {
            icon: Baby,
            bgColor: 'bg-pink-50',
            textColor: 'text-pink-700',
            iconColor: 'text-pink-500',
            borderColor: 'border-pink-200'
        }
    },
    {
        keywords: ['nutri', 'vitamin', 'suplem', 'alimento', 'diet', 'protein', 'fitness', 'ensure', 'pediasure'],
        style: {
            icon: Apple,
            bgColor: 'bg-green-50',
            textColor: 'text-green-700',
            iconColor: 'text-green-600',
            borderColor: 'border-green-200'
        }
    },
    {
        keywords: ['aseo', 'cuidado', 'personal', 'higiene', 'jabon', 'shampoo', 'oral', 'dental'],
        style: {
            icon: Bath, // Usando Bath como proxy de aseo/higiene
            bgColor: 'bg-cyan-50',
            textColor: 'text-cyan-700',
            iconColor: 'text-cyan-600',
            borderColor: 'border-cyan-200'
        }
    },
    {
        keywords: ['sexual', 'adulto', 'preservativo', 'lubricante', 'intima', 'test'],
        style: {
            icon: Heart,
            bgColor: 'bg-rose-50',
            textColor: 'text-rose-700',
            iconColor: 'text-rose-600',
            borderColor: 'border-rose-200'
        }
    },
    {
        keywords: ['equipo', 'dispositivo', 'movilidad', 'silla', 'tensiometro', 'gluco', 'botiquin'],
        style: {
            icon: Stethoscope,
            bgColor: 'bg-teal-50',
            textColor: 'text-teal-700',
            iconColor: 'text-teal-600',
            borderColor: 'border-teal-200'
        }
    },
    {
        keywords: ['oferta', 'descuento', 'outlet', 'promo', 'rebaja'],
        style: {
            icon: Tag,
            bgColor: 'bg-red-50',
            textColor: 'text-red-700',
            iconColor: 'text-red-600',
            borderColor: 'border-red-200'
        }
    },
    {
        keywords: ['natural', 'fitotera', 'homeo', 'planta'],
        style: {
            icon: Sun,
            bgColor: 'bg-lime-50',
            textColor: 'text-lime-700',
            iconColor: 'text-lime-600',
            borderColor: 'border-lime-200'
        }
    },
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
