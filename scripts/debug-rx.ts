
import { getProducts } from "../lib/woocommerce";
import { mapWooProduct } from "../lib/mappers";

async function debugProducts() {
    try {
        console.log("Searching for products...");
        const { products } = await getProducts({ search: "BEXON", perPage: 5 });

        if (products.length === 0) {
            console.log("No products found for BEXON");
        }

        products.forEach(p => {
            console.log("---------------------------------------------------");
            console.log(`ID: ${p.id}`);
            console.log(`Name: ${p.name}`);
            console.log(`Categories:`, p.categories.map(c => `${c.name} (${c.slug})`).join(', '));
            console.log(`Meta Data Keys:`, p.meta_data.map(m => m.key).join(', '));

            // Check our mapper logic
            const mapped = mapWooProduct(p);
            console.log(`Mapped RequiresRx: ${mapped.requiresRx}`);

            // Debug specific logic
            const rxKeywords = ['antibiotico', 'antibiótico', 'bajo formula', 'bajo fórmula', 'controlado', 'venta bajo formula', 'formula medica'];
            const nameMatch = rxKeywords.some(k => (p.name || '').toLowerCase().includes(k));
            console.log(`Name Keyword Match: ${nameMatch}`);

            const rxCategories = ['antibioticos', 'medicamentos-controlados', 'formula-medica', 'bajo-formula'];
            const catMatch = p.categories?.some(c => rxCategories.some(slug => c.slug.includes(slug)));
            console.log(`Category Match: ${catMatch}`);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

debugProducts();
