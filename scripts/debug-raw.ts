
const WOO_CK = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const WOO_CS = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';
const WOO_URL = 'https://tienda.pharmaplus.com.co';

async function fetchProducts(search: string) {
    const url = `${WOO_URL}/wp-json/wc/v3/products?search=${search}&consumer_key=${WOO_CK}&consumer_secret=${WOO_CS}`;
    console.log(`Fetching: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            return;
        }

        const products = await response.json();
        console.log(`Found ${products.length} products for "${search}"`);

        products.forEach((p: any) => {
            console.log("---------------------------------------------------");
            console.log(`ID: ${p.id}`);
            console.log(`Name: ${p.name}`);
            console.log(`Categories:`, p.categories?.map((c: any) => `[${c.id}] ${c.name} (${c.slug})`).join(', '));

            const rxMeta = p.meta_data?.find((m: any) => m.key === '_needs_rx' || m.key === 'requires_prescription');
            console.log(`Rx Meta:`, rxMeta);

            // Replicate Logic
            const rxKeywords = ['antibiotico', 'antibiótico', 'bajo formula', 'bajo fórmula', 'controlado', 'venta bajo formula', 'formula medica'];
            const rxCategories = ['antibioticos', 'medicamentos-controlados', 'formula-medica', 'bajo-formula'];

            const hasRxCategory = p.categories?.some((c: any) => rxCategories.some(slug => c.slug.includes(slug)));
            const hasRxKeyword = rxKeywords.some(k => (p.name || '').toLowerCase().includes(k));
            const isMetaRx = rxMeta && (rxMeta.value === 'true' || rxMeta.value === true || rxMeta.value === 'yes' || rxMeta.value === 'on');

            console.log(`LOGIC CHECK:`);
            console.log(`- Meta Match: ${isMetaRx}`);
            console.log(`- Category Match: ${hasRxCategory}`);
            console.log(`- Keyword Match: ${hasRxKeyword}`);
            console.log(`=> REQUIRES RX: ${isMetaRx || hasRxCategory || hasRxKeyword}`);
        });

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

async function debug() {
    await fetchProducts("KOACT");
    await fetchProducts("BEXON");
    await fetchProducts("CLINDAMICINA"); // Also check generic
}

debug();
