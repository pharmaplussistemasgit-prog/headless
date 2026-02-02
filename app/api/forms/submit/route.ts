import { NextRequest, NextResponse } from 'next/server';
import { submitToJetForm } from '@/lib/jetform-connector';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { formId, data } = body;

        if (!formId || !data) {
            return NextResponse.json(
                { success: false, message: 'Faltan datos obligatorios (Form ID o Data)' },
                { status: 400 }
            );
        }

        // Extract Bearer token from headers
        const authHeader = request.headers.get('Authorization');
        const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;

        const result = await submitToJetForm(formId, data, token);

        return NextResponse.json(result);

    } catch (error) {
        console.error('API Proxy Error:', error);
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor proxy' },
            { status: 500 }
        );
    }
}
