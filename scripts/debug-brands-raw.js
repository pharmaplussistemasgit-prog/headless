

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });


const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
const CUSTOM_API_KEY = process.env.CUSTOM_API_KEY;

if (!WP_URL || !CUSTOM_API_KEY) {
    console.error('❌ Missing ENV vars');
    process.exit(1);
}

async function main() {
    console.log('🔍 Debugging Custom API vs Taxonomy...');

    // 1. Fetch Custom API (first 20)
    console.log('\n--- Custom API (First 20) ---');
    try {
        const res = await fetch(`${WP_URL}/wp-json/custom-api/v1/laboratorio?per_page=20&orderby=LABORATORIO_ID&order=ASC`, {
            headers: { 'X-API-KEY': CUSTOM_API_KEY } // Assuming key auth based on previous file
        });
        const data = await res.json();
        if (data.rows) {
            data.rows.forEach(r => {
                console.log(`[Custom] ID: ${r.LABORATORIO_ID} | Name: ${r.LABORATORIO_NOMBRE} | SlugCol: ${r.LABORATORIO_SLUG} | Logo: ${r.LOGO_URL}`);
            });
        } else {
            console.log('No rows in custom data', data);
        }
    } catch (e) {
        console.error('Custom API Error:', e.message);
    }

    // 2. Fetch Taxonomy (first 20)
    console.log('\n--- Taxonomy pa_laboratorio (First 20) ---');
    try {
        const res = await fetch(`${WP_URL}/wp-json/wp/v2/pa_laboratorio?per_page=20`);
        const terms = await res.json();
        terms.forEach(t => {
            console.log(`[Taxonomy] ID: ${t.id} | Name: ${t.name} | Slug: ${t.slug} | Count: ${t.count}`);
        });
    } catch (e) {
        console.error('Taxonomy Error:', e.message);
    }
}

main();
