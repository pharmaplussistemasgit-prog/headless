/**
 * Descubrir qué taxonomías están disponibles en WordPress
 */

const WP_URL = 'https://tienda.pharmaplus.com.co';

async function discoverTaxonomies() {
    console.log('🔍 Descubriendo taxonomías disponibles...\n');

    // Intentar obtener la lista de taxonomías
    const url = `${WP_URL}/wp-json/wp/v2/taxonomies`;
    console.log(`📡 URL: ${url}\n`);

    try {
        const response = await fetch(url);

        console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

        if (!response.ok) {
            console.error(`❌ No se pudo obtener la lista de taxonomías`);
            return;
        }

        const taxonomies = await response.json();

        console.log(`✅ Taxonomías disponibles:\n`);
        for (const [key, tax] of Object.entries(taxonomies)) {
            console.log(`   - ${key}:`);
            console.log(`     Nombre: ${tax.name}`);
            console.log(`     REST Base: ${tax.rest_base || 'N/A'}`);
            console.log(`     Tipos: ${tax.types?.join(', ') || 'N/A'}`);
            console.log('');
        }

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
    }
}

async function testProductAttributes() {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 Probando atributos de productos WooCommerce...\n');

    // Probar el endpoint que ya sabemos que funciona
    const url = `${WP_URL}/wp-json/wc/v3/products/attributes`;
    console.log(`📡 URL: ${url}\n`);

    try {
        const response = await fetch(url);

        console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

        if (response.status === 401) {
            console.log(`⚠️  Requiere autenticación OAuth (esperado)`);
            console.log(`   Usa WooCommerce Consumer Key/Secret\n`);
            return;
        }

        if (!response.ok) {
            const text = await response.text();
            console.log(`Respuesta: ${text}\n`);
            return;
        }

        const attributes = await response.json();
        console.log(`✅ Atributos disponibles:`);
        console.log(JSON.stringify(attributes, null, 2));

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
    }
}

async function main() {
    await discoverTaxonomies();
    await testProductAttributes();
}

main();
