const https = require('https');
const fs = require('fs');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';
const baseUrl = 'https://tienda.pharmaplus.com.co/wp-json/wp/v2/laboratorios';

async function listAllLaboratorios() {
    let allTerms = [];
    let page = 1;
    let totalPages = 1;

    try {
        console.log('Fetching all laboratory terms...');
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

        const mapped = allTerms.map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            count: t.count
        }));

        fs.writeFileSync('scripts/all_labs_full.json', JSON.stringify(mapped, null, 2), 'utf8');
        console.log(`Saved ${mapped.length} terms to scripts/all_labs_full.json`);

        // Search for specific brands
        const search = ['BAYER', 'BIOPAS', 'ADIUM', 'ABBVIE', 'HEEL', 'INMUNOPHARMA'];
        console.log('\n--- Searching for specific brands ---');
        search.forEach(name => {
            const found = mapped.filter(t => t.name.toUpperCase().includes(name) || t.slug.toUpperCase().includes(name));
            if (found.length > 0) {
                console.log(`Found for "${name}":`);
                console.log(JSON.stringify(found, null, 2));
            } else {
                console.log(`No results for "${name}".`);
            }
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listAllLaboratorios();
