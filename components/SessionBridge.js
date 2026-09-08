// Rendered once per page load (from _app). Keeps the httpOnly session cookie
// in sync with the browser's Supabase session, including token refreshes.
// No network/DB work happens when the backend is not configured.
import { useEffect } from 'react';
import { supabaseBrowser } from '../lib/supabase/client';
import { syncSessionCookie } from '../lib/client-api';

export default function SessionBridge() {
  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) return undefined;

    syncSessionCookie();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
        // Deliberately outside the auth callback to avoid Supabase's infinite
        // loop guard; the current session is read directly.
        setTimeout(syncSessionCookie, 0);
      }
    });

    return () => {
      if (sub && sub.subscription) sub.subscription.unsubscribe();
    };
  }, []);

  return null;
}