-- ============================================================================
-- Pugnera — 001_schema.sql
-- Base schema for the Pugnera backend.
--
-- Run order: 001_schema.sql -> 002_rls.sql -> 003_functions.sql
--           -> 004_storage.sql -> 005_reference_data.sql
--
-- Conventions
--   * All date/time columns are timestamptz unless a pure date is required.
--   * UUID primary keys use gen_random_uuid() (pgcrypto is enabled by default
--     on Supabase).
--   * Every table has created_at/updated_at; updated_at is maintained by the
--     set_updated_at trigger defined at the bottom of this file.
--   * Row Level Security is enabled and configured in 002_rls.sql. Not a
--     single table below is reachable from client code without a policy.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth.users row; created by handle_new_user trigger)
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  username       text not null,
  full_name      text not null default '',
  account_type   text not null default 'fan'
                 check (account_type in ('fan', 'boxer')),
  avatar_url     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on column public.profiles.username is
  'Lowercase [a-z0-9_]{3,30}, unique. Fixed at registration.';

-- Username is unique and immutable (enforced by guard trigger).
create unique index profiles_username_key on public.profiles (lower(username));
create index profiles_account_type_idx on public.profiles (account_type);

-- ---------------------------------------------------------------------------
-- Countries (ISO 3166-1 alpha-2 reference data, seeded in 005)
-- ---------------------------------------------------------------------------
create table public.countries (
  code   text primary key check (code ~ '^[A-Z]{2}$'),
  name   text not null,
  region text
);

