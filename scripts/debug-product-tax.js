const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

const productId = process.argv[2] || '20267';

async function debugTax() {
    // We use the WP API to see the actual term IDs assigned to the 'laboratorios' field
    const url = `https://tienda.pharmaplus.com.co/wp-json/wp/v2/product/${productId}?consumer_key=${ck}&consumer_secret=${cs}`;

    try {
        console.log(`Fetching taxonomy info for product ${productId}...`);
        const data = await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let body = '';
                res.on('data', d => body += d);
                res.on('end', () => resolve(JSON.parse(body)));
            }).on('error', reject);
        });

        if (data.id) {
            console.log(`Product: ${data.title.rendered}`);
            console.log(`Laboratorios IDs: ${JSON.stringify(data.laboratorios)}`);

            // For each ID, let's see its name and slug
            if (data.laboratorios && data.laboratorios.length > 0) {
                for (const lid of data.laboratorios) {
                    const tUrl = `https://tienda.pharmaplus.com.co/wp-json/wp/v2/laboratorios/${lid}?consumer_key=${ck}&consumer_secret=${cs}`;
                    const tData = await new Promise((resolve, resolveReject) => {
                        https.get(tUrl, (res) => {
                            let tBody = '';
                            res.on('data', d => tBody += d);
                            res.on('end', () => resolve(JSON.parse(tBody)));
                        }).on('error', resolveReject);
                    });
                    console.log(`Term ID ${lid}: Name="${tData.name}", Slug="${tData.slug}"`);
                }
            }
        } else {
            console.log('Product not found or error:', data);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

debugTax();
