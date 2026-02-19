const https = require('https');

// Credenciales
const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';
const hostname = 'tienda.pharmaplus.com.co';
const path = '/wp-json/wc/v3/orders/23183';

// Basic Auth
const auth = Buffer.from(`${ck}:${cs}`).toString('base64');

// Datos a enviar (Coordinadora)
const data = JSON.stringify({
    meta_data: [
        {
            key: '_shipping_company',
            value: 'Coordinadora'
        },
        {
            key: '_shipping_tracking_number',
            value: 'PRUEBA-ANTIGRAVITY-123'
        }
    ]
});

async function updateOrder() {
    console.log('🚀 Intentando actualizar pedido #23183 a "Coordinadora"...');

    const options = {
        hostname,
        path,
        method: 'PUT',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
            responseBody += chunk;
        });

        res.on('end', () => {
            try {
                const order = JSON.parse(responseBody);

                console.log('--------------------------------------------------');
                console.log(`📡 Respuesta API: ${res.statusCode} ${res.statusMessage}`);

                if (order.id) {
                    console.log('✅ Pedido actualizado correctamente.');
                    console.log(`   Empresa actual: ${order.shipping_company}`);
                    console.log(`   Guía actual:    ${order.shipping_tracking_number}`);

                    if (order.shipping_company === 'Coordinadora') {
                        console.log('🎉 ¡CONFIRMADO! La API acepta actualizaciones correctamente.');
                    } else {
                        console.log('⚠️ La actualización falló. El valor no cambió.');
                    }
                } else {
                    console.error('❌ Error en la respuesta:', order);
                }
            } catch (e) {
                console.error('Error parseando JSON:', e.message);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problema con la petición: ${e.message}`);
    });

    req.write(data);
    req.end();
}

updateOrder();
