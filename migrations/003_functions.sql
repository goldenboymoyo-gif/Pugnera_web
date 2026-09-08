-- ============================================================================
-- Pugnera — 003_functions.sql
-- Security-definer functions, triggers and admin operations.
--
-- Everything the browser is allowed to do is already covered by RLS policies
-- (002_rls.sql). This file adds the pieces a client SDK can never do safely:
--   1. handle_new_user()          — profile auto-creation on auth signup
--   2. is_admin()                 — single source of truth for admin checks
--   3. guard triggers             — immutable/protected columns
--   4. admin_* security-definer   — privileged transitions (always audited)
--   5. record_audit()             — append-only audit writes
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Profile auto-creation on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta            jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_username      text;
  v_full_name     text;
  v_account_type  text;
  v_trimmed       text;
  v_safe_username text;
begin
  -- account_type may only ever be 'fan' or 'boxer'. A malicious client can send
  -- anything here through the public signup endpoint; anything else becomes 'fan'.
  v_account_type := lower(trim(coalesce(meta ->> 'account_type', '')));
  if v_account_type not in ('fan', 'boxer') then
    v_account_type := 'fan';
  end if;

  v_full_name := trim(coalesce(meta ->> 'full_name', ''));
  v_full_name := left(v_full_name, 80);

  -- Username: [a-z0-9_] 3-30, lowercased. Fall back to the email local part.
  v_trimmed := lower(trim(coalesce(meta ->> 'username', '')));
  v_safe_username := regexp_replace(v_trimmed, '[^a-z0-9_]', '', 'g');
  if length(v_safe_username) < 3 then
    v_safe_username := lower(split_part(new.email, '@', 1));
    v_safe_username := regexp_replace(v_safe_username, '[^a-z0-9_]', '', 'g');
  end if;
  if length(v_safe_username) < 3 then
    v_safe_username := 'user';
  end if;
  v_safe_username := left(v_safe_username, 30);

  -- Unique-usernames must not break signup: append a short suffix on conflict.
  if exists (select 1 from public.profiles where username = v_safe_username) then
    v_safe_username := left(v_safe_username, 26) || '_' || substr(md5(random()::text || new.email), 1, 4);
  end if;

  insert into public.profiles (user_id, username, full_name, account_type)
  values (new.id, v_safe_username, v_full_name, v_account_type);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. is_admin() — single source of truth
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admin_roles where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- 3. Guard triggers: immutable / protected columns
--
--    * profiles.account_type  — chosen at signup, may never change
--    * profiles.username      — part of the public identity, may never change
--    * boxer_profiles official record + status — only via admin_* functions,
--      which set app.admin_op inside a transaction before writing.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if new.username is distinct from old.username then
    raise exception 'profiles.username is immutable';
  end if;
  if new.account_type is distinct from old.account_type then
    raise exception 'profiles.account_type is immutable';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_protected_columns
  before update on public.profiles
  for each row execute function public.guard_profile_columns();

create or replace function public.guard_boxer_columns()
returns trigger
language plpgsql
as $$
begin
  -- Only admin operations (which set app.admin_op within an audited,
  -- security-definer function) may touch these columns.
  if coalesce(current_setting('app.admin_op', true), '') <> 'on' then
    if new.status         is distinct from old.status
       or new.verified    is distinct from old.verified
       or new.wins        is distinct from old.wins
       or new.losses      is distinct from old.losses
       or new.draws       is distinct from old.draws
       or new.kos         is distinct from old.kos
       or new.record_source is distinct from old.record_source
    then
      raise exception 'Status, verification and official record can only be changed by an administrator';
    end if;
  end if;
  return new;
end;
$$;

create trigger boxer_profiles_guard_protected_columns
  before update on public.boxer_profiles
  for each row execute function public.guard_boxer_columns();

-- ---------------------------------------------------------------------------
-- 4. Admin operations (always audited)
-- ---------------------------------------------------------------------------
create or replace function public.record_audit(
  p_action      text,
  p_target_type text default null,
  p_target_id   text default null,
  p_metadata    jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), p_action, p_target_type, p_target_id, p_metadata);
end;
$$;

