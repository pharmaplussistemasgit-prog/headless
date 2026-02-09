const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';
const baseUrl = 'https://tienda.pharmaplus.com.co/wp-json/wp/v2/product_brand';

async function listBrandTerms() {
    try {
        const response = await new Promise((resolve, reject) => {
            https.get(`${baseUrl}?consumer_key=${ck}&consumer_secret=${cs}&per_page=100`, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });

        if (Array.isArray(response)) {
            const brands = response.map(t => ({ id: t.id, name: t.name, count: t.count }));
            console.log(JSON.stringify(brands, null, 2));
        } else {
            console.log('Error or empty response:', response);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listBrandTerms();
