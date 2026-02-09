import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, message } = body;

        if (!phone || !message) {
            return NextResponse.json(
                { success: false, error: 'Phone and message are required' },
                { status: 400 }
            );
        }

        const result = await sendSMS(phone, message);

        if (result.success) {
            return NextResponse.json({ success: true, data: result.data });
        } else {
            return NextResponse.json(
                { success: false, error: result.error, details: result.details },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('API Handler Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
