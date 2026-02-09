
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WOOCOMMERCE_API_URL;

async function fetchWP(endpoint) {
    const url = `${WP_URL}/wp-json/wp/v2${endpoint}`;
    console.log(`Fetching ${url}...`);
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`WP Error ${res.status}`);
        return await res.json();
    } catch (e) {
        if (e.message.includes('400')) return [];
        throw e;
    }
}

function toKebabCase(str) {
    return str.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

async function main() {
    console.log('🚀 Generating Brands Data (Top 30 by Count)...');

    try {
        let allTerms = [];
        let page = 1;
        while (true) {
            // Get ALL terms
            const url = `/laboratorios?per_page=100&page=${page}`;
            const terms = await fetchWP(url);
            if (!Array.isArray(terms) || terms.length === 0) break;

            allTerms.push(...terms);
            console.log(`   Page ${page}: Fetched ${terms.length} terms...`);
            page++;
        }
        console.log(`✅ Total Terms Raw: ${allTerms.length}`);

        const brands = [];

        for (const t of allTerms) {
            const isNameNumeric = /^\d+$/.test(t.name.trim());
            const isSlugNumeric = /^\d+$/.test(t.slug.trim());

            if (isNameNumeric) continue;

            let finalSlug = t.slug;
            if (isSlugNumeric) {
                finalSlug = toKebabCase(t.name);
            }

            // Force fix specifically reported ones
            if (t.name.toLowerCase().includes('trilogi')) {
                finalSlug = '7-trilogi';
            }

            brands.push({
                id: t.id,
                brandId: t.id,
                name: t.name,
                slug: finalSlug,
                count: t.count || 0,
                url: '',
                alt: t.name,
                title: t.name
            });
        }

        console.log(`✅ Total Clean Brands: ${brands.length}`);

        // Sort by Count DESC, then Name ASC (User Request: "minimizamos a los 30 que más tengan")
        brands.sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return a.name.localeCompare(b.name);
        });

        // Generate File
        const content = `/**
 * Datos de Marcas/Laboratorios (SORTED BY COUNT)
 * Generado por: scripts/generate-brands-simple.js
 * Fecha: ${new Date().toISOString()}
 * Fuente: /wp-json/wp/v2/laboratorios
 * Total: ${brands.length}
 */

export interface Brand {
  title: string;
  slug: string;
  url: string;
  alt: string;
  brandId: number; 
  count?: number;
}

export const ALL_BRANDS_SLIDER: Brand[] = ${JSON.stringify(brands, null, 2)};

// Top 30 based on product count (Requested/Minimization)
export const FEATURED_BRANDS = ALL_BRANDS_SLIDER.slice(0, 30);
`;

        const outputPath = path.resolve(__dirname, '..', 'lib', 'brands-data.ts');
        fs.writeFileSync(outputPath, content);
        console.log(`✅ Saved to ${outputPath}`);

    } catch (e) {
        console.error('Failure:', e.message);
    }
}

main();
