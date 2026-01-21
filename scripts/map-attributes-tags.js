
require('dotenv').config({ path: '.env.local' });
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const fs = require('fs');

async function mapAttributesAndTags() {
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

    console.log(`📡 Conectando para mapear Variables (Atributos) y Etiquetas (Tags)...`);

    try {
        // 1. Fetch Attributes
        console.log("⏳ Descargando Atributos...");
        const attributesRes = await api.get("products/attributes");
        const attributes = attributesRes.data;
        console.log(`✅ ${attributes.length} Atributos encontrados.`);

        // 2. Fetch Tags (Pagination needed)
        console.log("⏳ Descargando Etiquetas (Tags)...");
        let page = 1;
        let allTags = [];
        let totalPages = 1;

        do {
            const response = await api.get("products/tags", { per_page: 100, page: page });
            allTags = allTags.concat(response.data);
            totalPages = parseInt(response.headers['x-wp-totalpages']);
            page++;
        } while (page <= totalPages);

        console.log(`✅ ${allTags.length} Etiquetas encontradas.`);

        const result = {
            atributos: attributes.map(a => ({
                id: a.id,
                nombre: a.name,
                slug: a.slug,
                count: a.count // Sometimes available/relevant depending on version
            })),
            etiquetas: allTags.map(t => ({
                id: t.id,
                nombre: t.name,
                slug: t.slug,
                count: t.count
            })).sort((a, b) => b.count - a.count)
        };

        console.log("\n🧪 ATRIBUTOS (Variables):");
        if (result.atributos.length > 0) console.table(result.atributos);
        else console.log("No se encontraron atributos.");

        console.log("\n🏷️ TOP 10 ETIQUETAS:");
        if (result.etiquetas.length > 0) console.table(result.etiquetas.slice(0, 10));
        else console.log("No se encontraron etiquetas.");

        fs.writeFileSync('attributes_tags_mapping.json', JSON.stringify(result, null, 2));
        console.log("\n💾 Mapeo completo guardado en 'attributes_tags_mapping.json'");

    } catch (error) {
        console.error("Error en la API:", error.response ? error.response.data : error.message);
    }
}

mapAttributesAndTags();
