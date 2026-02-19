
const fs = require('fs');

const WOO_CK = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const WOO_CS = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';
const WOO_URL = 'https://tienda.pharmaplus.com.co';

async function fetchProducts(search: string) {
    const url = `${WOO_URL}/wp-json/wc/v3/products?search=${search}&consumer_key=${WOO_CK}&consumer_secret=${WOO_CS}`;
    fs.appendFileSync('debug-output.txt', `Fetching: ${url}\n`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            fs.appendFileSync('debug-output.txt', `Error: ${response.status} ${response.statusText}\n`);
            return;
        }

        const products = await response.json();
        fs.appendFileSync('debug-output.txt', `Found ${products.length} products for "${search}"\n`);

        products.forEach((p: any) => {
            fs.appendFileSync('debug-output.txt', "---------------------------------------------------\n");
            fs.appendFileSync('debug-output.txt', `ID: ${p.id}\n`);
            fs.appendFileSync('debug-output.txt', `Name: ${p.name}\n`);
            fs.appendFileSync('debug-output.txt', `Categories: ${p.categories?.map((c: any) => `[${c.id}] ${c.name} (${c.slug})`).join(', ')}\n`);

            const rxMeta = p.meta_data?.find((m: any) => m.key === '_needs_rx' || m.key === 'requires_prescription');
            fs.appendFileSync('debug-output.txt', `Rx Meta: ${JSON.stringify(rxMeta)}\n`);

            // Replicate Logic
            const rxKeywords = ['antibiotico', 'antibiótico', 'bajo formula', 'bajo fórmula', 'controlado', 'venta bajo formula', 'formula medica'];
            const rxCategories = ['antibioticos', 'medicamentos-controlados', 'formula-medica', 'bajo-formula'];

            const hasRxCategory = p.categories?.some((c: any) => rxCategories.some(slug => c.slug.includes(slug)));
            const hasRxKeyword = rxKeywords.some(k => (p.name || '').toLowerCase().includes(k));
            const isMetaRx = rxMeta && (rxMeta.value === 'true' || rxMeta.value === true || rxMeta.value === 'yes' || rxMeta.value === 'on');

            fs.appendFileSync('debug-output.txt', `LOGIC CHECK:\n`);
            fs.appendFileSync('debug-output.txt', `- Meta Match: ${isMetaRx}\n`);
            fs.appendFileSync('debug-output.txt', `- Category Match: ${hasRxCategory}\n`);
            fs.appendFileSync('debug-output.txt', `- Keyword Match: ${hasRxKeyword}\n`);
            fs.appendFileSync('debug-output.txt', `=> REQUIRES RX: ${isMetaRx || hasRxCategory || hasRxKeyword}\n`);
        });

    } catch (error) {
        fs.appendFileSync('debug-output.txt', `Fetch Error: ${error}\n`);
    }
}

async function debug() {
    fs.writeFileSync('debug-output.txt', ''); // Clear file
    await fetchProducts("KOACT");
    await fetchProducts("BEXON");
    await fetchProducts("CLINDAMICINA");
}

debug();
