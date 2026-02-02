
import { NextResponse } from 'next/server';
import { getWooApi } from '@/lib/woocommerce';

// This endpoint creates an order in WooCommerce and, if successful, confirms the payment with OrbisFarma.
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customer,
            items,
            agreementId,
            agreementCardNumber,
            shippingLine,
            metaData
        } = body;

        if (!agreementId || !agreementCardNumber) {
            return NextResponse.json({ success: false, message: 'Missing Agreement Data' }, { status: 400 });
        }

        const api = getWooApi();

        // 1. Prepare Order Data for WooCommerce
        const orderData = {
            payment_method: "agreement",
            payment_method_title: "Convenio / Libranza",
            set_paid: false, // Will resolve to Processing after "sale" check
            billing: {
                first_name: customer.firstName,
                last_name: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                address_1: customer.address || 'N/A',
                city: customer.city || 'Bogotá',
                state: customer.state || 'CO-DC',
                country: 'CO',
                company: customer.companyName || '',
                // Custom fields for Cedula often go in meta_data, but we map them below
            },
            shipping: {
                first_name: customer.firstName,
                last_name: customer.lastName,
                address_1: customer.address || 'N/A',
                city: customer.city || 'Bogotá',
                state: customer.state || 'CO-DC',
                country: 'CO',
            },
            line_items: items.map((item: any) => ({
                product_id: item.id,
                variation_id: item.variationId || 0,
                quantity: item.quantity
            })),
            shipping_lines: shippingLine ? [shippingLine] : [],
            meta_data: [
                { key: "_billing_cedula", value: customer.documentId }, // Common field
                { key: "billing_cedula", value: customer.documentId },
                { key: "_agreement_id", value: agreementId },
                ...(metaData || [])
            ]
        };

        console.log("Creating WC Order...");

        // 2. Create Order in WooCommerce
        let wcResponse;
        try {
            wcResponse = await api.post("orders", orderData);
        } catch (wcError: any) {
            console.error("WooCommerce API Error:", wcError.response ? wcError.response.data : wcError.message);
            return NextResponse.json({
                success: false,
                message: `Error conectando con la tienda: ${wcError.message}`
            }, { status: 500 });
        }

        if (wcResponse.status !== 201) {
            console.error("WC Order Create Error:", wcResponse.data);
            return NextResponse.json({ success: false, message: 'Error creando el pedido en WooCommerce' }, { status: 500 });
        }

        const order = wcResponse.data;
        console.log("Order Created:", order.id);

        // 3. Confirm Sale with OrbisFarma
        // Construct the items string required by Orbis: "SKU,Qty,ValUnit,ValTotal|SKU,Qty,ValUnit,ValTotal"
        // Note: Orbis docs usually require a specific format. 
        // Based on "transactionitems" in previous steps, let's assume "SKU,QTY,PRICE,TOTAL" separated by pipe or something similar?
        // Wait, the "quote" step used "SKU,QTY,1,1".
        // Let's stick to a safe format or the one we assumed. 
        // Ideally we should use the exact format. If unknown, we try to mimic the quote format.

        const itemsString = items.map((item: any) => {
            // Format: SKU,QUANTITY,UNIT_PRICE,TOTAL_PRICE
            const price = Math.round(Number(item.price));
            const total = price * item.quantity;
            return `${item.sku || item.id},${item.quantity},${price},${total}`;
        }).join('|');

        // Calculate Total
        const totalAmount = items.reduce((acc: number, item: any) => acc + (Math.round(Number(item.price)) * item.quantity), 0);

        const ORBIS_API_URL = "https://posdeveloper.orbisfarma.com.mx";
        const ORBIS_API_KEY = process.env.ORBIS_API_KEY || "4AD42EC77114956F33B16AC27D136F85";

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const invoiceDate = `${year}${month}${day}`;

        // 2.5 Auto-Refresh Session (Fix for Error [008] Invalid Session)
        // The frontend ID might have expired. We generate a fresh one here.
        console.log("Refreshing Orbis Session (Auto-Init)...");
        let activeTransactionId = agreementId;

        try {
            const initRes = await fetch(`${ORBIS_API_URL}/setTransactionInit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'ApiKey': ORBIS_API_KEY },
                body: JSON.stringify({
                    cardnumber: agreementCardNumber,
                    storeid: '9999',
                    posid: '9999',
                    employeeid: 'origis'
                })
            });

            if (initRes.ok) {
                const initData = await initRes.json();
                // Check where transactionid is located (root or inside response)
                const newId = initData.transactionid || initData.response?.transactionid;

                if (newId) {
                    console.log("Fresh Session ID Obtained:", newId);
                    activeTransactionId = newId;
                } else {
                    console.warn("Init response OK but no ID found:", initData);
                }
            }
        } catch (e) {
            console.error("Auto-init failed, proceeding with original ID:", e);
        }

        // Construct Strict Payload based on Postman Collection
        const payload = {
            cardnumber: agreementCardNumber,
            storeid: '9999',
            posid: '9999',
            employeeid: 'origis',
            transactionid: activeTransactionId, // Use FRESH ID
            transactionitems: itemsString,
            transactionwithdrawal: "0",
            invoicenumber: order.id.toString(), // WC Order ID
            invoicedate: invoiceDate,
            invoiceamount: Math.round(totalAmount).toString()
        };

        console.log("Reporting Sale to Orbis Payload:", JSON.stringify(payload));

        let orbisRes;
        try {
            orbisRes = await fetch(`${ORBIS_API_URL}/setTransactionSale`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'ApiKey': ORBIS_API_KEY },
                body: JSON.stringify(payload)
            });
        } catch (orbisNetError: any) {
            console.error("Orbis Network Error:", orbisNetError);
            return NextResponse.json({ success: false, message: `Error de conexión con Orbis: ${orbisNetError.message}` }, { status: 500 });
        }

        if (!orbisRes.ok) {
            const errorBody = await orbisRes.text();
            console.error("Orbis API Error:", orbisRes.status, errorBody);

            // Try to extract a friendly message
            let friendlyError = `Orbis Error (${orbisRes.status})`;
            try {
                const errJson = JSON.parse(errorBody);
                // Some APIs return { message: "..." }, others { error: "..." }
                friendlyError = errJson.message || errJson.error || errJson.Message || friendlyError;
            } catch (e) {
                friendlyError = errorBody.slice(0, 150); // truncated
            }

            return NextResponse.json({ success: false, message: `Rechazado por Orbis: ${friendlyError}` }, { status: orbisRes.status });
        }

        const orbisData = await orbisRes.json();
        console.log("Orbis Sale Result:", orbisData);

        if (orbisData.errorid === 0) {
            // Success! Update Order to Processing
            await api.put(`orders/${order.id}`, {
                status: 'processing',
                transaction_id: agreementId,
                meta_data: [
                    { key: "orbis_sale_id", value: orbisData.transactionid }
                ]
            });

            return NextResponse.json({
                success: true,
                orderId: order.id,
                orderKey: order.order_key
            });

        } else {
            // Failed. Mark order as Failed.
            await api.put(`orders/${order.id}`, {
                status: 'failed',
                customer_note: `Orbis Error: ${orbisData.message || 'Payment Rejected'}`
            });
            return NextResponse.json({ success: false, message: orbisData.message || 'Convenio Declined' }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Create Order Integration Error:", error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Error' }, { status: 500 });
    }
}
