
require('dotenv').config({ path: '.env.local' });
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

async function checkConnection() {
    const url = process.env.WOOCOMMERCE_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    console.log("---------------------------------------------------");
    console.log(`Probando conexión con: ${url}`);
    console.log(`Key: ${consumerKey ? consumerKey.substring(0, 5) + '...' : 'NO DEFINIDA'}`);
    console.log("---------------------------------------------------");

    if (!url || !consumerKey || !consumerSecret) {
        console.error("❌ Faltan variables de entorno en .env.local");
        return;
    }

    const api = new WooCommerceRestApi({
        url: url,
        consumerKey: consumerKey,
        consumerSecret: consumerSecret,
        version: "wc/v3"
    });

    try {
        const response = await api.get("system_status");
        if (response.status === 200) {
            console.log("✅ ¡CONEXIÓN EXITOSA!");
            console.log(`Tienda conectada: ${response.data.environment.site_url}`);
            console.log(`Versión WC: ${response.data.environment.version}`);

            // Probar traer productos para asegurar lectura de catálogo y Mapeo de Datos
            const products = await api.get("products", { per_page: 5 });
            console.log("\n📦 ANÁLISIS DE DATOS PARA MAPEO (5 Productos):");

            products.data.forEach(p => {
                console.log(`\n---------------------------------------------------`);
                console.log(`ID: ${p.id} | Nombre: ${p.name}`);
                console.log(`Precio: ${p.price} (Regular: ${p.regular_price}) | Stock: ${p.stock_quantity} (Status: ${p.stock_status})`);

                console.log("--- Meta Data (Claves Críticas) ---");
                p.meta_data.forEach(m => {
                    // Filtrar solo las que parecen relevantes para no saturar, o mostrar todas si son pocas
                    if (['net_weight', '_needs_rx', '_cadena_de_frio', '_registro_invima', '_marca', 'total_sales'].includes(m.key) || m.key.startsWith('_')) {
                        console.log(`Key: ${m.key} -> Value: ${m.value}`);
                    }
                });

                console.log("--- Atributos ---");
                p.attributes.forEach(a => {
                    console.log(`Attr: ${a.name} -> Options: ${a.options.join(', ')}`);
                });
            });
        } else {
            console.error(`⚠️ La API respondió pero con estado: ${response.status}`);
        }
    } catch (error) {
        console.error("❌ ERROR DE CONEXIÓN:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Message: ${error.response.statusText}`);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

checkConnection();
