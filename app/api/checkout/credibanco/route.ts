
import { NextResponse } from 'next/server';
import { getWooApi } from '@/lib/woocommerce';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, amount, tax, returnUrl, description, installments } = body;

        const username = process.env.CREDIBANCO_USER;
        const password = process.env.CREDIBANCO_PASSWORD;
        const environment = process.env.CREDIBANCO_ENV || 'test';

        // Base URL depending on environment
        const baseUrl = environment === 'prod'
            ? 'https://eco.credibanco.com/payment/rest'
            : 'https://ecouat.credibanco.com/payment/rest';

        const registerUrl = `${baseUrl}/register.do`;

        if (!username || !password) {
            return NextResponse.json({ error: 'Credibanco credentials not configured' }, { status: 500 });
        }

        // Prepare parameters for register.do
        // Amount must be in cents (multiply by 100 for COP)
        const amountInCents = Math.round(amount * 100);
        const taxInCents = Math.round((tax || 0) * 100);

        const jsonParams: any = {
            installments: installments || '1',
            'IVA.amount': taxInCents.toString(),
        };

        const params = new URLSearchParams();
        params.append('userName', username);
        params.append('password', password);
        params.append('orderNumber', orderId); // Merchant Order Number
        params.append('amount', amountInCents.toString());
        params.append('currency', '170'); // COP
        params.append('returnUrl', returnUrl);
        params.append('description', description || `Pago orden ${orderId}`);
        params.append('jsonParams', JSON.stringify(jsonParams));

        // Consuming Credibanco API
        const response = await fetch(registerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        const data = await response.json();

        if (data.errorCode && data.errorCode != '0') {
            console.error('Credibanco Error:', data);
            return NextResponse.json({
                error: data.errorMessage || 'Error registering payment with Credibanco',
                errorCode: data.errorCode
            }, { status: 400 });
        }

        // Update WooCommerce Order with Credibanco Order ID
        try {
            if (data.orderId) {
                // We use getWooApi on server side
                const api = getWooApi();
                await api.put(`orders/${orderId}`, {
                    meta_data: [
                        {
                            key: '_credibanco_order_id',
                            value: data.orderId
                        }
                    ]
                });
            }
        } catch (wooError) {
            console.error('Error updating WooCommerce order meta:', wooError);
            // Continue, as the payment registration was successful, just the update failed.
            // We might want to return a warning but formUrl is key.
        }

        return NextResponse.json({
            formUrl: data.formUrl,
            orderId: data.orderId,
        });

    } catch (error: any) {
        console.error('Credibanco Exception:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