create or replace function public.admin_set_boxer_status(
  p_boxer uuid,
  p_status text,
  p_note text default null
)
returns public.boxer_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.boxer_profiles;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if p_status not in ('pending', 'approved', 'rejected', 'suspended') then
    raise exception 'Invalid status';
  end if;

  perform set_config('app.admin_op', 'on', true);
  update public.boxer_profiles bp
     set status = p_status
   where bp.id = p_boxer
  returning * into updated;

  if updated.id is null then
    raise exception 'Boxer profile not found';
  end if;

  perform public.record_audit(
    p_action      => 'boxer.status',
    p_target_type => 'boxer_profile',
    p_target_id   => p_boxer::text,
    p_metadata    => jsonb_build_object('from', coalesce(updated.status, '?'), 'status', p_status, 'note', p_note)
  );
  return updated;
end;
$$;

create or replace function public.admin_set_boxer_record(
  p_boxer uuid,
  p_wins integer default null,
  p_losses integer default null,
  p_draws integer default null,
  p_kos integer default null,
  p_source text default 'official'
)
returns public.boxer_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.boxer_profiles;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if p_source not in ('self', 'official') then
    raise exception 'Invalid record source';
  end if;

  perform set_config('app.admin_op', 'on', true);
  update public.boxer_profiles bp
     set wins         = coalesce(p_wins, bp.wins),
         losses       = coalesce(p_losses, bp.losses),
         draws        = coalesce(p_draws, bp.draws),
         kos          = coalesce(p_kos, bp.kos),
         record_source = p_source
   where bp.id = p_boxer
  returning * into updated;

  if updated.id is null then
    raise exception 'Boxer profile not found';
  end if;

  perform public.record_audit(
    p_action      => 'boxer.record',
    p_target_type => 'boxer_profile',
    p_target_id   => p_boxer::text,
    p_metadata    => jsonb_build_object(
      'wins', updated.wins, 'losses', updated.losses, 'draws', updated.draws,
      'kos', updated.kos, 'record_source', updated.record_source)
  );
  return updated;
end;
$$;

create or replace function public.admin_toggle_verification(p_boxer uuid, p_verified boolean default true)
returns public.boxer_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.boxer_profiles;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  perform set_config('app.admin_op', 'on', true);
  update public.boxer_profiles bp
     set verified = coalesce(p_verified, false)
   where bp.id = p_boxer
  returning * into updated;

  if updated.id is null then
    raise exception 'Boxer profile not found';
  end if;

  perform public.record_audit(
    p_action      => 'boxer.verify',
    p_target_type => 'boxer_profile',
    p_target_id   => p_boxer::text,
    p_metadata    => jsonb_build_object('verified', updated.verified)
  );
  return updated;
end;
$$;

create or replace function public.admin_grant_role(
  p_user uuid,
  p_role text default 'admin'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if (select role from public.admin_roles where user_id = auth.uid()) <> 'super_admin' then
    raise exception 'Only a super admin can grant roles';
  end if;
  if p_role not in ('super_admin', 'admin', 'editor', 'moderator') then
    raise exception 'Invalid role';
  end if;

  insert into public.admin_roles (user_id, role, granted_by)
  values (p_user, p_role, auth.uid())
  on conflict (user_id) do update set role = excluded.role, granted_by = excluded.granted_by;

  perform public.record_audit(
    p_action      => 'admin.grant',
    p_target_type => 'user',
    p_target_id   => p_user::text,
    p_metadata    => jsonb_build_object('role', p_role)
  );
end;
$$;

create or replace function public.admin_revoke_role(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if (select role from public.admin_roles where user_id = auth.uid()) <> 'super_admin' then
    raise exception 'Only a super admin can revoke roles';
  end if;

  delete from public.admin_roles where user_id = p_user;

  perform public.record_audit(
    p_action      => 'admin.revoke',
    p_target_type => 'user',
    p_target_id   => p_user::text
  );
end;
$$;

-- name conflict safety: grants public execute on admin functions to authenticated + anon
grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.record_audit(text, text, text, jsonb) to authenticated;
grant execute on function public.admin_set_boxer_status(uuid, text, text) to authenticated;
grant execute on function public.admin_set_boxer_record(uuid, integer, integer, integer, integer, text) to authenticated;
grant execute on function public.admin_toggle_verification(uuid, boolean) to authenticated;
grant execute on function public.admin_grant_role(uuid, text) to authenticated;
grant execute on function public.admin_revoke_role(uuid) to authenticated;