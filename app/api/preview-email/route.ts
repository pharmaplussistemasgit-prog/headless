import { NextResponse } from 'next/server';
import { render } from '@react-email/components';
import OrderConfirmation from '@/emails/OrderConfirmation';

export async function GET() {
    try {
        const html = await render(OrderConfirmation({}));
        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-store, max-age=0'
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to render email' }, { status: 500 });
    }
}
