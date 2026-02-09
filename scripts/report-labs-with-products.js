const fs = require('fs');

// Leer laboratorios
const labs = JSON.parse(fs.readFileSync('scripts/all_active_labs.json', 'utf8'));

// Filtrar solo los que tienen productos (count > 0)
const labsWithProducts = labs.filter(l => l.count > 0);

// Ordenar por count descendente
labsWithProducts.sort((a, b) => b.count - a.count);

console.log(`\n=== LABORATORIOS CON PRODUCTOS (${labsWithProducts.length} total) ===\n`);
console.log('ID\t\tNOMBRE\t\t\t\t\t\tSLUG\t\t\t\tPRODUCTOS');
console.log('─'.repeat(120));

labsWithProducts.forEach(lab => {
    const id = lab.id.toString().padEnd(8);
    const name = lab.name.substring(0, 40).padEnd(42);
    const slug = lab.slug.substring(0, 30).padEnd(32);
    const count = lab.count.toString().padStart(4);
    console.log(`${id}${name}${slug}${count}`);
});

// Guardar también en archivo
const report = labsWithProducts.map(l => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    count: l.count
}));

fs.writeFileSync('scripts/labs_report.json', JSON.stringify(report, null, 2));
console.log(`\n✓ Reporte guardado en scripts/labs_report.json`);
