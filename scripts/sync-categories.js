const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const API = require('@woocommerce/woocommerce-rest-api').default;

const url = process.env.WOOCOMMERCE_API_URL || "https://tienda.pharmaplus.com.co/";
const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

const api = new API({
    url,
    consumerKey,
    consumerSecret,
    version: "wc/v3"
});

async function syncCategories() {
    console.log('🚀 Iniciando sincronización de categorías...');
    try {
        let allCategories = [];
        let page = 1;
        let totalPages = 1;

        // Fetch all categories
        do {
            console.log(`📡 Descargando página ${page}...`);
            const response = await api.get("products/categories", {
                per_page: 100,
                page: page,
                hide_empty: false // Queremos todas aunque estén vacías por ahora
            });

            allCategories = allCategories.concat(response.data);
            totalPages = parseInt(response.headers['x-wp-totalpages']) || 1;
            page++;
        } while (page <= totalPages);

        console.log(`✅ ${allCategories.length} categorías descargadas.`);

        // Filtrar categorías excluidas
        const excludedSlugs = ['uncategorized', 'sin-categorizar', 'ninguna', 'otros-productos'];
        const filtered = allCategories.filter(cat => !excludedSlugs.includes(cat.slug));

        // Construir Árbol
        const map = {};
        const roots = [];

        filtered.forEach(cat => {
            map[cat.id] = { ...cat, children: [] };
        });

        filtered.forEach(cat => {
            if (cat.parent === 0) {
                roots.push(map[cat.id]);
            } else {
                const parentNode = map[cat.parent];
                if (parentNode) {
                    parentNode.children.push(map[cat.id]);
                }
            }
        });

        // Ordenar alfabéticamente
        const sortByName = (a, b) => a.name.localeCompare(b.name);
        roots.sort(sortByName);
        Object.values(map).forEach(node => {
            if (node.children) node.children.sort(sortByName);
        });

        const dataPath = path.join(__dirname, '../lib/data/fixed-categories.json');
        fs.writeFileSync(dataPath, JSON.stringify(roots, null, 2));

        console.log(`📂 Archivo guardado en: ${dataPath}`);
        console.log('✨ Sincronización completada con éxito.');
    } catch (error) {
        console.error('❌ Error sincronizando categorías:', error.message);
        process.exit(1);
    }
}

syncCategories();
