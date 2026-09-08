// Server-side authentication helpers.
//
// The browser keeps its Supabase session in localStorage (see
// lib/supabase/client.js). A SessionBridge component mirrors the current
// access token into an httpOnly cookie (pages/api/auth/session.js) so that
// getServerSideProps and API routes can verify the caller via getUser(token).
//
// The access token is a short-lived JWT; to keep the cookie fresh, the
// SessionBridge re-syncs it whenever the client session changes or refreshes.
const { createClient } = require('@supabase/supabase-js');
const { supabaseAdmin } = require('./supabase/server');

const SESSION_COOKIE = 'sb_access_token';

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
}

function getTokenFromCookies(req) {
  const cookies = (req && req.cookies) || {};
  return cookies[SESSION_COOKIE] || null;
}

// Verify an access token against Supabase. Returns { user } or { user: null }.
async function getUserFromToken(token) {
  if (!token) return null;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

async function getUserFromRequest(req) {
  return getUserFromToken(getTokenFromCookies(req));
}

// Load the public profile row for an authenticated user.
async function getProfileForUser(user) {
  if (!user) return null;
  const supabase = supabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  return data || null;
}

// Resolve the admin role for a user id (null when the user is not an admin).
async function getAdminRole(userId) {
  if (!userId) return null;
  const supabase = supabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase.from('admin_roles').select('role').eq('user_id', userId).maybeSingle();
  return data ? data.role : null;
}

async function requireAdmin(req) {
  const user = await getUserFromRequest(req);
  if (!user) return { user: null, role: null, reason: 'unauthenticated' };
  const role = await getAdminRole(user.id);
  if (!role) return { user, role: null, reason: 'forbidden' };
  return { user, role, reason: null };
}

module.exports = {
  SESSION_COOKIE,
  cookieOptions,
  getTokenFromCookies,
  getUserFromToken,
  getUserFromRequest,
  getProfileForUser,
  getAdminRole,
  requireAdmin,
};