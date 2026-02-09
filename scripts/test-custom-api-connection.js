/**
 * Test simple de conexión a CUSTOM_API_V3.3
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
const CUSTOM_API_KEY = process.env.CUSTOM_API_KEY;

console.log('🔍 Configuración:');
console.log('   WP_URL:', WP_URL);
console.log('   API_KEY:', CUSTOM_API_KEY ? `${CUSTOM_API_KEY.substring(0, 10)}...` : 'NO DEFINIDA');

if (!WP_URL || !CUSTOM_API_KEY) {
    console.error('\n❌ Faltan variables de entorno');
    process.exit(1);
}

// Test de conexión
async function testConnection() {
    const url = `${WP_URL}/wp-json/custom-api/v1/laboratorio?per_page=1`;

    console.log('\n📡 Probando conexión...');
    console.log('   URL:', url);
    console.log('   Headers:', {
        'X-API-KEY': `${CUSTOM_API_KEY.substring(0, 10)}...`,
        'Content-Type': 'application/json'
    });

    try {
        const response = await fetch(url, {
            headers: {
                'X-API-KEY': CUSTOM_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log('\n📊 Respuesta:');
        console.log('   Status:', response.status, response.statusText);
        console.log('   Headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const text = await response.text();
            console.error('\n❌ Error en la respuesta:');
            console.error(text);
            process.exit(1);
        }

        const data = await response.json();
        console.log('\n✅ Conexión exitosa!');
        console.log('   Total laboratorios:', data.total);
        console.log('   Datos:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('\n❌ Error de conexión:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testConnection();
