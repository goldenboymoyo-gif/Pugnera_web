// Browser-safe Supabase client. Referenced by client components only.
// In Next.js, NEXT_PUBLIC_* variables are inlined at build time, so this file
// never sees the service role key.
let instance = null;

function supabaseBrowser() {
  if (typeof window === 'undefined') return null;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  if (!instance) {
    // Lazy require so the module can be imported on the server without pulling
    // the SDK into server bundles unnecessarily.
    const { createClient } = require('@supabase/supabase-js');
    instance = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return instance;
}

module.exports = { supabaseBrowser };