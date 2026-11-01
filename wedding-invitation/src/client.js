import { createClient } from '@supabase/supabase-js';
export const url = import.meta.env.VITE_SUPABASE_URL;
export const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const client = url && anon ? createClient(url, anon) : null;
