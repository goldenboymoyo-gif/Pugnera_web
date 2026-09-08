// Shared getServerSideProps guard for admin pages. Redirects to /login for
// anonymous users and to "/" for signed-in non-admins.
import { requireAdmin } from './auth';
import { supabaseAdmin } from './supabase/server';

export async function adminGate(ctx) {
  const gate = await requireAdmin(ctx.req);
  if (!gate.user) {
    return {
      redirect: {
        destination: gate.reason === 'forbidden' ? '/' : '/login?next=/admin',
        permanent: false,
      },
    };
  }
  const supabase = supabaseAdmin();
  let username = gate.user.email || 'admin';
  if (supabase) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', gate.user.id)
      .maybeSingle();
    if (profile) username = profile.username;
  }
  return { props: { admin: { username, role: gate.role } } };
}