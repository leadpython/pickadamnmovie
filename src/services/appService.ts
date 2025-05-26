import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://totfhikajvnkqruhrtez.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvdGZoaWthanZua3FydWhydGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzQ5MzYsImV4cCI6MjA2MzgxMDkzNn0.BQQd_zAns_WERXba-VZmzIDWI_4dyY4TC8aDKzvZzy4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API methods
export const appService = {
  // Beta key methods
  validateBetaKey: async (key: string) => {
    const { data, error } = await supabase
      .from('betakeys')
      .select('id')
      .eq('id', key)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    return data;
  },
};

export default appService; 