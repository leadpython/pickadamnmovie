import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a Supabase client with the service role key (for server-side operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Create a Supabase client with the anon key (for client-side operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the URL for reference if needed
export const supabaseConfig = {
  url: supabaseUrl,
  serviceRoleKey: supabaseServiceRoleKey,
}; 