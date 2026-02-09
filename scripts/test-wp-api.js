/**
 * Test simple de WordPress REST API nativa
 */

const WP_URL = 'https://tienda.pharmaplus.com.co';

async function testWordPressAPI() {
    console.log('🔍 Probando WordPress REST API nativa...\n');

    const url = `${WP_URL}/wp-json/wp/v2/pa_laboratorio?per_page=5`;
    console.log(`📡 URL: ${url}\n`);

    try {
        const response = await fetch(url);

        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        console.log(`📄 Headers:`);
        console.log(`   Total: ${response.headers.get('X-WP-Total')}`);
        console.log(`   Total Pages: ${response.headers.get('X-WP-TotalPages')}`);

        if (!response.ok) {
            const text = await response.text();
            console.error(`\n❌ Error: ${text}`);
            process.exit(1);
        }

        const data = await response.json();

        console.log(`\n✅ Éxito! Obtenidos ${data.length} laboratorios`);
        console.log(`\n📝 Primer laboratorio:`);
        console.log(JSON.stringify(data[0], null, 2));

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

testWordPressAPI();
