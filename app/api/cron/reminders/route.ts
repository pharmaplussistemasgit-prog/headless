import { createClient } from '@supabase/supabase-js';
import { sendSMS } from '@/lib/sms';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const now = new Date();
        const nowISO = now.toISOString();

        // 1. Fetch due reminders
        const { data: reminders, error } = await supabase
            .from('reminders')
            .select('*')
            .lte('next_run_at', nowISO)
            .eq('active', true);

        if (error) throw error;

        let sentCount = 0;

        // 2. Process each reminder
        for (const r of reminders) {
            // Send SMS
            const msg = `💊 PharmaPlus: Hora de tomar tu ${r.medication_name}. Dosis: ${r.dose_quantity}.`;
            const sent = await sendSMS(r.phone_number || '3000000000', msg); // Fallback phone or get from user

            if (sent) {
                // Calculate next run
                const nextDate = new Date(r.next_run_at);
                if (r.frequency_type === 'every_x_hours' && r.frequency_hours) {
                    nextDate.setTime(nextDate.getTime() + (r.frequency_hours * 60 * 60 * 1000));
                } else {
                    // Default to next day same time
                    nextDate.setDate(nextDate.getDate() + 1);
                }

                // Decrement stock if tracking
                let newStock = r.current_stock;
                if (r.notify_low_stock) {
                    newStock = Math.max(0, r.current_stock - r.dose_quantity);
                    if (newStock <= r.low_stock_threshold && r.current_stock > r.low_stock_threshold) {
                        await sendSMS(r.phone_number, `⚠️ PharmaPlus: Tu ${r.medication_name} se está acabando. Quedan ${newStock}.`);
                    }
                }

                // Update DB
                await supabase.from('reminders').update({
                    last_taken_at: nowISO,
                    next_run_at: nextDate.toISOString(),
                    current_stock: newStock
                }).eq('id', r.id);

                sentCount++;
            }
        }

        return NextResponse.json({ success: true, processed: reminders.length, sent: sentCount });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
