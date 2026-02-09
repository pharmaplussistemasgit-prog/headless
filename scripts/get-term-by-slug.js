const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';
const slug = process.argv[2] || '53';
const baseUrl = 'https://tienda.pharmaplus.com.co/wp-json/wp/v2/laboratorios';

async function getTermBySlug() {
    try {
        console.log(`Searching for laboratory term with slug "${slug}"...`);
        const fetchUrl = `${baseUrl}?consumer_key=${ck}&consumer_secret=${cs}&slug=${slug}`;
        const response = await new Promise((resolve, reject) => {
            https.get(fetchUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });

        if (Array.isArray(response) && response.length > 0) {
            console.log('Term Found:');
            console.log(JSON.stringify(response[0], null, 2));
        } else {
            console.log(`No term found with slug "${slug}".`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

getTermBySlug();
