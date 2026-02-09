const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

// We'll search for products in the 'laboratorios' taxonomy with ID 3289 (LAFRANCOL)
const labId = process.argv[2] || '3289';

async function debugProduct() {
    // 1. Get products in that lab
    const url = `https://tienda.pharmaplus.com.co/wp-json/wc/v3/products?laboratorios=${labId}&consumer_key=${ck}&consumer_secret=${cs}&per_page=1`;

    try {
        console.log(`Fetching product for lab ${labId}...`);
        const products = await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let body = '';
                res.on('data', d => body += d);
                res.on('end', () => resolve(JSON.parse(body)));
            }).on('error', reject);
        });

        if (Array.isArray(products) && products.length > 0) {
            const product = products[0];
            console.log('--- Product Basic Info ---');
            console.log(`ID: ${product.id}`);
            console.log(`Name: ${product.name}`);
            console.log(`SKU: ${product.sku}`);

            // 2. Fetch full product data (including meta via custom API)
            console.log('\n--- Fetching Full Data via Custom API ---');
            const customUrl = `https://tienda.pharmaplus.com.co/wp-json/custom-api/v1/product/sku/${product.sku}`;
            const customData = await new Promise((resolve, reject) => {
                const req = https.get(customUrl, { headers: { 'X-API-KEY': '53c6-e971-d6a9-8ba2' } }, (res) => {
                    let body = '';
                    res.on('data', d => body += d);
                    res.on('end', () => resolve(JSON.parse(body)));
                });
                req.on('error', reject);
            });

            console.log(JSON.stringify(customData, null, 2));
        } else {
            console.log('No products found for this laboratory ID.');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

debugProduct();
