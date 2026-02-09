const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

const searchTerm = process.argv[2] || 'ADIUM';

async function debugSearch() {
    const url = `https://tienda.pharmaplus.com.co/wp-json/wc/v3/products?search=${encodeURIComponent(searchTerm)}&consumer_key=${ck}&consumer_secret=${cs}&per_page=5`;

    try {
        console.log(`Searching for products with "${searchTerm}"...`);
        const products = await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let body = '';
                res.on('data', d => body += d);
                res.on('end', () => resolve(JSON.parse(body)));
            }).on('error', reject);
        });

        if (Array.isArray(products) && products.length > 0) {
            for (const p of products) {
                console.log(`\nPRODUCT: ${p.name} (ID: ${p.id}, SKU: ${p.sku})`);

                // Fetch full taxonomies from WP API for this product
                const wpUrl = `https://tienda.pharmaplus.com.co/wp-json/wp/v2/product/${p.id}?consumer_key=${ck}&consumer_secret=${cs}`;
                const wpData = await new Promise((resolve, reject) => {
                    https.get(wpUrl, (res) => {
                        let body = '';
                        res.on('data', d => body += d);
                        res.on('end', () => resolve(JSON.parse(body)));
                    }).on('error', reject);
                });

                if (wpData.laboratorios) {
                    console.log(`Laboratorios IDs assigned: ${wpData.laboratorios.join(', ')}`);
                } else {
                    console.log(`No laboratorios assigned in WP data.`);
                }
            }
        } else {
            console.log('No products found.');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

debugSearch();
