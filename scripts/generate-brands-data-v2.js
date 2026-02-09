/**
 * Generador de Datos de Marcas v2.0
 * 
 * Versión mejorada que usa CUSTOM_API_V3.3 para obtener datos
 * de laboratorios de manera más robusta y completa.
 * 
 * Cambios principales:
 * - Usa endpoint /custom-api/v1/laboratorio (tabla personalizada)
 * - Autenticación con X-API-KEY en lugar de OAuth
 * - Soporte para hasta 500 registros por página
 * - Validación de URLs de logos
 * - Mejor manejo de errores
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
const CUSTOM_API_KEY = process.env.CUSTOM_API_KEY;

if (!WP_URL || !CUSTOM_API_KEY) {
    console.error('❌ Error: Faltan variables de entorno requeridas');
    console.error('   NEXT_PUBLIC_WP_URL:', WP_URL ? '✅' : '❌');
    console.error('   CUSTOM_API_KEY:', CUSTOM_API_KEY ? '✅' : '❌');
    process.exit(1);
}

// Mapeo manual de logos (igual que antes)
const LOGO_MAP = {
    'aulen-pharma-s-a': 'https://pharmaplushn.com/wp-content/uploads/2024/12/AULEN-PHARMA.jpg',
    'eurofarma': 'https://pharmaplushn.com/wp-content/uploads/2024/12/EUROFARMA.jpg',
    // Agregar más según sea necesario
};

/**
 * Valida si una URL de imagen es accesible
 */
async function validateImageUrl(url) {
    if (!url) return false;

    try {
        const response = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000) // 5 segundos timeout
        });
        return response.ok;
    } catch (error) {
        console.warn(`⚠️  URL no accesible: ${url}`);
        return false;
    }
}

/**
 * Obtiene todos los laboratorios desde la tabla personalizada
 */
