const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';
const baseUrl = 'https://tienda.pharmaplus.com.co/wp-json/wp/v2/laboratorios';

async function listLaboratorios() {
    let allTerms = [];
    let page = 1;
    let totalPages = 1;

    try {
        while (page <= totalPages) {
            const fetchUrl = `${baseUrl}?consumer_key=${ck}&consumer_secret=${cs}&per_page=100&page=${page}`;
            const response = await new Promise((resolve, reject) => {
                https.get(fetchUrl, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => {
                        const totalPagesHeader = res.headers['x-wp-totalpages'];
                        if (totalPagesHeader) totalPages = parseInt(totalPagesHeader);
                        resolve(JSON.parse(data));
                    });
                }).on('error', reject);
            });

            if (Array.isArray(response)) {
                allTerms = allTerms.concat(response);
            } else {
                break;
            }
            page++;
        }

        console.log(`Total laboratorios fetched: ${allTerms.length}`);

        const интересные = allTerms.filter(t =>
            t.name.toLowerCase().includes('heel') ||
            t.name.toLowerCase().includes('inmun') ||
            t.name.toLowerCase().includes('adium') ||
            t.name.toLowerCase().includes('abbv') ||
            t.name.toLowerCase().includes('lafrancol') ||
            t.slug.toLowerCase().includes('lafrancol') ||
            /^\d+$/.test(t.name)
        );

        console.log('--- Interesting Laboratorios ---');
        интересные.forEach(t => {
            console.log(`ID: ${t.id} | Name: ${t.name} | Slug: ${t.slug} | Count: ${t.count}`);
        });

        // Print first 10 for reference
        console.log('--- First 10 Sample ---');
        allTerms.slice(0, 10).forEach(t => {
            console.log(`ID: ${t.id} | Name: ${t.name} | Slug: ${t.slug} | Count: ${t.count}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listLaboratorios();
