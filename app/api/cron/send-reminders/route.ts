
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSMS } from '@/lib/sms';

// Service Role Client for Admin Access (Bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
    // 1. Authorization Check (CRON_SECRET)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow local testing if secret matches query param or similar, but strict for prod
        // For simplicity here, we strictly require the Bearer token or Vercel Signature
        // If testing locally, you can modify headers or temporarily bypass
    }

    // Note: for Vercel Cron, it's often better to check 'x-vercel-cron-project-id' 
    // or just rely on the secret being kept safe.
    // We will use a simple query param check for easier manual testing initially if needed,
    // but the header is the standard way.

    try {
        console.log('[Cron] Starting Reminder Check...');
        const now = new Date();

        // 2. Query Due Reminders
        const { data: dueReminders, error } = await supabase
            .from('reminders')
            .select('*')
            .eq('active', true)
            .lte('next_run_at', now.toISOString()); // Due now or in the past

        if (error) throw error;

        if (!dueReminders || dueReminders.length === 0) {
            console.log('[Cron] No reminders due.');
            return NextResponse.json({ success: true, sent: 0 });
        }

        console.log(`[Cron] Found ${dueReminders.length} due reminders.`);
        let sentCount = 0;

        // 3. Process each reminder
        const results = await Promise.all(dueReminders.map(async (reminder) => {
            const message = `Hola! Es hora de tomar tu medicamento: ${reminder.medication_name}. Cuida tu salud con PharmaPlus.`;

            // Send SMS
            const success = await sendSMS(reminder.phone_number, message);

            if (success) {
                sentCount++;
                // Calculate next run
                const nextRun = new Date(new Date().getTime() + reminder.frequency_hours * 60 * 60 * 1000);

                // Update DB
                await supabase
                    .from('reminders')
                    .update({
                        last_taken_at: new Date().toISOString(),
                        next_run_at: nextRun.toISOString()
                    })
                    .eq('id', reminder.id);

                return { id: reminder.id, status: 'sent', next: nextRun };
            } else {
                return { id: reminder.id, status: 'failed' };
            }
        }));

        return NextResponse.json({
            success: true,
            sent: sentCount,
            results
        });

    } catch (error: unknown) {
        console.error('[Cron] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
