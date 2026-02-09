const https = require('https');

const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

async function testSingle(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', (e) => resolve({ error: e.message }));
    });
}

async function run() {
    // Adium (ID 2948, Slug 53)
    const url1 = `https://tienda.pharmaplus.com.co/wp-json/wp/v2/product?laboratorios=2948&consumer_key=${ck}&consumer_secret=${cs}`;
    // Abbvie Eye Care (ID 3292)
    const url2 = `https://tienda.pharmaplus.com.co/wp-json/wp/v2/product?laboratorios=3292&consumer_key=${ck}&consumer_secret=${cs}`;

    console.log('Testing Adium (WP v2)...');
    const res1 = await testSingle(url1);
    console.log('Adium count:', Array.isArray(res1) ? res1.length : 'Error');

    console.log('Testing Abbvie Eye Care (WP v2)...');
    const res2 = await testSingle(url2);
    console.log('Abbvie count:', Array.isArray(res2) ? res2.length : 'Error');
    if (Array.isArray(res2) && res2.length > 0) {
        console.log('Sample product:', res2[0].title.rendered);
    }
}

run();
