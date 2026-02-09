/**
 * Inspección de WordPress usando APIs NATIVAS
 * 
 * Este script usa SOLO las APIs que están disponibles por defecto:
 * - WordPress REST API (/wp/v2/)
 * - WooCommerce REST API (/wc/v3/)
 * 
 * NO requiere plugins adicionales
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WP_URL = 'https://tienda.pharmaplus.com.co';

// 1. Inspeccionar taxonomía de laboratorios (WordPress REST API nativa)
async function inspectLaboratoriosTaxonomy() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 INSPECCIONANDO TAXONOMÍA: pa_laboratorio');
    console.log('='.repeat(80));

    let allTerms = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const url = `${WP_URL}/wp-json/wp/v2/pa_laboratorio?per_page=100&page=${page}&orderby=name&order=asc`;
        console.log(`\n🔍 Consultando página ${page}...`);

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 400) {
                hasMore = false;
                break;
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const terms = await response.json();
        allTerms = allTerms.concat(terms);

        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
        const total = parseInt(response.headers.get('X-WP-Total') || '0');

        console.log(`   ✅ Obtenidos ${terms.length} términos`);
        console.log(`   📄 Página ${page} de ${totalPages}`);
        console.log(`   📊 Total: ${total}`);

        hasMore = page < totalPages;
        page++;
    }

    console.log(`\n✅ Total de laboratorios: ${allTerms.length}`);

    if (allTerms.length > 0) {
        console.log(`\n📊 Estructura de término:`);
        const term = allTerms[0];
        console.log(JSON.stringify(term, null, 2));

        console.log(`\n📝 Campos disponibles:`);
        Object.keys(term).forEach((key, idx) => {
            console.log(`   ${idx + 1}. ${key}: ${typeof term[key]}`);
        });
    }

    return allTerms;
}

// 2. Buscar si hay meta de logos en los términos
async function checkTermMeta(termId) {
    const url = `${WP_URL}/wp-json/wp/v2/pa_laboratorio/${termId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const term = await response.json();
        return term;
    } catch (error) {
        return null;
    }
}

// Función principal
async function main() {
    console.log('\n🚀 INSPECCIÓN DE WORDPRESS (APIs Nativas)');
    console.log(`📍 URL: ${WP_URL}`);
    console.log('🔓 Sin autenticación (APIs públicas)');

    const report = {
        timestamp: new Date().toISOString(),
        wpUrl: WP_URL,
        apis: {
            wordpress: '/wp/v2/',
            woocommerce: '/wc/v3/'
        },
        data: {}
    };

    try {
        // 1. Taxonomía de laboratorios
        const labs = await inspectLaboratoriosTaxonomy();
        report.data.laboratorios = labs;

        // 2. Verificar si algún término tiene meta de logo
        if (labs.length > 0) {
            console.log('\n' + '='.repeat(80));
            console.log('🔍 VERIFICANDO META DE LOGOS');
            console.log('='.repeat(80));

            const sampleTerm = await checkTermMeta(labs[0].id);
            if (sampleTerm) {
                console.log('\n📊 Término completo (con posible meta):');
                console.log(JSON.stringify(sampleTerm, null, 2));
            }
        }

        // Guardar reporte
        const reportPath = path.join(process.cwd(), 'wordpress-native-inspection.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('\n' + '='.repeat(80));
        console.log('✅ INSPECCIÓN COMPLETADA');
        console.log('='.repeat(80));
        console.log(`\n📄 Reporte guardado en: ${reportPath}`);
        console.log(`\n📊 Resumen:`);
        console.log(`   - Laboratorios encontrados: ${labs.length}`);
        console.log(`   - API usada: WordPress REST API nativa`);
        console.log(`   - Autenticación: No requerida`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
