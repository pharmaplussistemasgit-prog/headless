import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendSMS } from '@/lib/sms';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            patient_name,
            phone_number,
            medication_name,
            start_date,
            first_dose_time,
            frequency_hours,
            dose_quantity,
            duration_days,
            manage_inventory,
            current_stock,
            stock_alert_threshold,
            user_email
        } = body;

        // Validation
        if (!patient_name || !phone_number || !medication_name || !first_dose_time) {
            return NextResponse.json({ success: false, error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
        }

        // 1. Insert into Database
        const { data, error: dbError } = await (supabaseAdmin as any)
            .from('pillbox_reminders')
            .insert([
                {
                    patient_name,
                    phone_number: phone_number.replace(/\D/g, ''), // Normalize
                    medication_name,
                    start_date: start_date || new Date().toISOString().split('T')[0],
                    first_dose_time,
                    frequency_hours: frequency_hours ? parseInt(frequency_hours) : null,
                    dose_quantity: dose_quantity ? parseInt(dose_quantity) : 1,
                    duration_days: duration_days ? parseInt(duration_days) : null,
                    manage_inventory: manage_inventory || false,
                    current_stock: current_stock ? parseInt(current_stock) : null,
                    stock_alert_threshold: stock_alert_threshold ? parseInt(stock_alert_threshold) : null,
                    user_email: user_email || null
                }
            ])
            .select()
            .single();

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            return NextResponse.json({ success: false, error: 'Error al guardar en base de datos: ' + dbError.message }, { status: 500 });
        }

        // 2. Send Confirmation SMS
        const smsMessage = `Hola ${patient_name}, recordatorio activado para ${medication_name}. 1ra dosis: ${first_dose_time}. Frecuencia: Cada ${frequency_hours}h. PharmaPlus te cuida.`;
        const smsResult = await sendSMS(phone_number, smsMessage);

        return NextResponse.json({
            success: true,
            data,
            sms_sent: smsResult.success
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!supabaseAdmin) {
            return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
        }

        let query = (supabaseAdmin as any)
            .from('pillbox_reminders')
            .select('*')
            .order('created_at', { ascending: false });

        if (email) {
            query = query.eq('user_email', email);
        } else {
            // If no email provided, maybe return empty or public ones? 
            // For privacy, let's return empty if no email, or limit to 10 latest for public demo?
            // Let's require email for filtering for now to simulate "My Account"
            return NextResponse.json({ success: true, data: [] });
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('API GET Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
