import { NextResponse } from 'next/server';
import { orbisService } from '@/lib/orbisfarma';
import { coopmsdService } from '@/lib/coopmsd';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { provider, documentId } = body;

        if (!provider || !documentId) {
            return NextResponse.json(
                { success: false, message: 'Faltan datos requeridos (provider, documentId)' },
                { status: 400 }
            );
        }

        let result;

        // 1. Validate based on Provider
        if (provider === 'inicio_tx') {
            // OrbisFarma (Inicio TX)
            const orbisRes = await orbisService.init(documentId);

            // Map Orbis response to standard format
            if (orbisRes.errorid === 0 && orbisRes.transactionid) {
                result = {
                    success: true,
                    transactionId: orbisRes.transactionid,
                    balance: orbisRes.response?.cardbalance || 'N/A',
                    message: 'Cupo autorizado por Inicio TX'
                };
            } else {
                result = {
                    success: false,
                    message: orbisRes.message || 'Convenio no encontrado en Inicio TX'
                };
            }

        } else if (provider === 'coopmsd') {
            // Coopmsd
            const coopRes = await coopmsdService.validate(documentId);
            result = coopRes;

        } else {
            return NextResponse.json(
                { success: false, message: 'Proveedor de convenio no válido' },
                { status: 400 }
            );
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Agreement Validation Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Error interno al validar convenio' },
            { status: 500 }
        );
    }
}
