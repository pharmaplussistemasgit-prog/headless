import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    // We shouldn't throw error here to avoid breaking build if envs are missing locally
    console.warn("⚠️ Warning: Supabase Environment Variables missing (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Silent Sync will fail.");
}

// Create a single supabase client for interacting with your database
// This client has admin privileges (Service Role), so ONLY use it in API Routes (server-side).
// NEVER expose this client to the browser.
export const supabaseAdmin = createClient(
    SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY || '',
    {
        auth: {
            persistSession: false, // We don't need to persist session for admin tasks
            autoRefreshToken: false,
        }
    }
);
