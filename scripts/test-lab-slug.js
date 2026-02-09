const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

const labSlug = process.argv[2] || '53';

async function testSlug() {
    const url = `https://tienda.pharmaplus.com.co/wp-json/wc/v3/products?laboratorios=${labSlug}&consumer_key=${ck}&consumer_secret=${cs}&per_page=5`;

    try {
        console.log(`Testing filter for laboratorios=${labSlug}...`);
        const data = await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let body = '';
                res.on('data', d => body += d);
                res.on('end', () => resolve(JSON.parse(body)));
            }).on('error', reject);
        });

        console.log(`Results: ${Array.isArray(data) ? data.length : 'Error'}`);
        if (Array.isArray(data) && data.length > 0) {
            console.log(`Sample product: ${data[0].name}`);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testSlug();
