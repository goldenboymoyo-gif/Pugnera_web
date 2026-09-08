-- ============================================================================
-- Pugnera — 004_storage.sql
-- Supabase Storage buckets and policies.
--
-- Buckets
--   fighter-media  : approved boxer photos (public read), owner/admin write
--   event-posters  : event posters (public read), admin write
--
-- Public objects are served from the bucket public URLs. The storage.objects
-- policies below mirror the RLS model in 002_rls.sql.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('fighter-media', 'fighter-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('event-posters', 'event-posters', true)
on conflict (id) do nothing;

-- Read: any object in a public bucket is readable by everyone.
create policy "fighter_media_public_read" on storage.objects
  for select using (bucket_id = 'fighter-media');

create policy "event_posters_public_read" on storage.objects
  for select using (bucket_id = 'event-posters');

-- Write: authenticated users may upload media to their own folder only
-- (folder layout is "<user_id>/<filename>"). Admins may upload posters.
create policy "fighter_media_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'fighter-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "event_posters_insert_admin" on storage.objects
  for insert with check (
    bucket_id = 'event-posters' and public.is_admin()
  );

create policy "fighter_media_delete_own" on storage.objects
  for delete using (
    bucket_id = 'fighter-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "event_posters_delete_admin" on storage.objects
  for delete using (
    bucket_id = 'event-posters' and public.is_admin()
  );