
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

interface Category {
    id: number;
    name: string;
    parent: number;
    count: number;
    slug: string;
}

interface CategoryNode extends Category {
    children: CategoryNode[];
}

async function fetchAllCategories(): Promise<Category[]> {
    let page = 1;
    let allCategories: Category[] = [];
    while (true) {
        try {
            const response = await api.get("products/categories", {
                per_page: 100,
                page: page
            });
            const data = response.data;
            if (!data || data.length === 0) break;
            allCategories = allCategories.concat(data);
            if (data.length < 100) break;
            page++;
        } catch (error) {
            console.error("Error fetching categories:", error);
            break;
        }
    }
    return allCategories;
}

function buildTree(categories: Category[]): CategoryNode[] {
    const map: Record<number, CategoryNode> = {};
    const roots: CategoryNode[] = [];

    // Init map
    categories.forEach(cat => {
        map[cat.id] = { ...cat, children: [] };
    });

    // Build hierarchy
    categories.forEach(cat => {
        if (cat.parent === 0) {
            roots.push(map[cat.id]);
        } else {
            if (map[cat.parent]) {
                map[cat.parent].children.push(map[cat.id]);
            }
        }
    });

    return roots;
}

async function run() {
    console.log("Fetching categories...");
    const categories = await fetchAllCategories();
    const tree = buildTree(categories);

    // Write to JSON file
    fs.writeFileSync('category_dump.json', JSON.stringify({
        total_categories: categories.length,
        tree: tree
    }, null, 2));

    console.log("Dump saved to category_dump.json");
}

run();
