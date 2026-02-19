import { NextRequest, NextResponse } from 'next/server';
import { submitToJetForm } from '@/lib/jetform-connector';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { formId, data } = body;

        console.log(`[API/forms/submit] Received request for Form ID: ${formId}`, {
            email: data?.user_email, // Log only safe fields
            hasPassword: !!data?.user_password
        });

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

        // --- Send Emails via Resend (Notification & Receipt) ---
        if (result.success) {
            const resendApiKey = process.env.RESEND_API_KEY;
            if (resendApiKey) {
                try {
                    const { Resend } = await import('resend');
                    const resend = new Resend(resendApiKey);

                    // Extract email from form data (handle common keys)
                    // The data object comes from JFB/Client, keys might be 'email', 'user_email', 'correo', etc.
                    const userEmail = typeof data === 'object' ? (data.email || data.user_email || data.correo || data['e-mail']) as string : undefined;
                    const userName = typeof data === 'object' ? (data.name || data.nombre || data.first_name || 'Cliente') as string : 'Cliente';
                    const formType = formId === 23124 ? 'P.Q.R.S.' : 'Contacto'; // Simple ID check

                    // 1. Notify Admin
                    await resend.emails.send({
                        from: 'PharmaPlus Web <alertas@pharmaplus.com.co>',
                        to: ['pedidos@pharmaplus.com.co'], // Primary Admin Email
                        subject: `Nueva solicitud recibida: ${formType}`,
                        react: (await import('@/emails/FormNotificationEmail')).FormNotificationEmail({
                            formId: String(formId),
                            data: data as Record<string, string>, // Cast for safety
                            title: `Nuevo formulario de ${formType}`
                        }),
                    });

                    // 2. Receipt to User (if email exists)
                    if (userEmail && userEmail.includes('@')) {
                        await resend.emails.send({
                            from: 'PharmaPlus <servicioalcliente@pharmaplus.com.co>',
                            to: [userEmail],
                            subject: `Hemos recibido tu solicitud (${formType})`,
                            react: (await import('@/emails/FormReceiptEmail')).FormReceiptEmail({
                                userName: userName,
                                formType: formType
                            }),
                        });
                    }

                } catch (emailError) {
                    console.error('[FormsAPI] Failed to send emails:', emailError);
                }
            }
        }
        // -------------------------------------------------------

        return NextResponse.json(result);

    } catch (error) {
        console.error('API Proxy Error:', error);
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor proxy' },
            { status: 500 }
        );
    }
}
