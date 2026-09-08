// Thin fetch wrapper used by client components. Adds the anti-CSRF header to
// every request and normalises failures into { ok:false, error, status }.
import { supabaseBrowser } from '../lib/supabase/client';

export async function apiFetch(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-requested-with': 'pugnera',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
    });
  } catch (err) {
    return { ok: false, error: 'Network error', status: 0 };
  }

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    return { ok: false, error: (data && data.error) || `Request failed (${res.status})`, status: res.status, data };
  }
  return { ok: true, status: res.status, data: data || {} };
}

// Syncs the client Supabase session (localStorage) into the httpOnly cookie.
export async function syncSessionCookie() {
  const supabase = supabaseBrowser();
  if (!supabase) return;

  const { data } = await supabase.auth.getSession();
  const accessToken = data && data.session ? data.session.access_token : null;
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-requested-with': 'pugnera' },
    body: JSON.stringify({ accessToken }),
    credentials: 'same-origin',
  });
}