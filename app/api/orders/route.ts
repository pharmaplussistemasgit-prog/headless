import { NextResponse } from 'next/server';
import { getWooApi } from '@/lib/woocommerce';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const customer = searchParams.get('customer'); // ID or Email

    if (!customer) {
        return NextResponse.json({ error: 'Customer required' }, { status: 400 });
    }

    try {
        const api = getWooApi();
        // Intentar buscar por ID numérico primero
        let params: any = { per_page: 20 };

        let customerId: number | null = null;

        if (!isNaN(Number(customer))) {
            customerId = Number(customer);
        } else {
            // Si el customer param no es número, asumimos que es email y buscamos el ID
            try {
                const customersResponse = await api.get('customers', { email: customer });
                if (customersResponse.data && customersResponse.data.length > 0) {
                    customerId = customersResponse.data[0].id;
                }
            } catch (err) {
                console.error('Error finding customer by email:', err);
            }
        }

        if (!customerId) {
            // Si no encontramos al cliente, devolvemos array vacío en lugar de error
            return NextResponse.json([]);
        }

        // Add customer ID to params
        params.customer = customerId;

        const response = await api.get('orders', params);
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('API Orders Error:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
