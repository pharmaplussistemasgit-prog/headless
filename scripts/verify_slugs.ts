
import { getAllProductCategories } from '../lib/woocommerce';

async function main() {
    console.log("Fetching categories...");
    const cats = await getAllProductCategories();

    const targetNames = [
        'Protección Solar', 'Antiedad', 'Hidratantes', 'Despigmentantes',
        'Limpiadores', 'Piel Grasa', 'Exfoliantes', 'Ojos', 'Maquillaje', 'Reparador'
    ];

    console.log("\n--- SEARCH RESULTS ---");
    targetNames.forEach(name => {
        const found = cats.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
        if (found.length > 0) {
            found.forEach(f => {
                console.log(`Name: "${f.name}" | ID: ${f.id} | Slug: "${f.slug}" | Parent: ${f.parent}`);
            });
        } else {
            console.log(`❌ Not found: ${name}`);
        }
    });
}

main();
