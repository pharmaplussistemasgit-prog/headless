import { NextResponse } from 'next/server';
import { getWooApi } from '@/lib/woocommerce';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    try {
        const api = getWooApi();
        const response = await api.get(`customers/${id}`);
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('API Customer GET Error:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const api = getWooApi();
        const response = await api.put(`customers/${id}`, body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('API Customer PUT Error:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}
