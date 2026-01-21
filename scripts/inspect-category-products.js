const API = require('@woocommerce/woocommerce-rest-api').default;
require('dotenv').config({ path: '.env.local' });

const api = new API({
    url: process.env.WOOCOMMERCE_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL,
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
    version: "wc/v3"
});

async function inspectCategory() {
    const catId = 3368; // Cadena de Frio
    console.log(`🔍 Inspeccionando Categoría ID: ${catId} (Cadena de Frío)...`);

    try {
        const { data: products } = await api.get("products", {
            category: catId.toString(),
            per_page: 20 // Check a sample
        });

        console.log(`✅ Encontrados ${products.length} productos de muestra.`);

        products.forEach(p => {
            console.log(`\n💊 [${p.id}] ${p.name}`);

            // Tags
            const tags = p.tags.map(t => t.slug).join(', ');
            console.log(`   🏷️ Tags: ${tags || 'NINGUNO'}`);

            // Marca
            const marcaMeta = p.meta_data.find(m => m.key === '_marca');
            console.log(`   🧬 Marca (_marca): ${marcaMeta ? marcaMeta.value : 'NO DATA'}`);

            // Check attributes just in case
            if (p.attributes.length > 0) {
                console.log(`   📐 Atributos: ${p.attributes.map(a => a.name).join(', ')}`);
            }
        });

    } catch (err) {
        console.error("Error:", err.message);
    }
}

inspectCategory();
