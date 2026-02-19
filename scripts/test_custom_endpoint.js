const https = require('https');

// Configuración
const apiKey = 'rwYK B0nN kHbq ujB3 XRbZ slCt'; // Tu clave X-API-KEY real
const hostname = 'tienda.pharmaplus.com.co';
const orderId = 23183;
const path = `/wp-json/pharma/v1/tracking/${orderId}`;

// Datos a enviar (Estilo simplificado)
const data = JSON.stringify({
    company: "Prueba Endpoint Nuevo",
    tracking_number: "TEST-XYZ-123"
});

console.log(`🚀 Probando endpoint: POST https://${hostname}${path}`);

const options = {
    hostname,
    path,
    method: 'POST',
    headers: {
        'X-API-KEY': apiKey, // Clave que usa el desarrollador
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => { responseBody += chunk; });

    res.on('end', () => {
        console.log('--------------------------------------------------');
        console.log(`📡 Estado: ${res.statusCode} ${res.statusMessage}`);

        try {
            const json = JSON.parse(responseBody);
            if (res.statusCode === 200) {
                console.log('✅ ¡ÉXITO! El endpoint funciona correctamente.');
                console.log('Respuesta:', JSON.stringify(json, null, 2));
            } else {
                console.log('❌ Error:', JSON.stringify(json, null, 2));
                if (json.code === 'rest_no_route') {
                    console.log('\n⚠️ DIAGNÓSTICO: El snippet NO está activo o actualizado en WordPress.');
                    console.log('👉 Acción: Ve a Code Snippets y actualiza el código con el endpoint nuevo.');
                }
            }
        } catch (e) {
            console.log('Respuesta texto (no JSON):', responseBody);
            console.log('\n⚠️ Puede ser un error de PHP fatal si copiaste mal el código.');
        }
    });
});

req.on('error', (e) => {
    console.error(`Error de conexión: ${e.message}`);
});

req.write(data);
req.end();
