const API = require('@woocommerce/woocommerce-rest-api').default;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const api = new API({
    url: process.env.WOOCOMMERCE_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL,
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
    version: "wc/v3"
});

async function getAllCategories() {
    let page = 1;
    let allCategories = [];
    let fetchMore = true;

    console.log("⏳ Descargando TODAS las categorías...");

    while (fetchMore) {
        try {
            const response = await api.get("products/categories", {
                per_page: 100,
                page: page,
                hide_empty: false // Queremos ver todas, incluso vacías si existen
            });

            const categories = response.data;
            if (categories.length === 0) {
                fetchMore = false;
            } else {
                allCategories = allCategories.concat(categories);
                page++;
            }
        } catch (error) {
            console.error("❌ Error fetching categories:", error.response ? error.response.data : error.message);
            fetchMore = false;
        }
    }

    console.log(`✅ Total categorías encontradas: ${allCategories.length}`);
    return allCategories;
}

function buildHierarchy(categories) {
    const categoryMap = {};
    const rootCategories = [];

    // 1. Mapa ID -> Categoria con array de hijos vacío
    categories.forEach(cat => {
        categoryMap[cat.id] = { ...cat, children: [] };
    });

    // 2. Asignar hijos a padres
    categories.forEach(cat => {
        if (cat.parent === 0) {
            rootCategories.push(categoryMap[cat.id]);
        } else {
            if (categoryMap[cat.parent]) {
                categoryMap[cat.parent].children.push(categoryMap[cat.id]);
            } else {
                // Caso raro: Huérfano (padre no encontrado o borrado), lo tratamos como root por seguridad
                console.warn(`⚠️ Categoría '${cat.name}' tiene padre ID ${cat.parent} que no existe. Movida a raíz.`);
                rootCategories.push(categoryMap[cat.id]);
            }
        }
    });

    // 3. Ordenar alfabéticamente
    const sortCats = (cats) => cats.sort((a, b) => a.name.localeCompare(b.name));

    sortCats(rootCategories);
    const sortRecursive = (cats) => {
        cats.forEach(c => {
            if (c.children.length > 0) {
                sortCats(c.children);
                sortRecursive(c.children);
            }
        });
    };
    sortRecursive(rootCategories);

    return rootCategories;
}

async function run() {
    const categories = await getAllCategories();
    const hierarchy = buildHierarchy(categories);

    // Generar reporte de texto
    let report = "REPORTE DE JERARQUÍA DE CATEGORÍAS\n";
    report += "===================================\n\n";

    hierarchy.forEach(parent => {
        report += `${parent.name.toUpperCase()} (ID: ${parent.id}) - Total Productos: ${parent.count}\n`;

        if (parent.children.length > 0) {
            parent.children.forEach(child => {
                report += `- ${child.name} = ${child.count}\n`;
                // Si hay nietos (nivel 3)
                if (child.children.length > 0) {
                    child.children.forEach(grandchild => {
                        report += `  * ${grandchild.name} = ${grandchild.count}\n`;
                    });
                }
            });
        } else {
            report += `  (Sin subcategorías)\n`;
        }
        report += "\n";
    });

    // Guardar JSON
    const jsonPath = path.join(__dirname, '../category_hierarchy_mapping.json');
    fs.writeFileSync(jsonPath, JSON.stringify(hierarchy, null, 2));
    console.log(`💾 JSON guardado en: ${jsonPath}`);

    // Guardar Reporte TXT
    const txtPath = path.join(__dirname, '../category_hierarchy_report.txt');
    fs.writeFileSync(txtPath, report);
    console.log(`📄 Reporte TXT guardado en: ${txtPath}`);

    console.log("\n----- VISTA PREVIA DEL REPORTE -----\n");
    console.log(report);
}

run();
