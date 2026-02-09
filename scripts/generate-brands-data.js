const fs = require('fs');

const labs = JSON.parse(fs.readFileSync('scripts/all_active_labs.json', 'utf8'));

const featuredLogos = {
    'lafrancol': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-2-111.jpg',
    'procaps-farma-rx': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-81.jpg',
    'siegfried-farma': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-93.jpg',
    'bussie-farma': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-58.jpg',
    'eurofarma': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-97.jpg', // EUROFARMA (ID 3282)
    'pfizer-s-a-s': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-91.jpg',
    'tecnoquimicas-mk': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-3-93.jpg',
    'astrazeneca-colombia-sas': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-114.jpg',
    'abbvie-eye-care': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-112.jpg',
    'axon-pharma-sas': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-85.jpg',
    'bayer-s-a': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-88.jpg',
    'adium-pharma-s-a-s': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-94.jpg',
    'astellas': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-78.jpg',
    'biopas-laboratorio-farmaceutico': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/los-lab-59.jpg',
    'heel': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2024/05/9.png',
    'inmunopharma-s-a-s': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2024/05/10.png',
    'aulen-pharma-s-a': 'https://tienda.pharmaplus.com.co/wp-content/uploads/2025/11/aulen-pharma-logo.jpg', // AULEN PHARMA S.A. (ID 3341)
};

const mappedLabs = labs.map(l => {
    // Mapeo EXACTO por slug (no más coincidencia parcial)
    const logoUrl = featuredLogos[l.slug] || null;

    return {
        url: logoUrl || '', // Empty if no logo
        alt: l.name,
        title: l.name,
        slug: l.slug,
        brandId: l.id
    };
});

// Featured only includes those WITH logos and UNIQUE slugs (no duplicates)
const featuredWithLogos = [];
const seenSlugs = new Set();

for (const brand of mappedLabs) {
    // Solo incluir si tiene logo Y no hemos visto este slug antes
    if (brand.url && !seenSlugs.has(brand.slug)) {
        featuredWithLogos.push(brand);
        seenSlugs.add(brand.slug);
    }
}

let content = `export interface BrandImage {
    url: string;
    alt: string;
    title: string;
    slug?: string;
    searchTerm?: string;
    categoryId?: number; // T21: Mapping for WordPress Category ID
    brandId?: number; // T21: Mapping for Laboratorios Taxonomy ID
}

// Lista 1: Laboratorios Principales (Compra Por Marca) - SOLO LOGOS ÚNICOS
export const FEATURED_BRANDS: BrandImage[] = ${JSON.stringify(featuredWithLogos, null, 4)};

// Lista 2: Marcas Generales (Autocomplete/Search) - Todas las marcas con productos
export const ALL_BRANDS_SLIDER: BrandImage[] = ${JSON.stringify(mappedLabs, null, 4)};
`;

fs.writeFileSync('lib/brands-data.ts', content);
console.log('Successfully updated lib/brands-data.ts with ' + mappedLabs.length + ' brands.');
