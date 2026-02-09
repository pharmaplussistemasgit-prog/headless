const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

// 3289 is LAFRANCOL which has 194 products
const labId = '3289';

async function verifyWPv2() {
    console.log(`Testing WP v2 filtering for laboratorios=${labId}...`);
    const url = `https://tienda.pharmaplus.com.co/wp-json/wp/v2/product?laboratorios=${labId}&consumer_key=${ck}&consumer_secret=${cs}&per_page=5`;

    try {
        const data = await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let body = '';
                res.on('data', d => body += d);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(new Error(`Failed to parse: ${body.substring(0, 100)}`));
                    }
                });
            }).on('error', reject);
        });

        if (Array.isArray(data)) {
            console.log(`Found ${data.length} products filtering by ID ${labId}`);
            data.forEach(p => console.log(`- ${p.title.rendered} (ID: ${p.id})`));
        } else {
            console.log('Error or unexpected response:', data);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

verifyWPv2();
