const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

// We'll try both wc/v3 (standard) and wp/v2 (post API)
async function testFilters() {
    const filters = [
        { name: 'WC v3 with laboratorios param (Numerical ID 2948 for Adium)', url: `https://tienda.pharmaplus.com.co/wp-json/wc/v3/products?laboratorios=2948&consumer_key=${ck}&consumer_secret=${cs}` },
        { name: 'WP v2 with laboratorios param (Numerical ID 2948 for Adium)', url: `https://tienda.pharmaplus.com.co/wp-json/wp/v2/product?laboratorios=2948&consumer_key=${ck}&consumer_secret=${cs}` },
        { name: 'WC v3 with Abbvie Eye Care (ID 3292 - has count 23)', url: `https://tienda.pharmaplus.com.co/wp-json/wc/v3/products?laboratorios=3292&consumer_key=${ck}&consumer_secret=${cs}` }
    ];

    for (const f of filters) {
        console.log(`Testing: ${f.name}`);
        try {
            const data = await new Promise((resolve, reject) => {
                https.get(f.url, (res) => {
                    let body = '';
                    res.on('data', d => body += d);
                    res.on('end', () => resolve(JSON.parse(body)));
                }).on('error', reject);
            });
            console.log(`Results: ${Array.isArray(data) ? data.length : 'Error'}`);
            if (Array.isArray(data) && data.length > 0) {
                console.log(`First product: ${data[0].name || data[0].title.rendered}`);
            }
        } catch (e) {
            console.error(`Failed ${f.name}: ${e.message}`);
        }
    }
}

testFilters();
