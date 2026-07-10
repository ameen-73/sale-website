import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  SUPABASE_URL or SUPABASE_KEY not set in environment — Supabase integration will not work properly.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