-- ---------------------------------------------------------------------------
-- Weight classes (real professional boxing weight limits, seeded in 005)
-- ---------------------------------------------------------------------------
create table public.weight_classes (
  code        text primary key,
  name        text not null unique,
  min_lb      numeric,
  max_lb      numeric,
  order_index integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Boxer profiles (an extension of profiles for account_type = 'boxer')
-- ---------------------------------------------------------------------------
create table public.boxer_profiles (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null unique references public.profiles (user_id) on delete cascade,
  boxing_name  text,
  country_code text references public.countries (code),
  weight_class text references public.weight_classes (code),
  height_cm    numeric,
  reach_cm     numeric,
  gym          text,
  pro_debut    integer,
  wins         integer not null default 0 check (wins >= 0),
  losses       integer not null default 0 check (losses >= 0),
  draws        integer not null default 0 check (draws >= 0),
  kos          integer not null default 0 check (kos >= 0),
  -- 'self'    = self-reported by the boxer (shown as "Pugnera registered",
  --             never presented as an official record).
  -- 'official' = confirmed by an administrator from a sanctioned source.
  record_source text not null default 'self' check (record_source in ('self', 'official')),
  verified     boolean not null default false,
  bio          text,
  social_links jsonb not null default '{}'::jsonb,
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on column public.boxer_profiles.status is
  'Pending boxers are invisible to the public. Only approved boxers appear on the Fighters page.';

comment on column public.boxer_profiles.record_source is
  'A boxer may never present a self-reported record as official. Self-reported records are shown with an explicit disclaimer.';

create index boxer_profiles_status_idx on public.boxer_profiles (status);
create index boxer_profiles_country_idx on public.boxer_profiles (country_code);
create index boxer_profiles_weight_idx on public.boxer_profiles (weight_class);

-- ---------------------------------------------------------------------------
-- Fan profiles (an extension of profiles for account_type = 'fan')
-- ---------------------------------------------------------------------------
create table public.fan_profiles (
  id                       uuid primary key default gen_random_uuid(),
  profile_id               uuid not null unique references public.profiles (user_id) on delete cascade,
  follow_fighters          boolean not null default true,
  follow_events            boolean not null default true,
  preferred_weight_classes text[] not null default '{}'::text[],
  preferred_countries      text[] not null default '{}'::text[],
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Events (cards/nights). Published events are visible to everyone.
-- ---------------------------------------------------------------------------
create table public.events (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  date         date,
  time         time,
  venue        text,
  city         text,
  country_code text references public.countries (code),
  poster_url   text,
  blurb        text,
  status       text not null default 'draft' check (status in ('draft', 'published', 'cancelled')),
  created_by   uuid references public.profiles (user_id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index events_status_date_idx on public.events (status, date);

-- ---------------------------------------------------------------------------
-- Fights (individual bouts). A fight belongs to zero or one event.
-- ---------------------------------------------------------------------------
create table public.fights (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  event_id       uuid references public.events (id) on delete set null,
  boxer1_profile uuid references public.boxer_profiles (id),
  boxer2_profile uuid references public.boxer_profiles (id),
  weight_class   text references public.weight_classes (code),
  date           date,
  venue          text,
  country_code   text references public.countries (code),
  status         text not null default 'scheduled'
                 check (status in ('scheduled', 'completed', 'cancelled')),
  result_winner  uuid references public.boxer_profiles (id),
  result_method  text,
  result_round   integer check (result_round > 0),
  video_ref      text,
  created_by     uuid references public.profiles (user_id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint fights_no_self_fight check (boxer1_profile is null or boxer2_profile is null or boxer1_profile <> boxer2_profile)
);

create index fights_status_date_idx on public.fights (status, date);
create index fights_event_idx on public.fights (event_id);

-- ---------------------------------------------------------------------------
-- Rankings (admin-only writes). Positions are per weight class per period.
-- ---------------------------------------------------------------------------
create table public.rankings (
  id             uuid primary key default gen_random_uuid(),
  weight_class   text not null references public.weight_classes (code),
  position       integer not null check (position between 1 and 50),
  boxer_profile  uuid not null references public.boxer_profiles (id) on delete cascade,
  period         text not null, -- e.g. '2026-07'
  source         text,          -- e.g. 'Pugnera editorial panel'
  status         text not null default 'active' check (status in ('active', 'archived')),
  created_by     uuid references public.profiles (user_id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint rankings_unique_slot unique (weight_class, position, period)
);

create index rankings_active_idx on public.rankings (status);
create index rankings_boxer_idx on public.rankings (boxer_profile);

-- ---------------------------------------------------------------------------
-- Follows (fans follow fighters, events, weight classes, countries)
-- ---------------------------------------------------------------------------
create table public.follows (
  id          uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles (user_id) on delete cascade,
  follow_type text not null check (follow_type in ('fighter', 'event', 'weight_class', 'country')),
  target_id   text not null,
  created_at  timestamptz not null default now(),
  constraint follows_unique unique (follower_id, follow_type, target_id)
);

create index follows_follower_idx on public.follows (follower_id);
create index follows_target_idx on public.follows (follow_type, target_id);

-- ---------------------------------------------------------------------------
-- Notifications (delivered to a user; read flag managed by the user)
-- ---------------------------------------------------------------------------
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null,
  body       text not null default '',
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, is_read);

-- ---------------------------------------------------------------------------
-- Media (uploads to Supabase Storage, tracked metadata)
-- ---------------------------------------------------------------------------
create table public.media (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  bucket     text not null,
  path       text not null,
  mimetype   text,
  size_bytes bigint check (size_bytes >= 0),
  created_at timestamptz not null default now()
);

create index media_user_idx on public.media (user_id);

-- ---------------------------------------------------------------------------
-- Admin roles (extensible: super_admin > admin > editor > moderator).
-- A user is an administrator only if a row exists here.
-- ---------------------------------------------------------------------------
create table public.admin_roles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'admin'
             check (role in ('super_admin', 'admin', 'editor', 'moderator')),
  granted_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Audit logs (append-only; only administrators may read)
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid references auth.users (id),
  action      text not null,
  target_type text,
  target_id   text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_target_idx on public.audit_logs (target_type, target_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger boxer_profiles_set_updated_at
  before update on public.boxer_profiles
  for each row execute function public.set_updated_at();

create trigger fan_profiles_set_updated_at
  before update on public.fan_profiles
  for each row execute function public.set_updated_at();

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create trigger fights_set_updated_at
  before update on public.fights
  for each row execute function public.set_updated_at();

create trigger rankings_set_updated_at
  before update on public.rankings
  for each row execute function public.set_updated_at();