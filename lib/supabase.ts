import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zjnnfyocvlzpxscrjbcw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_ANON_KEY environment variable is required');
}

export const supabase = createClient(supabaseUrl, supabaseKey);