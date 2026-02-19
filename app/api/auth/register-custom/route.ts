import { NextRequest, NextResponse } from 'next/server';
import { getWooApi } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            email,
            password,
            first_name,
            last_name,
            id_type,
            id_number,
            birth_date,
            gender,
            phone,
            address,
            state,
            city,
            department // fallback if state is purely name
        } = body;

        // Basic validation
        if (!email || !password || !first_name || !last_name || !id_number || !phone) {
            return NextResponse.json(
                { success: false, message: 'Faltan campos obligatorios.' },
                { status: 400 }
            );
        }

        const api = getWooApi();

        // Prepare State Code (Remove CO- prefix if present for WooCommerce compatibility)
        // e.g., 'CO-ANT' -> 'ANT'
        const stateCode = state && state.includes('CO-') ? state.replace('CO-', '') : state;

        // Construct Meta Data for Custom Fields
        const meta_data = [
            { key: 'billing_id_type', value: id_type },
            { key: 'billing_id_number', value: id_number }, // Standard often used in specialized plugins
            { key: '_billing_id_number', value: id_number }, // Backup hidden meta
            { key: 'date_of_birth', value: birth_date },
            { key: 'billing_gender', value: gender },
            // Add standard pharmacy fields if needed
            { key: 'billing_phone', value: phone }
        ];

        // Construct Payload
        const payload = {
            email: email,
            first_name: first_name,
            last_name: last_name,
            username: email, // Use email as username
            password: password,
            billing: {
                first_name: first_name,
                last_name: last_name,
                company: '',
                address_1: address,
                address_2: '',
                city: city,
                state: stateCode,
                postcode: '000000', // Default or asked field? User didn't ask for postcode explicitly
                country: 'CO',
                email: email,
                phone: phone
            },
            shipping: {
                first_name: first_name,
                last_name: last_name,
                company: '',
                address_1: address,
                address_2: '',
                city: city,
                state: stateCode,
                postcode: '000000',
                country: 'CO'
            },
            meta_data: meta_data
        };

        console.log('[RegisterAPI] Creating customer:', { email, id_number });

        const response = await api.post("customers", payload);

        if (response.status === 201) {

            // --- Send Welcome Email via Resend ---
            const resendApiKey = process.env.RESEND_API_KEY;
            if (resendApiKey) {
                try {
                    const { Resend } = await import('resend'); // Dynamic import to avoid build issues if missing deps
                    const resend = new Resend(resendApiKey);

                    await resend.emails.send({
                        from: 'PharmaPlus <bienvenida@pharmaplus.com.co>',
                        to: [email],
                        subject: '¡Bienvenido a PharmaPlus! 🌿',
                        react: (await import('@/emails/WelcomeEmail')).WelcomeEmail({ firstName: first_name }),
                    });
                    console.log(`[RegisterAPI] Welcome email sent to ${email}`);
                } catch (emailError) {
                    console.error('[RegisterAPI] Failed to send welcome email:', emailError);
                    // Non-blocking error
                }
            }
            // -------------------------------------

            return NextResponse.json({
                success: true,
                message: 'Cuenta creada exitosamente.',
                data: response.data
            });
        } else {
            // Should not happen as non-200 throws usually, but safe check
            return NextResponse.json({
                success: false,
                message: 'No se pudo crear la cuenta. Intente nuevamente.'
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('[RegisterAPI] Error:', error.response ? error.response.data : error.message);

        const errorMsg = error.response?.data?.message || error.message || 'Error del servidor';

        // Handle common WooCommerce errors
        if (errorMsg.includes('existing_user_login') || errorMsg.includes('existing_user_email')) {
            return NextResponse.json({
                success: false,
                message: 'Ya existe una cuenta registrada con este correo electrónico.'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: errorMsg
        }, { status: 500 });
    }
}
