const fetch = require('node-fetch');

// Credenciales desde tu .env.local
const url = 'https://tienda.pharmaplus.com.co/wp-json/wc/v3/orders/23183';
const ck = 'ck_8a5d527d010ded41d42939106a8ba2729bc91bf6';
const cs = 'cs_569502dcbef8c40937719b5fa3511cb0e40f6aac';

// Autenticación Basic Auth
const auth = Buffer.from(`${ck}:${cs}`).toString('base64');

async function checkOrder() {
    console.log('🔍 Consultando pedido #23183...');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const order = await response.json();

        console.log('✅ Pedido obtenido correctamente.');
        console.log('--------------------------------------------------');

        // Verificar si existen los campos en el objeto principal (expuestos por snippet)
        console.log('1. Campos en Nivel Superior (necesitan snippet):');
        console.log('   shipping_company:', order.shipping_company || '❌ No visible');
        console.log('   shipping_tracking_number:', order.shipping_tracking_number || '❌ No visible');

        console.log('--------------------------------------------------');

        // Verificar si existen en meta_data (donde se guardan realmente)
        console.log('2. Buscando en meta_data (base de datos real):');

        const companyMeta = order.meta_data.find(m => m.key === '_shipping_company');
        const trackingMeta = order.meta_data.find(m => m.key === '_shipping_tracking_number');

        if (companyMeta) {
            console.log('   ✅ _shipping_company encontrado:', companyMeta.value);
        } else {
            console.log('   ❌ _shipping_company NO encontrado en meta_data');
        }

        if (trackingMeta) {
            console.log('   ✅ _shipping_tracking_number encontrado:', trackingMeta.value);
        } else {
            console.log('   ❌ _shipping_tracking_number NO encontrado en meta_data');
        }

        console.log('--------------------------------------------------');

        // Diagnóstico final
        if (companyMeta && !order.shipping_company) {
            console.log('🚨 DIAGNÓSTICO: Los datos ESTÁN en la base de datos, pero el snippet NO está activo.');
            console.log('👉 Solución: Instalar el snippet "wordpress_order_tracking_snippet.php" en WordPress.');
        } else if (order.shipping_company) {
            console.log('🎉 Todo parece estar correcto. El snippet funciona.');
        } else {
            console.log('⚠️ Los datos NO están en la base de datos. Revisa el PUT desde Postman.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkOrder();
