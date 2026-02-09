const https = require('https');

// Custom API headers
const headers = {
    'X-API-KEY': '53c6-e971-d6a9-8ba2'
};

const baseUrl = 'https://tienda.pharmaplus.com.co/wp-json/custom-api/v1/laboratorio';

async function listCustomLabs() {
    try {
        console.log(`Fetching laboratory list from custom API...`);
        const response = await new Promise((resolve, reject) => {
            const req = https.get(baseUrl, { headers }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            });
            req.on('error', reject);
        });

        if (response.success && response.rows) {
            console.log(`Found ${response.rows.length} laboratories.`);
            console.log(JSON.stringify(response.rows, null, 2));
        } else {
            console.log('Error or no rows found:', response);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listCustomLabs();
