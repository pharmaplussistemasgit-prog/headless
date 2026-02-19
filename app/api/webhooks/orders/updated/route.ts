import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET = process.env.WOOCOMMERCE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    try {
        const textBody = await req.text();
        const signature = req.headers.get('x-wc-webhook-signature');

        // Verify Signature
        if (SECRET && signature) {
            const computedSignature = crypto
                .createHmac('sha256', SECRET)
                .update(textBody)
                .digest('base64');

            if (computedSignature !== signature) {
                console.error("Invalid Webhook Signature in Updated Handler");
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const body = JSON.parse(textBody);
        const { id, status, billing, meta_data, line_items } = body;

        console.log(`[Webhook/Updated] Order #${id} Status: ${status}`);

        // Handle 'completed' status for Shipping Email
        if (status === 'completed') {
            const email = billing?.email;
            if (!email) {
                console.warn(`Order #${id} completed but no email found.`);
                return NextResponse.json({ success: true, message: 'No email found' });
            }

            // Extract Tracking Info (Assumes standard or common meta keys)
            // Adjust these keys based on the actual shipping plugin used in WC
            const trackingNumber = meta_data.find((m: any) => m.key === '_tracking_number' || m.key === 'tracking_number')?.value;
            const trackingProvider = meta_data.find((m: any) => m.key === '_tracking_provider' || m.key === 'tracking_provider')?.value || 'Transportadora';
            const trackingUrl = meta_data.find((m: any) => m.key === '_tracking_url' || m.key === 'tracking_url')?.value;

            const resendApiKey = process.env.RESEND_API_KEY;

            if (resendApiKey) {
                const { Resend } = await import('resend');
                const resend = new Resend(resendApiKey);

                await resend.emails.send({
                    from: 'PharmaPlus Envíos <envios@pharmaplus.com.co>',
                    to: [email],
                    subject: `Tu pedido #${id} ha sido enviado 🚚`,
                    react: (await import('@/emails/OrderShippedEmail')).OrderShippedEmail({
                        orderId: String(id), // Fix lint error: ensure string
                        firstName: billing.first_name,
                        trackingNumber: trackingNumber,
                        trackingCompany: trackingProvider,
                        trackingUrl: trackingUrl,
                        items: line_items.map((item: any) => ({
                            name: item.name,
                            quantity: item.quantity
                        }))
                    })
                });
                console.log(`Shipped email sent for Order #${id}`);
            }
        }

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error("Webhook Updated Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
