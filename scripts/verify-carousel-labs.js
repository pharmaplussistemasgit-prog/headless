const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

const labsToTest = [
    { name: 'LAFRANCOL', id: 3289 },
    { name: 'PROCAPS', id: 3281 },
    { name: 'SIEGFRIED', id: 3291 },
    { name: 'BUSSIE', id: 3286 },
    { name: 'EUROFARMA', id: 3282 },
    { name: 'PFIZER', id: 3327 },
    { name: 'TECNOQUIMICAS', id: 3293 },
    { name: 'AstraZeneca', id: 3298 },
    { name: 'ABBVIE', id: 3292 },
    { name: 'AXON PHARMA', id: 3308 }
];

async function verifyActiveLabs() {
    let results = [];
    for (const lab of labsToTest) {
        // Using WP v2 endpoint
        const url = `https://tienda.pharmaplus.com.co/wp-json/wp/v2/product?laboratorios=${lab.id}&consumer_key=${ck}&consumer_secret=${cs}&per_page=1`;

        try {
            const data = await new Promise((resolve, reject) => {
                https.get(url, (res) => {
                    let body = '';
                    res.on('data', d => body += d);
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            reject(e);
                        }
                    });
                }).on('error', reject);
            });

            if (Array.isArray(data)) {
                results.push(`${lab.name}: ${data.length > 0 ? 'OK' : 'EMPTY'}`);
            } else {
                results.push(`${lab.name}: ERROR`);
            }
        } catch (e) {
            results.push(`${lab.name}: FAILED`);
        }
    }
    console.log('\n--- VERIFICATION RESULTS ---');
    console.log(results.join(' | '));
}

verifyActiveLabs();
