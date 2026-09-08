-- ============================================================================
-- Pugnera — 002_rls.sql
-- Row Level Security. Every table in the schema gets policies here.
--
-- Principles
--   * Nobody can bypass RLS from a client SDK. The `service_role` key may only
--     be used server-side and is used for operations the browser is never
--     allowed to perform directly (listed in docs/BACKEND.md).
--   * Users may only read/write their own profile data.
--   * Administrators are identified by a row in public.admin_roles; that check
--     always runs through the security-definer function public.is_admin()
--     (defined in 003_functions.sql) so a user can never grant it to herself.
--   * Public content (approved fighters, published events, fights, active
--     rankings, weight classes, countries) is readable anonymously.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select using (auth.uid() = user_id);

create policy profiles_update_own on public.profiles
  for update using (auth.uid() = user_id);

-- No insert/delete policies: rows are created by the handle_new_user trigger
-- running as the table owner, and a user can never delete her own profile row.

-- ---------------------------------------------------------------------------
-- boxer_profiles
-- ---------------------------------------------------------------------------
alter table public.boxer_profiles enable row level security;

create policy boxer_profiles_select_approved on public.boxer_profiles
  for select using (status = 'approved');

create policy boxer_profiles_select_own on public.boxer_profiles
  for select using (auth.uid() = profile_id);

create policy boxer_profiles_insert_own on public.boxer_profiles
  for insert with check (auth.uid() = profile_id);

create policy boxer_profiles_update_own on public.boxer_profiles
  for update using (auth.uid() = profile_id);

-- No delete policy: a boxer profile is only ever suspended by an admin.

-- ---------------------------------------------------------------------------
-- fan_profiles
-- ---------------------------------------------------------------------------
alter table public.fan_profiles enable row level security;

create policy fan_profiles_select_own on public.fan_profiles
  for select using (auth.uid() = profile_id);

create policy fan_profiles_insert_own on public.fan_profiles
  for insert with check (auth.uid() = profile_id);

create policy fan_profiles_update_own on public.fan_profiles
  for update using (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- countries / weight_classes (public reference data)
-- ---------------------------------------------------------------------------
alter table public.countries enable row level security;

create policy countries_select_public on public.countries
  for select using (true);

alter table public.weight_classes enable row level security;

create policy weight_classes_select_public on public.weight_classes
  for select using (true);

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;

create policy events_select_published on public.events
  for select using (status = 'published');

create policy events_insert_admin on public.events
  for insert with check (public.is_admin());

create policy events_update_admin on public.events
  for update using (public.is_admin());

create policy events_delete_admin on public.events
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- fights
-- ---------------------------------------------------------------------------
alter table public.fights enable row level security;

create policy fights_select_scheduled_or_completed on public.fights
  for select using (status in ('scheduled', 'completed'));

create policy fights_insert_admin on public.fights
  for insert with check (public.is_admin());

create policy fights_update_admin on public.fights
  for update using (public.is_admin());

create policy fights_delete_admin on public.fights
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- rankings (admin-only writes; active rankings are public)
-- ---------------------------------------------------------------------------
alter table public.rankings enable row level security;

create policy rankings_select_active on public.rankings
  for select using (status = 'active');

create policy rankings_insert_admin on public.rankings
  for insert with check (public.is_admin());

create policy rankings_update_admin on public.rankings
  for update using (public.is_admin());

create policy rankings_delete_admin on public.rankings
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- follows (only the follower's own rows)
-- ---------------------------------------------------------------------------
alter table public.follows enable row level security;

create policy follows_select_own on public.follows
  for select using (auth.uid() = follower_id);

create policy follows_insert_own on public.follows
  for insert with check (auth.uid() = follower_id);

create policy follows_delete_own on public.follows
  for delete using (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------
-- notifications (recipient manages own)
-- ---------------------------------------------------------------------------
alter table public.notifications enable row level security;

create policy notifications_select_own on public.notifications
  for select using (auth.uid() = user_id);

create policy notifications_update_own on public.notifications
  for update using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- media (owners manage their uploads; public files are public in storage)
-- ---------------------------------------------------------------------------
alter table public.media enable row level security;

create policy media_select_own on public.media
  for select using (auth.uid() = user_id);

create policy media_insert_own on public.media
  for insert with check (auth.uid() = user_id);

create policy media_delete_own on public.media
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- admin_roles (administrators only; users cannot insert their own rows)
-- ---------------------------------------------------------------------------
alter table public.admin_roles enable row level security;

create policy admin_roles_select_admin on public.admin_roles
  for select using (public.is_admin());

create policy admin_roles_insert_super_admin on public.admin_roles
  for insert with check (public.is_admin() and
    (select a.role from public.admin_roles a where a.user_id = auth.uid()) = 'super_admin');

create policy admin_roles_update_super_admin on public.admin_roles
  for update using (public.is_admin() and
    (select a.role from public.admin_roles a where a.user_id = auth.uid()) = 'super_admin');

create policy admin_roles_delete_super_admin on public.admin_roles
  for delete using (public.is_admin() and
    (select a.role from public.admin_roles a where a.user_id = auth.uid()) = 'super_admin');

-- ---------------------------------------------------------------------------
-- audit_logs (append-only; administrators may read)
-- ---------------------------------------------------------------------------
alter table public.audit_logs enable row level security;

create policy audit_logs_select_admin on public.audit_logs
  for select using (public.is_admin());

-- No insert/update/delete policies: rows are written via the audit_log
-- security-definer function (003_functions.sql).