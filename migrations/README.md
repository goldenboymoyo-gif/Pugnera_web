# Pugnera — Database Migrations

Apply in order, from the Supabase SQL editor (or a migration runner).

| File | Purpose |
| --- | --- |
| `001_schema.sql` | Tables, constraints, indexes, `updated_at` triggers |
| `002_rls.sql` | Row Level Security policies for every table |
| `003_functions.sql` | Auth trigger, `is_admin()`, guard triggers, audited admin functions |
| `004_storage.sql` | Storage buckets (`fighter-media`, `event-posters`) + policies |
| `005_reference_data.sql` | Real reference data: countries, weight classes |
| `006_admin_setup.sql` | *Manual* first-admin grant (documented in-file) |

## Ordering rules

- `001` must run first (other files reference its tables).
- `003` defines `public.is_admin()`, which `002` policies reference, so
  **run 002 and 003 in the same project before relying on admin actions**.
  (Safest is: 001 → 002 → 003 → 004 → 005.)

## First admin

1. Finish a normal registration so the user exists in `auth.users`.
2. Run the commented statement in `006_admin_setup.sql` for that email.
3. Sign in as that user — `/admin` unlocks.

## Notes

- `service_role` may never be used client-side. Browser apps use the anon key
  and rely on RLS.
- Official boxer records, `status` and `verified` are only mutable through the
  admin functions, which write an `audit_logs` row for every change.