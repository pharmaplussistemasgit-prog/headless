
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
    console.log("Checking Uncategorized Candidates...");

    const checkIds = [15, 539];
    const checkSlugs = ['uncategorized', 'sin-categorizar', 'ninguna'];

    for (const id of checkIds) {
        try {
            const res = await api.get(`products/categories/${id}`);
            console.log(`ID ${id}: Found "${res.data.name}" (Slug: ${res.data.slug}) - Count: ${res.data.count}`);
        } catch (e: any) {
            console.log(`ID ${id}: Not found (${e.response?.status || e.message})`);
        }
    }

    // Check by Slugs (fetching all and filtering because search param is fuzzy)
    try {
        const res = await api.get("products/categories", {
            search: "cate",
            per_page: 20
        });
        const matches = res.data.filter((c: any) => checkSlugs.includes(c.slug));

        matches.forEach((c: any) => {
            console.log(`Slug Match "${c.slug}": ID ${c.id} - Name "${c.name}" - Count: ${c.count}`);
        });

    } catch (e) {
        console.error("Error searching slugs", e);
    }
}

run();
