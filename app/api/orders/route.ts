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

        // Base params: 'status: any' is CRITICAL to show all order types (failed, processed, custom statuses)
        const baseParams: any = { per_page: 50, order: 'desc', orderby: 'date', status: 'any' };

        let customerId: number | null = null;
        let customerEmail: string | null = null;
        let isEmail = false;

        if (!isNaN(Number(customer))) {
            customerId = Number(customer);
            // Try to find email for this ID to perform secondary search
            try {
                const userRes = await api.get(`customers/${customerId}`);
                if (userRes.data && userRes.data.email) {
                    customerEmail = userRes.data.email;
                }
            } catch (e) { /* Ignore */ }
        } else {
            isEmail = true;
            customerEmail = customer;
            // Try to find ID for this email
            try {
                const customersResponse = await api.get('customers', { email: customer });
                if (customersResponse.data && customersResponse.data.length > 0) {
                    customerId = customersResponse.data[0].id;
                }
            } catch (err) {
                console.error('Error finding customer by email:', err);
            }
        }

        // Parallel Fetch Strategy: search by ID AND search by Email
        const requests = [];

        // 1. Fetch by Customer ID (Standard)
        if (customerId) {
            requests.push(api.get('orders', { ...baseParams, customer: customerId }));
        }

        // 2. Fetch by Email Search (Guest orders or mismatched IDs)
        // Note: WC 'search' param is fuzzy, so we must filter results strictly later
        if (customerEmail) {
            requests.push(api.get('orders', { ...baseParams, search: customerEmail }));
        }

        if (requests.length === 0) {
            return NextResponse.json([]);
        }

        const responses = await Promise.allSettled(requests);
        const allOrders = new Map<number, any>();

        responses.forEach(result => {
            if (result.status === 'fulfilled' && result.value.data) {
                result.value.data.forEach((order: any) => {
                    // Filter Logic:
                    // A. If searching by Email, strictly match billing email
                    if (customerEmail && order.billing?.email && order.billing.email.toLowerCase() === customerEmail.toLowerCase()) {
                        allOrders.set(order.id, order);
                    }
                    // B. If searching by ID, always accept
                    else if (customerId && order.customer_id === customerId) {
                        allOrders.set(order.id, order);
                    }
                });
            }
        });

        // Convert to array and sort by date descending
        let orders = Array.from(allOrders.values()).sort((a, b) => {
            return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
        });

        // --- ENHANCEMENT: Fetch Product Images ---
        const productIds = new Set<number>();
        orders.forEach((order: any) => {
            order.line_items?.forEach((item: any) => {
                if (item.product_id) productIds.add(item.product_id);
                if (item.variation_id) productIds.add(item.variation_id);
            });
        });

        if (productIds.size > 0 && orders.length > 0) {
            const ids = Array.from(productIds).slice(0, 90).join(',');
            try {
                const productsRes = await api.get('products', {
                    include: ids,
                    per_page: 90,
                    _fields: 'id,images'
                });

                const productsMap: Record<number, string> = {};
                productsRes.data.forEach((p: any) => {
                    if (p.images && p.images.length > 0) {
                        productsMap[p.id] = p.images[0].src;
                    }
                });

                orders.forEach((order: any) => {
                    order.line_items?.forEach((item: any) => {
                        if (item.variation_id && productsMap[item.variation_id]) {
                            item.image = { src: productsMap[item.variation_id] };
                        } else if (item.product_id && productsMap[item.product_id]) {
                            item.image = { src: productsMap[item.product_id] };
                        }
                    });
                });
            } catch (imgErr) {
                console.warn('Failed to fetch images for orders', imgErr);
            }
        }

        return NextResponse.json(orders);
    } catch (error: any) {
        console.error('API Orders Error:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
