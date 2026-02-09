const https = require('https');

const url = 'https://tienda.pharmaplus.com.co/wp-json/wc/v3/products/categories';
const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

async function fetchAllCategories() {
    let allCategories = [];
    let page = 1;
    let totalPages = 1;

    try {
        while (page <= totalPages) {
            const fetchUrl = `${url}?consumer_key=${ck}&consumer_secret=${cs}&per_page=100&page=${page}`;
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
                allCategories = allCategories.concat(response);
            }
            page++;
        }

        console.log(`Total categories fetched: ${allCategories.length}`);

        const labs = allCategories.filter(c =>
            c.name.toLowerCase().includes('heel') ||
            c.name.toLowerCase().includes('inmun') ||
            c.name.toLowerCase().includes('adium') ||
            c.name.toLowerCase().includes('abbvie') ||
            c.name.toLowerCase().includes('laboratorio') ||
            c.parent === 0 // Root categories might be interesting
        );

        console.log('--- Interesting Categories ---');
        labs.forEach(c => {
            console.log(`ID: ${c.id} | Name: ${c.name} | Slug: ${c.slug} | Parent: ${c.parent} | Count: ${c.count}`);
        });

    } catch (error) {
        console.error('Error fetching categories:', error.message);
    }
}

fetchAllCategories();
