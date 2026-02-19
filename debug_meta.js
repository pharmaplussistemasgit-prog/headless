const https = require('https');

const API_URL = 'https://tienda.pharmaplus.com.co/';
const CK = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const CS = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

// Basic Auth
const auth = Buffer.from(`${CK}:${CS}`).toString('base64');

const data = [];
const searchTerm = 'ODEFSEY';

const options = {
    hostname: 'tienda.pharmaplus.com.co',
    path: `/wp-json/wc/v3/products?search=${encodeURIComponent(searchTerm)}&per_page=1`,
    method: 'GET',
    headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => {
        body += d;
    });
    res.on('end', () => {
        try {
            const products = JSON.parse(body);
            if (products.length > 0) {
                const product = products[0];
                console.log('Product ID:', product.id);
                console.log('Meta Data Keywords Search:');

                const metaKeys = ['_marca', 'Marca', '_registro_invima', 'Registro Invima', '_tipo_de_producto', 'Tipo de Producto'];
                metaKeys.forEach(key => {
                    const meta = product.meta_data.find(m => m.key === key);
                    console.log(`Key: ${key}, Value: ${meta ? meta.value : 'NOT FOUND'}`);
                });

                console.log('\n--- ALL META DATA KEYS ---');
                product.meta_data.forEach(m => console.log(m.key, ':', m.value));

                console.log('\n--- ATTRIBUTES ---');
                product.attributes.forEach(a => console.log(a.name, ':', a.options));

            } else {
                console.log('No products found matching:', searchTerm);
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw Body:', body);
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
