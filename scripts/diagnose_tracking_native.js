const https = require('https');

// Credenciales desde tu .env.local
const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';
const hostname = 'tienda.pharmaplus.com.co';
const path = '/wp-json/wc/v3/orders/23183';

// Basic Auth
const auth = Buffer.from(`${ck}:${cs}`).toString('base64');

async function checkOrder() {
    console.log('🔍 Consultando pedido #23183 directamente...');

    const options = {
        hostname,
        path,
        method: 'GET',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const order = JSON.parse(data);
                verificarPedido(order);
            } catch (e) {
                console.error('Error parseando JSON:', e.message);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problema con la petición: ${e.message}`);
    });

    req.end();
}

function verificarPedido(order) {
    if (!order || order.id !== 23183) {
        console.error('❌ No se encontró el pedido o hay error en la API.');
        console.log(order);
        return;
    }

    console.log('✅ Pedido #23183 obtenido correctamente.');
    console.log('--------------------------------------------------');

    // 1. Verificar EXPOSICIÓN (Snippet)
    console.log('1. Verificando si el snippet EXPONE los campos en la API:');
    const exposedCompany = order.shipping_company;
    const exposedTracking = order.shipping_tracking_number;

    if (exposedCompany) console.log(`   ✅ shipping_company EXPUESTO: ${exposedCompany}`);
    else console.log('   ❌ shipping_company NO visible en nivel superior');

    if (exposedTracking) console.log(`   ✅ shipping_tracking_number EXPUESTO: ${exposedTracking}`);
    else console.log('   ❌ shipping_tracking_number NO visible en nivel superior');

    console.log('--------------------------------------------------');

    // 2. Verificar BASE DE DATOS (meta_data)
    console.log('2. Buscando en la BASE DE DATOS (meta_data):');

    const metaData = order.meta_data || [];
    const dbCompany = metaData.find(m => m.key === '_shipping_company');
    const dbTracking = metaData.find(m => m.key === '_shipping_tracking_number');

    if (dbCompany) {
        console.log(`   ✅ DATO GUARDADO EN DB (_shipping_company): "${dbCompany.value}"`);
    } else {
        console.log('   ❌ DATO NO ENCONTRADO EN DB (_shipping_company)');
    }

    if (dbTracking) {
        console.log(`   ✅ DATO GUARDADO EN DB (_shipping_tracking_number): "${dbTracking.value}"`);
    } else {
        console.log('   ❌ DATO NO ENCONTRADO EN DB (_shipping_tracking_number)');
    }

    console.log('--------------------------------------------------');

    // 3. DIAGNÓSTICO FINAL
    console.log('🧐 DIAGNÓSTICO FINAL:');

    if (dbCompany && !exposedCompany) {
        console.log('🚨 EL DATO EXISTE PERO ESTÁ OCULTO.');
        console.log('👉 CAUSA: Postman funcionó y guardó el dato, pero falta el snippet en WordPress para MOSTRARLO.');
        console.log('👉 SOLUCIÓN: Instala "docs/snippets/wordpress_order_tracking_snippet.php" en WordPress.');
    } else if (!dbCompany) {
        console.log('⚠️ EL DATO NO EXISTE EN NINGÚN LADO.');
        console.log('👉 CAUSA: La petición de Postman no guardó nada.');
        console.log('👉 SOLUCIÓN: Revisa que estas enviando "_shipping_company" (con guion bajo) en meta_data.');
    } else {
        console.log('🎉 ¡TODO ESTÁ FUNCIONANDO CORRECTAMENTE!');
    }
}

checkOrder();
