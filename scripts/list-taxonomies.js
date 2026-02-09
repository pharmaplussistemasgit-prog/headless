const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';
const baseUrl = 'https://tienda.pharmaplus.com.co/wp-json/wp/v2/taxonomies';

async function listTaxonomies() {
    try {
        const response = await new Promise((resolve, reject) => {
            https.get(`${baseUrl}?consumer_key=${ck}&consumer_secret=${cs}`, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });

        console.log('--- Taxonomies ---');
        for (const key in response) {
            const tax = response[key];
            if (tax.types.includes('product')) {
                console.log(`Slug: ${key}, Name: ${tax.name}`);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listTaxonomies();
