const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

async function countActiveProducts() {
    const api = new WooCommerceRestApi({
        url: process.env.WOOCOMMERCE_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL,
        consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
        consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
        version: "wc/v3"
    });

    try {
        console.log("Consultando API de WooCommerce...");
        const response = await api.get("products", {
            status: 'publish',
            stock_status: 'instock',
            per_page: 1
        });

        const total = response.headers['x-wp-total'];
        console.log(`\n===================================================`);
        console.log(`TOTAL DE PRODUCTOS LISTOS PARA VENTA (con stock): ${total}`);
        console.log(`===================================================\n`);
    } catch (error) {
        console.error("Error consultando WooCommerce:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

countActiveProducts();
