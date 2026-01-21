
import { getAllProductCategories } from '../lib/woocommerce';

async function verifyMapping() {
    console.log("🔍 Verificando mapeo de categorías...");
    try {
        const categories = await getAllProductCategories();

        // 1. Buscamos específicamente categorías relacionadas con "Frio"
        const coldChainCats = categories.filter(c =>
            c.name.toLowerCase().includes('frio') ||
            c.name.toLowerCase().includes('frío') ||
            c.slug.includes('frio') ||
            c.slug.includes('frío')
        );

        console.log(`\n📦 Total Categorías encontradas: ${categories.length}`);

        if (coldChainCats.length > 0) {
            console.log("\n✅ ¡Categoría 'Cadena de Frío' ENCONTRADA en WooCommerce!");
            console.table(coldChainCats.map(c => ({
                ID: c.id,
                Name: c.name,
                Slug: c.slug,
                Count: c.count
            })));
            console.log("\nNOTA: El 'Slug' es lo que usamos en la URL. Ejemplo: /categoria/[slug]");
        } else {
            console.error("\n❌ ALERTA: No se encontró ninguna categoría con nombre 'Frio' o 'Frío'.");
            console.log("Por favor revisa que en WooCommerce la categoría esté creada y publicada.");
        }

    } catch (error) {
        console.error("Error ejecutando verificación:", error);
    }
}

verifyMapping();
