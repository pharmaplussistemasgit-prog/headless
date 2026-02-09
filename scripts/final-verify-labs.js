const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

const tests = [
    { name: 'BAYER (Slug 684)', slug: '684' },
    { name: 'ADIUM (Slug 53)', slug: '53' },
    { name: 'INMUNOPHARMA (Slug 964)', slug: '964' },
    { name: 'ABBVIE EYE CARE (Slug abbvie-eye-care)', slug: 'abbvie-eye-care' },
    { name: 'LAFRANCOL (ID 3289)', slug: '3289' } // Testing if ID also works as a slug param
];

async function finalVerify() {
    for (const test of tests) {
        console.log(`Testing: ${test.name}`);
        const url = `https://tienda.pharmaplus.com.co/wp-json/wc/v3/products?laboratorios=${test.slug}&consumer_key=${ck}&consumer_secret=${cs}&per_page=5`;
        try {
            const data = await new Promise((resolve, reject) => {
                https.get(url, (res) => {
                    let body = '';
                    res.on('data', d => body += d);
                    res.on('end', () => resolve(JSON.parse(body)));
                }).on('error', reject);
            });
            console.log(`Results for ${test.name}: ${Array.isArray(data) ? data.length : 'Error'}`);
            if (Array.isArray(data) && data.length > 0) {
                console.log(`Sample: ${data[0].name}\n`);
            }
        } catch (e) {
            console.error(`Failed ${test.name}: ${e.message}`);
        }
    }
}

finalVerify();
