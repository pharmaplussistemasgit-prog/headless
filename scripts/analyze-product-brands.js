
require('dotenv').config({ path: '.env.local' });
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const fs = require('fs');

async function analyzeBrands() {
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

    console.log(`📡 Buscando pistas de MARCAS o LABORATORIOS en productos...`);

    try {
        // Traemos 5 productos aleatorios para comparar su data
        const response = await api.get("products", { per_page: 5 });
        const products = response.data;

        if (products.length === 0) {
            console.log("No se encontraron productos.");
            return;
        }

        console.log(`🔍 Analizando ${products.length} productos...`);

        // Inspeccionamos las claves de un producto
        const sample = products[0];

        // 1. Chequear Meta Data (Aquí suelen esconderse campos personalizados)
        console.log("\n--- META DATA ENCONTRADA (Claves) ---");
        const metaKeys = new Set();
        products.forEach(p => {
            p.meta_data.forEach(m => metaKeys.add(m.key));
        });
        console.log(Array.from(metaKeys));

        // 2. Buscar valores que parezcan marcas en Meta Data
        console.log("\n--- POSIBLES MARCAS EN META DATA ---");
        products.forEach(p => {
            const brands = p.meta_data.filter(m =>
                m.key.toLowerCase().includes('brand') ||
                m.key.toLowerCase().includes('marca') ||
                m.key.toLowerCase().includes('laboratorio') ||
                m.key.toLowerCase().includes('fabricante')
            );
            if (brands.length > 0) {
                console.log(`Producto: ${p.name}`);
                console.table(brands);
            }
        });

        // 3. Chequear si hay Taxonomías Extrañas (no estándar) en la respuesta
        // A veces plugins inyectan campos directo en el root del objeto
        console.log("\n--- CAMPOS RAÍZ INUSUALES ---");
        const standardKeys = ['id', 'name', 'slug', 'permalink', 'date_created', 'date_created_gmt', 'date_modified', 'date_modified_gmt', 'type', 'status', 'featured', 'catalog_visibility', 'description', 'short_description', 'sku', 'price', 'regular_price', 'sale_price', 'date_on_sale_from', 'date_on_sale_from_gmt', 'date_on_sale_to', 'date_on_sale_to_gmt', 'price_html', 'on_sale', 'purchasable', 'total_sales', 'virtual', 'downloadable', 'downloads', 'download_limit', 'download_expiry', 'external_url', 'button_text', 'tax_status', 'tax_class', 'manage_stock', 'stock_quantity', 'stock_status', 'backorders', 'backorders_allowed', 'backordered', 'sold_individually', 'weight', 'dimensions', 'shipping_required', 'shipping_taxable', 'shipping_class', 'shipping_class_id', 'reviews_allowed', 'average_rating', 'rating_count', 'related_ids', 'upsell_ids', 'cross_sell_ids', 'parent_id', 'purchase_note', 'categories', 'tags', 'images', 'attributes', 'default_attributes', 'variations', 'grouped_products', 'menu_order', 'meta_data', '_links'];

        const unusualKeys = Object.keys(sample).filter(k => !standardKeys.includes(k));
        if (unusualKeys.length > 0) {
            console.log("Campos extra detectados:", unusualKeys);
            unusualKeys.forEach(k => {
                console.log(`${k}:`, sample[k]);
            });
        } else {
            console.log("No se detectaron campos raíz inusuales (taxonomías custom planas).");
        }

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

analyzeBrands();
