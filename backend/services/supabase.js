const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Ensure env variables are loaded (primarily for scripts running independently)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
    console.warn('⚠️  SUPABASE_URL or SUPABASE_KEY not set in .env — Supabase integration will not work properly.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