async function fetchLaboratoriosFromCustomAPI() {
    console.log('\n🔍 Obteniendo laboratorios desde CUSTOM_API_V3.3...');

    const response = await fetch(
        `${WP_URL}/wp-json/custom-api/v1/laboratorio?per_page=500&orderby=LABORATORIO_ID&order=ASC`,
        {
            headers: {
                'X-API-KEY': CUSTOM_API_KEY,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ Total de laboratorios en tabla custom: ${data.total}`);
    console.log(`📄 Registros obtenidos: ${data.rows.length}`);

    return data.rows;
}

/**
 * Obtiene términos de la taxonomía pa_laboratorio (WordPress REST API nativa)
 * Esto nos da los slugs y nombres correctos
 */
async function fetchLaboratorioTerms() {
    console.log('\n🔍 Obteniendo términos de taxonomía pa_laboratorio...');

    let allTerms = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await fetch(
            `${WP_URL}/wp-json/wp/v2/pa_laboratorio?per_page=100&page=${page}&orderby=name&order=asc`
        );

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
        hasMore = page < totalPages;
        page++;
    }

    console.log(`✅ Total de términos de taxonomía: ${allTerms.length}`);

    return allTerms;
}

/**
 * Combina datos de tabla custom y taxonomía
 */
function mergeLaboratorioData(customData, taxonomyTerms) {
    console.log('\n🔄 Combinando datos de tabla custom y taxonomía...');

    const merged = [];
    const seenSlugs = new Set();

    // Crear un mapa de términos por slug para búsqueda rápida
    const termsBySlug = new Map();
    taxonomyTerms.forEach(term => {
        termsBySlug.set(term.slug, term);
    });

    // Procesar cada laboratorio de la tabla custom
    for (const lab of customData) {
        // Aquí necesitamos saber qué campo de la tabla custom contiene el slug
        // Por ahora asumimos que hay un campo 'slug' o 'LABORATORIO_SLUG'
        // Esto se ajustará después de ejecutar inspect-wordpress-complete.js

        const slug = lab.slug || lab.LABORATORIO_SLUG || lab.name?.toLowerCase().replace(/\s+/g, '-');

        if (!slug || seenSlugs.has(slug)) continue;

        const term = termsBySlug.get(slug);
        const logoUrl = LOGO_MAP[slug] || lab.logo_url || lab.LOGO_URL || '';

        merged.push({
            id: lab.LABORATORIO_ID || lab.id,
            termId: term?.id,
            name: lab.name || lab.LABORATORIO_NOMBRE || term?.name || '',
            slug: slug,
            logoUrl: logoUrl,
            count: term?.count || 0
        });

        seenSlugs.add(slug);
    }

    console.log(`✅ Laboratorios combinados: ${merged.length}`);

    return merged;
}

/**
 * Filtra laboratorios que tienen logo válido
 */
async function filterLabsWithValidLogos(labs) {
    console.log('\n🔍 Validando URLs de logos...');

    const labsWithLogos = [];

    for (const lab of labs) {
        if (!lab.logoUrl) continue;

        const isValid = await validateImageUrl(lab.logoUrl);

        if (isValid) {
            labsWithLogos.push(lab);
        } else {
            console.warn(`⚠️  Logo inválido para ${lab.name} (${lab.slug})`);
        }
    }

    console.log(`✅ Laboratorios con logos válidos: ${labsWithLogos.length}`);

    return labsWithLogos;
}

/**
 * Genera el archivo TypeScript con los datos
 */
function generateTypeScriptFile(allLabs, featuredLabs) {
    console.log('\n📝 Generando archivo TypeScript...');

    const content = `/**
 * Datos de Marcas/Laboratorios
 * 
 * Generado automáticamente por: scripts/generate-brands-data-v2.js
 * Fecha: ${new Date().toISOString()}
 * Fuente: CUSTOM_API_V3.3 (/custom-api/v1/laboratorio)
 * Total laboratorios: ${allLabs.length}
 * Con logos: ${featuredLabs.length}
 */

export interface Brand {
  title: string;
  slug: string;
  url: string;
  alt: string;
  id?: number;
  termId?: number;
  count?: number;
}

// Laboratorios destacados (con logos)
export const FEATURED_BRANDS: Brand[] = [
${featuredLabs.map(lab => `  {
    title: "${lab.name}",
    slug: "${lab.slug}",
    url: "${lab.logoUrl}",
    alt: "Logo ${lab.name}",
    id: ${lab.id},
    termId: ${lab.termId || 'undefined'},
    count: ${lab.count}
  }`).join(',\n')}
];

// Todos los laboratorios (para slider y búsqueda)
export const ALL_BRANDS_SLIDER: Brand[] = [
${allLabs.map(lab => `  {
    title: "${lab.name}",
    slug: "${lab.slug}",
    url: "${lab.logoUrl || ''}",
    alt: "Logo ${lab.name}",
    id: ${lab.id},
    termId: ${lab.termId || 'undefined'},
    count: ${lab.count}
  }`).join(',\n')}
];
`;

    const outputPath = path.join(process.cwd(), 'lib', 'brands-data.ts');
    fs.writeFileSync(outputPath, content, 'utf-8');

    console.log(`✅ Archivo generado: ${outputPath}`);
    console.log(`   - Total laboratorios: ${allLabs.length}`);
    console.log(`   - Con logos: ${featuredLabs.length}`);
}

/**
 * Función principal
 */
async function main() {
    console.log('\n🚀 GENERADOR DE DATOS DE MARCAS v2.0');
    console.log('='.repeat(80));

    try {
        // 1. Obtener datos de tabla custom
        const customLabs = await fetchLaboratoriosFromCustomAPI();

        // 2. Obtener términos de taxonomía
        const taxonomyTerms = await fetchLaboratorioTerms();

        // 3. Combinar datos
        const mergedLabs = mergeLaboratorioData(customLabs, taxonomyTerms);

        // 4. Filtrar los que tienen logos válidos
        const labsWithLogos = await filterLabsWithValidLogos(mergedLabs);

        // 5. Generar archivo TypeScript
        generateTypeScriptFile(mergedLabs, labsWithLogos);

        console.log('\n' + '='.repeat(80));
        console.log('✅ PROCESO COMPLETADO EXITOSAMENTE');
        console.log('='.repeat(80));
        console.log('\n📊 Estadísticas:');
        console.log(`   - Laboratorios en tabla custom: ${customLabs.length}`);
        console.log(`   - Términos en taxonomía: ${taxonomyTerms.length}`);
        console.log(`   - Laboratorios combinados: ${mergedLabs.length}`);
        console.log(`   - Con logos válidos: ${labsWithLogos.length}`);

    } catch (error) {
        console.error('\n❌ Error durante la generación:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar
main();
