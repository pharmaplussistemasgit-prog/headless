
import { NextResponse } from 'next/server';
import { getWooApi } from '@/lib/woocommerce';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customer,
            items,
            paymentMethod,
            paymentMethodTitle,
            shippingLine,
            metaData,
            amount, // Optional validation
            status // Optional custom status (e.g., 'on-hold', 'processing')
        } = body;

        const api = getWooApi();

        const orderData = {
            payment_method: paymentMethod || 'other',
            payment_method_title: paymentMethodTitle || 'Otro',
            set_paid: false,
            status: status || 'pending',
            billing: {
                first_name: customer.firstName,
                last_name: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                address_1: customer.address || '',
                address_2: customer.address2 || '',
                city: customer.city || '',
                state: customer.state || '',
                postcode: customer.zipCode || '',
                country: 'CO',
                company: customer.companyName || '',
            },
            shipping: {
                first_name: customer.firstName,
                last_name: customer.lastName,
                address_1: customer.address || '',
                address_2: customer.address2 || '',
                city: customer.city || '',
                state: customer.state || '',
                postcode: customer.zipCode || '',
                country: 'CO',
            },
            line_items: items.map((item: any) => ({
                product_id: item.id,
                variation_id: item.variationId || 0,
                quantity: item.quantity
            })),
            shipping_lines: shippingLine ? [shippingLine] : [],
            meta_data: [
                { key: "_billing_cedula", value: customer.documentId },
                { key: "_billing_document_type", value: customer.documentType },
                // Add any other meta data
                ...(metaData || [])
            ]
        };

        const response = await api.post("orders", orderData);

        if (response.status === 201) {
            return NextResponse.json({ success: true, orderId: response.data.id, orderKey: response.data.order_key });
        } else {
            return NextResponse.json({ success: false, message: 'No se pudo crear el pedido en la tienda.' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Error creating pending order:', error);
        return NextResponse.json({ success: false, message: error.message || 'Error interno creando pedido' }, { status: 500 });
    }
}
