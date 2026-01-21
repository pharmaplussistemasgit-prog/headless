
require('dotenv').config({ path: '.env.local' });
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

async function verify() {
    const url = process.env.WOOCOMMERCE_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!url || !consumerKey || !consumerSecret) {
        console.error("❌ Faltan variables de entorno (WOOCOMMERCE_API_URL, KEY, SECRET)");
        return;
    }

    const api = new WooCommerceRestApi({
        url: url,
        consumerKey: consumerKey,
        consumerSecret: consumerSecret,
        version: "wc/v3"
    });

    console.log(`📡 Conectando a WooCommerce: ${url}`);

    try {
        let page = 1;
        let allCategories = [];
        let totalPages = 1;

        console.log("⏳ Descargando categorías...");

        do {
            const response = await api.get("products/categories", { per_page: 100, page: page });
            allCategories = allCategories.concat(response.data);
            totalPages = parseInt(response.headers['x-wp-totalpages']);
            page++;
        } while (page <= totalPages);

        const coldChain = allCategories.filter(c =>
            c.slug.includes('frio') ||
            c.slug.includes('frío') ||
            c.name.toLowerCase().includes('cadena')
        );

        const fs = require('fs');
        if (coldChain.length > 0) {
            console.log("\n✅ ÉXITO: Categorías encontradas:");
            const results = coldChain.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                count: c.count
            }));
            console.log(results);
            fs.writeFileSync('verify_output.json', JSON.stringify(results, null, 2));
        } else {
            console.log("\n❌ NO SE ENCONTRÓ ninguna categoría relacionada con 'Frio' o 'Cadena'.");
            fs.writeFileSync('verify_output.json', JSON.stringify([], null, 2));
        }
    } catch (error) {
        console.error("Error en la API:", error.response ? error.response.data : error.message);
    }
}

verify();
