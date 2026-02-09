const https = require('https');
const fs = require('fs');

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
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            reject(e);
                        }
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

        // Incluir TODOS los laboratorios, no solo los que tienen productos
        const filtered = allTerms.map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            count: t.count
        }));

        fs.writeFileSync('scripts/all_active_labs.json', JSON.stringify(filtered, null, 2), 'utf8');
        console.log(`Saved ${filtered.length} laboratorios to scripts/all_active_labs.json`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listLaboratorios();
