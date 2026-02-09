const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';
const baseUrl = 'https://tienda.pharmaplus.com.co/wp-json/wc/v3/products/categories';

async function listCategories() {
    let allCategories = [];
    let page = 1;

    try {
        while (true) {
            const fetchUrl = `${baseUrl}?consumer_key=${ck}&consumer_secret=${cs}&per_page=100&page=${page}`;
            const response = await new Promise((resolve, reject) => {
                https.get(fetchUrl, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => {
                        try {
                            const parsed = JSON.parse(data);
                            resolve(parsed);
                        } catch (e) {
                            reject(e);
                        }
                    });
                }).on('error', reject);
            });

            if (Array.isArray(response) && response.length > 0) {
                allCategories = allCategories.concat(response);
            } else {
                break;
            }
            page++;
        }

        const interesting = allCategories.filter(c =>
            /adium/i.test(c.name) ||
            /abbv/i.test(c.name) ||
            /heel/i.test(c.name) ||
            /mark/i.test(c.name) ||
            /lab/i.test(c.name)
        ).map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            count: c.count
        }));

        console.log(JSON.stringify(interesting, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listCategories();
