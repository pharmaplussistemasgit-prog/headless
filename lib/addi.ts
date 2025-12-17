
interface AddiConfig {
    clientId: string;
    clientSecret: string;
    audience: string;
    tokenUrl: string;
    apiUrl: string;
}

const config: AddiConfig = {
    clientId: 'hsHrcAlwoIUiLKhnrloq6yDWESGWeHYi', // Credentials from user-provided link
    clientSecret: 'XOx-iLlOh_WY3DJ9cHIw1Hu9lCfkZGFyGyEKNfm1hBzvQRLZ630rkGQCflFmjgxR',
    audience: 'https://staging.addi.com/', // Standard Addi Staging Audience
    tokenUrl: 'https://auth-staging.addi.com/oauth/token', // Auth0 Staging URL
    apiUrl: 'https://co-api-staging.addi.com', // API Staging URL
};

export async function getAddiToken(): Promise<string> {
    const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            audience: config.audience,
            grant_type: 'client_credentials',
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("❌ ERROR ADDI TOKEN:", error);
        throw new Error(`Addi Auth Error: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
}

interface AddiPaymentRequest {
    orderId: string;
    totalAmount: number;
    email: string;
    documentId: string;
    firstName: string;
    lastName: string;
    phone: string;
    redirectTo: string;
}

export async function createAddiPayment(data: AddiPaymentRequest) {
    const token = await getAddiToken();
    const endpoint = `${config.apiUrl}/v4/payment-requests`;

    const payload = {
        totalAmount: data.totalAmount,
        currency: 'COP',
        externalId: data.orderId, // We link the WooCommerce Order ID here
        client: {
            idType: 'CC', // Defaulting to Cédula de Ciudadanía
            idNumber: data.documentId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            cellphone: data.phone,
            cellphoneCountryCode: '+57',
        },
        ally: {
            slug: 'saprixsas-ecommerce' // From user link
        },
        redirectUrl: data.redirectTo,
    };

    console.log('--- ADDI PAYLOAD ---', JSON.stringify(payload, null, 2));

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const responseJson = await response.json();

    if (!response.ok) {
        console.error('Addi Payment Error Response:', responseJson);
        throw new Error(`Addi Payment Error: ${JSON.stringify(responseJson)}`);
    }

    return responseJson; // Should contain { _links: { webRedirect: { href: ... } } }
}
