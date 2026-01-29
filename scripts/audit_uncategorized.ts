
import API from "@woocommerce/woocommerce-rest-api";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const api = new API({
    url: process.env.WOOCOMMERCE_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL || "",
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || "",
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || "",
    version: "wc/v3"
});

async function run() {
    console.log("Fetching sample of 'Uncategorized' (cat ID: 15) products...");

    try {
        const response = await api.get("products", {
            category: "3391", // ID for OTROS PRODUCTOS
            per_page: 20,   // Sample size
            status: 'publish'
        });

        const products = response.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock_status,
            tags: p.tags.map((t: any) => t.name),
            date_created: p.date_created
        }));

        console.log(`Found ${products.length} sample products.`);

        fs.writeFileSync('uncategorized_sample.json', JSON.stringify(products, null, 2));
        console.log("Sample saved to uncategorized_sample.json");

    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

run();
