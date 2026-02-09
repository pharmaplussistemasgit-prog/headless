const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

async function testFilters() {
    const filters = [
        { name: 'LAFRANCOL (ID 3289 - count 194)', id: 3289 },
        { name: 'ABBVIE EYE CARE (ID 3292 - count 23)', id: 3292 },
        { name: 'TECNOQUIMICAS MK (ID 3293 - count 144)', id: 3293 },
        { name: 'HEEL (ID 3345 - count 1)', id: 3345 },
        { name: 'ADIUM (Failing ID 2948 - count 0)', id: 2948 }
    ];

    for (const f of filters) {
        console.log(`Testing: ${f.name}`);
        const url = `https://tienda.pharmaplus.com.co/wp-json/wc/v3/products?laboratorios=${f.id}&consumer_key=${ck}&consumer_secret=${cs}`;
        try {
            const data = await new Promise((resolve, reject) => {
                https.get(url, (res) => {
                    let body = '';
                    res.on('data', d => body += d);
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            reject(new Error(`Failed to parse response: ${body.substring(0, 100)}`));
                        }
                    });
                }).on('error', reject);
            });
            console.log(`Results for ${f.name}: ${Array.isArray(data) ? data.length : 'Error'}`);
            if (Array.isArray(data) && data.length > 0) {
                console.log(`Sample product: ${data[0].name}`);
            }
        } catch (e) {
            console.error(`Failed ${f.name}: ${e.message}`);
        }
    }
}

testFilters();
