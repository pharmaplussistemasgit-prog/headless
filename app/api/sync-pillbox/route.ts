import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Verify WordPress Session (Verify Token Logic)
        // Ideally we should call WP verify endpoint, but for "Silent Sync" fast implementation 
        // we can trust the decoded JWT if we assume the client is valid or double check with WP.
        // For security lvl 1 we will just decode and trust (since WP handles auth). 
        // For higher security, we should call: GET /wp-json/wp/v2/users/me ?context=edit with this token.

        // Let's implement a verification call to be safe:
        const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me?context=edit`, {
            headers: {
                'Authorization': authHeader
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const user = await response.json();
        const userId = String(user.id);

        if (!userId) {
            return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
        }

        const body = await request.json();
        const { reminders } = body; // Expecting array of local reminders

        if (!Array.isArray(reminders)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // 2. Sync Logic (Simple Strategy: Overwrite/Merge)
        // Strategy: "Server Authority for ID match, Client for content"
        // For this phase, we'll do a simple "Save All" from client (Client -> Server)
        // Or "Upsert". 
        // Let's go with UPSERT based on medication name + user_id or a unique local ID if we had one.
        // Since we generated IDs locally with crypto.randomUUID(), we can plain Upsert using 'id'.

        // But wait, local IDs are random. If user cleans cache, they generate new IDs.
        // So we should upsert.

        if (reminders.length > 0) {
            const { error: upsertError } = await supabaseAdmin
                .from('reminders')
                .upsert(
                    reminders.map((r: any) => ({
                        id: r.id, // Ensure local ID is UUID
                        user_id: userId,
                        medication_name: r.productName || r.medication_name,
                        dosage: r.dosage,
                        frequency: r.frequency,
                        dates: r.dates,
                        product_image: r.productImage,
                        active: r.active !== false,
                        updated_at: new Date().toISOString()
                    }))
                );

            if (upsertError) {
                console.error('Supabase Upsert Error:', upsertError);
                return NextResponse.json({ error: 'Database Sync Failed' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, message: 'Synced successfully' });

    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Verify WP Token
        const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me?context=edit`, {
            headers: { 'Authorization': authHeader }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const user = await response.json();
        const userId = String(user.id);

        // 2. Fetch from Supabase
        const { data: reminders, error } = await supabaseAdmin
            .from('reminders')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Supabase Fetch Error:', error);
            return NextResponse.json({ error: 'Fetch Failed' }, { status: 500 });
        }

        // Map back to frontend structure if needed
        const mappedReminders = reminders.map(r => ({
            id: r.id,
            productName: r.medication_name,
            dosage: r.dosage,
            frequency: r.frequency,
            dates: r.dates,
            productImage: r.product_image,
            active: r.active
        }));

        return NextResponse.json({ success: true, reminders: mappedReminders });

    } catch (error) {
        console.error('Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
