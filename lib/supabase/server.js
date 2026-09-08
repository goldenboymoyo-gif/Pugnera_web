// Server-side Supabase clients.
//
// supabaseAdmin()  — service role client. Bypasses RLS. SERVER ONLY.
// supabaseAnon()   — anon key client for server-side public reads that must
//                     respect RLS (used by getServerSideProps).
// Both return null when the environment is not configured, which callers use
// to fall back to static content.
const { createClient } = require('@supabase/supabase-js');

let admin = null;
let anon = null;

function supabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!admin) {
    admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { 'x-application-name': 'pugnera-server' } },
    });
  }
  return admin;
}

function supabaseAnon() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  if (!anon) {
    anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return anon;
}

module.exports = { supabaseAdmin, supabaseAnon };