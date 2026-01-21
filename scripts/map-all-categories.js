
require('dotenv').config({ path: '.env.local' });
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const fs = require('fs');

async function mapCategories() {
    const url = process.env.WOOCOMMERCE_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!url || !consumerKey || !consumerSecret) {
        console.error("❌ Faltan variables de entorno.");
        return;
    }

    const api = new WooCommerceRestApi({
        url: url,
        consumerKey: consumerKey,
        consumerSecret: consumerSecret,
        version: "wc/v3"
    });

    console.log(`📡 Conectando a WooCommerce para mapeo completo...`);

    try {
        let page = 1;
        let allCategories = [];
        let totalPages = 1;

        do {
            process.stdout.write(`⏳ Descargando página ${page}... \r`);
            const response = await api.get("products/categories", { per_page: 100, page: page });
            allCategories = allCategories.concat(response.data);
            totalPages = parseInt(response.headers['x-wp-totalpages']);
            page++;
        } while (page <= totalPages);

        console.log(`\n✅ Total de Categorías Encontradas: ${allCategories.length}`);

        // Filtramos solo las que tienen productos, o mostramos todas pero ordenadas
        const mapped = allCategories.map(c => ({
            id: c.id,
            nombre: c.name,
            slug: c.slug,
            cantidad_productos: c.count,
            parent: c.parent
        })).sort((a, b) => b.cantidad_productos - a.cantidad_productos); // Ordenamos por cantidad descendente

        console.table(mapped);

        fs.writeFileSync('categoria_mapping.json', JSON.stringify(mapped, null, 2));
        console.log("💾 Mapeo guardado en 'categoria_mapping.json'");

    } catch (error) {
        console.error("Error en la API:", error.response ? error.response.data : error.message);
    }
}

mapCategories();
