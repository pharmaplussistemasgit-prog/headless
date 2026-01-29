export interface BrandImage {
    url: string;
    alt: string;
    title: string;
    slug?: string;
    searchTerm?: string; // T21: Mapping for search query
}

// Lista 1: Productos Resaltados / Logos Importantes
export const FEATURED_BRANDS: BrandImage[] = [
    {
        url: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/10/los-lab-2-112.jpg',
        alt: 'Laboratorio Farmacéutico - Marca Destacada',
        title: 'Calidad Farmacéutica Garantizada',
        slug: 'laboratorio-destacado',
        searchTerm: 'laboratorio'
    },
    {
        url: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/04/logo_white_new.png',
        alt: 'PharmaPlus - Tu Farmacia de Confianza',
        title: 'PharmaPlus Droguería',
        slug: 'pharmaplus',
        searchTerm: 'pharmaplus'
    },
    {
        url: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/04/Logo-AG.webp',
        alt: 'Laboratorios AG - Medicamentos Genéricos',
        title: 'AG - Calidad al Alcance de Todos',
        slug: 'ag',
        searchTerm: 'ag'
    },
    {
        url: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/04/Logo-Oscillococcinum.webp',
        alt: 'Oscillococcinum - Boiron',
        title: 'Oscillococcinum - Homeopatía Eficaz',
        slug: 'oscillococcinum',
        searchTerm: 'Oscillococcinum'
    },
    {
        url: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/04/Logo-Procaps.webp',
        alt: 'Laboratorios Procaps',
        title: 'Procaps - Innovación Farmacéutica',
        slug: 'procaps',
        searchTerm: 'Procaps'
    },
    {
        url: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/04/Logo-Abrilar.webp',
        alt: 'Abrilar - Jarabe Natural',
        title: 'Abrilar - Expectorante Natural',
        slug: 'abrilar',
        searchTerm: 'Abrilar'
    },
    {
        url: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/04/Logo-Clarityne.webp',
        alt: 'Clarityne - Antialérgico',
        title: 'Clarityne - Alivio de la Alergia',
        slug: 'clarityne',
        searchTerm: 'Clarityne'
    },
    {
        url: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/04/Logo-Redoxon.webp',
        alt: 'Redoxon - Vitamina C',
        title: 'Redoxon - Protección Inmunológica',
        slug: 'redoxon',
        searchTerm: 'Redoxon'
    },
    {
        url: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/04/Logo-Alka-Seltzer-Extreme.webp',
        alt: 'Alka Seltzer Extreme',
        title: 'Alka Seltzer - Alivio Rápido',
        slug: 'alka-seltzer',
        searchTerm: 'Alka Seltzer'
    },
    {
        url: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/04/Logo-electrolit-1.webp',
        alt: 'Electrolit - Hidratación Total',
        title: 'Electrolit - Suero Rehidratante',
        slug: 'electrolit',
        searchTerm: 'Electrolit'
    },
    {
        url: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/04/Logo-Enterogermina.png',
        alt: 'Enterogermina - Probióticos',
        title: 'Enterogermina - Salud Digestiva',
        slug: 'enterogermina',
        searchTerm: 'Enterogermina'
    }
];

// Lista 2: Marcas Generales (Slider Infinito)
// Generado masivamente con Alt tags genéricos optimizados para SEO local
export const ALL_BRANDS_SLIDER: BrandImage[] = [
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-95.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-94.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-78.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-85.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-114.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-63.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-59.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-88.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-58.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-76.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-113.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-91.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-2-112.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-66.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-112.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-72.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-70.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-2-111.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-80.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-108.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-96.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-105.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-89.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-75.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-65.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-56.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-54.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-73.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-109.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-55.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-107.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-84.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-79.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-111.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-64.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-62.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-100.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-102.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-61.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-97.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-71.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-68.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-3-93.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-98.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-104.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-87.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-74.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-106.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-99.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-81.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-83.jpg',
    'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-103.jpg'
].map((url, index) => ({
    url,
    alt: `Laboratorio Aliado PharmaPlus ${index + 1}`,
    title: `Laboratorio Farmacéutico ${index + 1} - PharmaPlus`
}));
