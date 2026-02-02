'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Note: Ensure we have the user ID securely.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Reminder {
    id: string;
    user_id: string;
    medication_name: string;
    medication_image?: string;
    // Scheduling
    frequency_type: 'daily' | 'every_x_hours';
    frequency_hours?: number;
    specific_times?: string[];
    start_date: string;
    end_date?: string;
    // Dosage & Stock
    dose_quantity: number;
    current_stock: number;
    low_stock_threshold: number;
    notify_low_stock: boolean;
    last_taken_at?: string;
    next_run_at?: string;
    active: boolean;
    phone_number?: string;
}

export async function getReminders(userId: string) {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('next_run_at', { ascending: true });

    if (error) {
        console.error('Error fetching reminders:', error);
        return [];
    }
    return data as Reminder[];
}

export async function addReminder(formData: FormData, userId?: string) {
    const hiddenId = formData.get('user_id') as string;
    console.log('[Pillbox] addReminder Debug:', { argUserId: userId, hiddenUserId: hiddenId });

    // Robust check: Get from arg OR from form data
    const finalUserId = userId || hiddenId;

    if (!finalUserId) {
        console.error('[Pillbox] Unauthorized: Missing User ID. FormData keys:', Array.from(formData.keys()));
        throw new Error('Unauthorized: No User ID provided');
    }

    const medicationName = formData.get('medication_name') as string;
    const dos_qty = parseInt(formData.get('dose_quantity') as string) || 1;
    const stock = parseInt(formData.get('current_stock') as string) || 0;
    const low_stock = parseInt(formData.get('low_stock_threshold') as string) || 5;
    const notify_stock = formData.get('notify_low_stock') === 'on';

    // --- DATE & TIME LOGIC ---
    let start_date_str = formData.get('start_date') as string; // YYYY-MM-DD
    const start_time_str = formData.get('start_time') as string; // HH:MM

    // Default to today if missing
    if (!start_date_str) {
        start_date_str = new Date().toISOString().split('T')[0];
    }

    // Construct simplified ISO string
    const timeToUse = start_time_str || '08:00';
    const startFullDate = new Date(`${start_date_str}T${timeToUse}:00`);

    // Use this as the official start_date and the FIRST run time
    const start_date = startFullDate.toISOString();
    const nextRun = startFullDate; // First run is at the start time

    // Calculate End Date
    const duration_days = parseInt(formData.get('duration_days') as string);
    let end_date = null;
    if (duration_days) {
        const d = new Date(startFullDate);
        d.setDate(d.getDate() + duration_days);
        end_date = d.toISOString();
    }

    const frequency_type = formData.get('frequency_type') as string; // 'daily' | 'every_x_hours'

    const payload: any = {
        user_id: finalUserId,
        medication_name: medicationName,
        dose_quantity: dos_qty,
        current_stock: stock,
        low_stock_threshold: low_stock,
        notify_low_stock: notify_stock,
        start_date: start_date,
        end_date: end_date,
        frequency_type: frequency_type,
        active: true,
        next_run_at: nextRun.toISOString()
    };

    if (frequency_type === 'every_x_hours') {
        const hours = parseInt(formData.get('frequency_hours') as string);
        payload.frequency_hours = hours;
    }

    const { error } = await supabase.from('reminders').insert(payload);

    if (error) {
        console.error('Error adding reminder:', error);
        throw new Error('Could not add reminder');
    }

    revalidatePath('/mi-cuenta/pastillero');
    return { success: true };
}

export async function deleteReminder(reminderId: string, userId: string) {
    if (!userId) throw new Error('Unauthorized');
    const { error } = await supabase.from('reminders').delete().eq('id', reminderId).eq('user_id', userId);
    if (error) {
        console.error('Error deleting reminder:', error);
        throw new Error('Failed to delete');
    }
    revalidatePath('/mi-cuenta/pastillero');
    return { success: true };
}
