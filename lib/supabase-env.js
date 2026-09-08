// Shared helpers for reading Supabase configuration.
//
// Environment surface (never leaked to the browser):
//   NEXT_PUBLIC_SUPABASE_URL      — public URL (safe to expose)
//   NEXT_PUBLIC_SUPABASE_ANON_KEY — anon key (safe to expose; RLS-protected)
//   SUPABASE_SERVICE_ROLE_KEY     — service role key (SERVER ONLY)
//
// The service role key bypasses RLS and therefore must never appear in a
// NEXT_PUBLIC_* variable, in client bundles, or in committed files.

function publicConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function serverConfigured() {
  return publicConfigured() && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

module.exports = { publicConfigured, serverConfigured };