
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WOOCOMMERCE_API_URL;

async function fetchWP(endpoint) {
    const url = `${WP_URL}/wp-json/wp/v2${endpoint}`;
    // console.log(`Fetching ${url}...`);
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        return [];
    }
}

async function searchInTaxonomy(taxSlug, queries) {
    console.log(`\n📂 Scanning Taxonomy: /${taxSlug} ...`);
    let allTerms = [];
    let page = 1;
    while (true) {
        const terms = await fetchWP(`/${taxSlug}?per_page=100&page=${page}`);
        if (!terms || terms.length === 0) break;
        if (terms.code) break; // Error response
        allTerms.push(...terms);
        page++;
    }
    console.log(`   Total terms: ${allTerms.length}`);

    queries.forEach(q => {
        const matches = allTerms.filter(t =>
            t.name?.toLowerCase().includes(q) ||
            t.slug?.toLowerCase().includes(q)
        );
        if (matches.length > 0) {
            console.log(`   🎯 Custom Match for "${q}":`);
            matches.forEach(m => console.log(`      - [${m.id}] ${m.name} (Slug: ${m.slug}) (Count: ${m.count})`));
        }
    });

    return allTerms;
}

async function main() {
    console.log('🚀 DEEP SEARCH FOR MISSING BRANDS');

    const taxonomies = [
        'laboratorios',
        'pa_laboratorio',
        'pa_laboratorios',
        'marca',
        'pa_marca',
        'product_brand'
    ];

    const queries = ['trilog', 'nestl', 'abbv', '7'];

    for (const tax of taxonomies) {
        await searchInTaxonomy(tax, queries);
    }
}

main();
