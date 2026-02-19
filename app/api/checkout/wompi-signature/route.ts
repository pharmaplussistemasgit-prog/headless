import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/checkout/wompi-signature
 *
 * Genera la firma SHA-256 de integridad para el Widget de Wompi.
 * El secreto de integridad NUNCA sale del servidor.
 *
 * Body:
 *   - reference: string  → Referencia única (ej: "ORD-12345")
 *   - amountInCents: number → Monto en centavos (ej: 9500000 = $95.000 COP)
 *   - currency: string    → "COP"
 *   - expirationTime?: string → ISO 8601 (opcional)
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { reference, amountInCents, currency = 'COP', expirationTime } = body;

        if (!reference || !amountInCents) {
            return NextResponse.json(
                { error: 'Se requieren reference y amountInCents' },
                { status: 400 }
            );
        }

        const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
        if (!integritySecret) {
            console.error('❌ WOMPI_INTEGRITY_SECRET no está configurado en .env.local');
            return NextResponse.json(
                { error: 'Configuración de pago incompleta' },
                { status: 500 }
            );
        }

        // Concatenar según especificación de Wompi:
        // <Referencia><Monto><Moneda>[<FechaExpiracion>]<SecretoIntegridad>
        let cadena = `${reference}${amountInCents}${currency}`;
        if (expirationTime) {
            cadena += expirationTime;
        }
        cadena += integritySecret;

        // Generar hash SHA-256 (usando crypto nativo de Node, no el de browser)
        const signature = crypto.createHash('sha256').update(cadena).digest('hex');

        return NextResponse.json({
            signature,
            reference,
            amountInCents,
            currency,
        });
    } catch (error: any) {
        console.error('Error generando firma Wompi:', error);
        return NextResponse.json(
            { error: 'Error interno generando firma de pago' },
            { status: 500 }
        );
    }
}
