
import { NextResponse } from 'next/server';
import { getWooApi } from '@/lib/woocommerce';

export async function POST(req: Request) {
    try {
        const { orderNumber } = await req.json(); // WC Order ID refers to our database ID

        if (!orderNumber) {
            return NextResponse.json({ error: 'Order Number is required' }, { status: 400 });
        }

        const username = process.env.CREDIBANCO_USER;
        const password = process.env.CREDIBANCO_PASSWORD;
        const environment = process.env.CREDIBANCO_ENV || 'test';

        const baseUrl = environment === 'prod'
            ? 'https://eco.credibanco.com/payment/rest'
            : 'https://ecouat.credibanco.com/payment/rest';

        const statusUrl = `${baseUrl}/getOrderStatusExtended.do`;

        // 1. Get Credibanco Order ID from WooCommerce Order Metadata
        let credibancoOrderId = '';
        try {
            const orderRes = await getWooApi().get(`orders/${orderNumber}`);
            const order = orderRes.data;
            if (!order) {
                throw new Error('Order data is empty');
            }
            // Check meta_data for _credibanco_order_id
            const meta = order.meta_data.find((m: any) => m.key === '_credibanco_order_id');
            if (meta) {
                credibancoOrderId = meta.value;
            }
        } catch (e) {
            console.error('Error fetching WC order:', e);
            return NextResponse.json({ error: 'Order not found in system' }, { status: 404 });
        }

        if (!credibancoOrderId) {
            return NextResponse.json({ error: 'Credibanco Order ID not linked to this order' }, { status: 404 });
        }

        // 2. Query Credibanco Status
        const params = new URLSearchParams();
        params.append('userName', username!);
        params.append('password', password!);
        params.append('orderId', credibancoOrderId);

        const response = await fetch(statusUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        const data = await response.json();

        // 3. Interpret Response
        // errorCode: 0 means request processed successfully.
        // actionCode: 0 means Approved.
        let status = 'PENDING';

        if (data.errorCode == '0' && data.actionCode == 0) {
            status = 'APPROVED';
            // Auto-update WC order if approved
            try {
                await getWooApi().put(`orders/${orderNumber}`, {
                    status: 'processing',
                    transaction_id: credibancoOrderId,
                    payment_method: 'credibanco',
                    payment_method_title: 'Credibanco'
                });
            } catch (e) {
                console.error('Error auto-updating WC order:', e);
            }
        } else if (data.actionCode != 0) {
            status = 'DECLINED';
            try {
                await getWooApi().put(`orders/${orderNumber}`, {
                    status: 'failed',
                    note: `Credibanco Payment Failed: ${data.errorMessage || data.actionCodeDescription}`
                });
            } catch (e) {
                console.error('Error auto-updating WC to failed:', e);
            }
        }

        return NextResponse.json({
            status,
            details: data
        });

    } catch (error: any) {
        console.error('Credibanco Status Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
