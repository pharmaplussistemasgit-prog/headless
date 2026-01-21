import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import OrderConfirmation from '@/emails/OrderConfirmation';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const SECRET = process.env.WOOCOMMERCE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    try {
        const textBody = await req.text();
        const signature = req.headers.get('x-wc-webhook-signature');

        // Verify Signature if SECRET is set
        if (SECRET && signature) {
            const computedSignature = crypto
                .createHmac('sha256', SECRET)
                .update(textBody)
                .digest('base64');

            if (computedSignature !== signature) {
                console.error("Invalid Webhook Signature");
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const body = JSON.parse(textBody);
        const { id, billing } = body;

        if (!billing?.email) {
            return NextResponse.json({ error: 'No email found in order' }, { status: 400 });
        }

        console.log(`Processing Order #${id} for ${billing.email}`);

        // Send Email via Resend
        const { data, error } = await resend.emails.send({
            from: 'PharmaPlus <pedidos@pharmaplus.com.co>', // Ensure this domain is verified in Resend
            to: [billing.email],
            subject: `Confirmación de Pedido #${id} 💊`,
            react: OrderConfirmation({ order: body }),
        });

        if (error) {
            console.error("Resend Error:", error);
            return NextResponse.json({ error }, { status: 500 });
        }

        console.log(`Email sent successfully: ${data?.id}`);
        return NextResponse.json({ success: true, data });

    } catch (e) {
        console.error("Webhook Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
