// Standalone test script to verify SMS API


// Mock fetch for testing if not available in Node environment (or rely on Node 18+ fetch)
// But better to just use a standalone script that duplicates the logic to test purely the API.

const API_URL = 'https://contacto-virtual.com/a/api/send/sms/json';
const TOKEN = '75kg6seq32hzg803k287a';
const EMAIL = 'pharmaplus@fonoplus.com';

async function testSMS() {
    console.log('Testing SMS API...');

    // Hardcoded payload based on user request
    const payload = {
        "token": TOKEN,
        "email": EMAIL,
        "type_send": "1via",
        "data": [
            {
                "cellphone": "573114934070", // Keeping 57 as per previous logic, user example didn't have it but lib adds it. Let's test with it first.
                "message": "Prueba de integración PharmaPlus - Nuevo Endpoint"
            }
        ]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

testSMS();
