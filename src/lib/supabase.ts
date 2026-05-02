import { createClient } from '@supabase/supabase-js';

// Self-hosters who haven't filled in .env yet (or are just kicking the tires
// in demo mode) shouldn't get a hard crash on first load. Supabase v2's
// createClient() validates the URL shape synchronously — passing an empty
// string throws "supabaseUrl is required" before the React tree even mounts.
//
// To preserve the "demo mode works without any setup" promise, we substitute
// safe-shape placeholders when env vars are missing. The placeholder URL will
// fail DNS resolution, AuthContext catches that gracefully, and demo mode
// short-circuits Supabase entirely so it never matters.
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PLACEHOLDER_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

if (
    supabaseUrl === PLACEHOLDER_URL &&
    !import.meta.env.VITE_SUPABASE_URL
) {
    console.warn(
        '[supabase] Using placeholder credentials. Demo mode will work; ' +
        'login & real campaigns require VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
