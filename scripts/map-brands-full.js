
require('dotenv').config({ path: '.env.local' });
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const fs = require('fs');

async function mapAllBrands() {
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

    console.log(`📡 Escaneando catálogo completo para extraer MARCAS (_marca)...`);

    try {
        let page = 1;
        let allBrandsCounter = {};
        let totalPages = 1;
        let productsFound = 0;

        // We only need meta_data, ID and name to minimize data transfer
        do {
            process.stdout.write(`⏳ Escaneando página ${page}... \r`);
            const response = await api.get("products", {
                per_page: 100,
                page: page,
                _fields: 'id,name,meta_data'
            });

            const products = response.data;
            products.forEach(p => {
                const marcaMeta = p.meta_data.find(m => m.key === '_marca');
                if (marcaMeta && marcaMeta.value) {
                    const brandName = String(marcaMeta.value).trim().toUpperCase(); // Normalize
                    if (brandName) {
                        allBrandsCounter[brandName] = (allBrandsCounter[brandName] || 0) + 1;
                    }
                }
            });

            productsFound += products.length;
            totalPages = parseInt(response.headers['x-wp-totalpages']);
            page++;
        } while (page <= totalPages);

        console.log(`\n✅ Escaneados ${productsFound} productos.`);

        // Convert to array and sort
        const mappedBrands = Object.entries(allBrandsCounter).map(([name, count]) => ({
            marca: name,
            cantidad_productos: count
        })).sort((a, b) => b.cantidad_productos - a.cantidad_productos);

        console.log(`✅ ${mappedBrands.length} Marcas/Laboratorios únicos encontrados.`);

        console.log("\n🧪 TOP 10 MARCAS:");
        console.table(mappedBrands.slice(0, 10));

        fs.writeFileSync('brands_mapping.json', JSON.stringify(mappedBrands, null, 2));
        console.log("💾 Mapeo de marcas guardado en 'brands_mapping.json'");

    } catch (error) {
        console.error("Error en la API:", error.response ? error.response.data : error.message);
    }
}

mapAllBrands();
