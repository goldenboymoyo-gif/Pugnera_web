# Pugnera Backend — Supabase

This project uses **Supabase** (Postgres + Auth + Storage) for the backend. The Next.js
frontend is the only client. There is no separate API server.

---

## 1. Environment (`.env.local`)

Copy `.env.example` to `.env.local` and fill the values from
Supabase → Settings → API.

| Variable | Where it is used | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser (`lib/supabase/client.js`) | Public, RLS-enforced |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (`lib/supabase/server.js`) | Never shipped to the browser |
| `SUPABASE_AUTO_CONFIRM` | `pages/api/auth/register.js` | `true` in dev to skip email confirmation |

When the env vars are **not** configured, the app keeps working against the static
editorial content (`lib/boxing-data.js`, `lib/rankings.js`). Every DB-backed path
(`lib/db.js`) returns `source: 'static'` in that case.

---

## 2. Applying the migrations

Run the SQL files in order against your Supabase project:

1. `migrations/001_schema.sql` — tables, indexes, triggers
2. `migrations/002_rls.sql` — row level security policies
3. `migrations/003_functions.sql` — auth trigger, `is_admin()`, guard triggers, admin RPCs, audit
4. `migrations/004_storage.sql` — storage buckets and policies
5. `migrations/005_reference_data.sql` — ISO countries, weight classes
6. `migrations/006_admin_setup.sql` — **manual** first-admin grant (read the docstring)

Create the first admin manually after enabling email auth:

```sql
-- run inside the SQL editor once
select private.create_super_admin(
  'the-admin-uuid',      -- from auth.users (id)
  'owner'                -- role: owner | editor | moderator
);
```

Only users present in `public.admin_roles` are admins. Everything else in the
dashboard is enforced against that table via `is_admin()`.

---

## 3. Session model

- The browser keeps the Supabase session (localStorage) in `lib/supabase/client.js`.
- `components/SessionBridge.js` posts the current `access_token` to `POST /api/auth/session`,
  which writes an **httpOnly** cookie `sb_access_token`.
- Server code (`lib/auth.js`) verifies that cookie with
  `supabase.auth.getUser(token)` — no client-controlled data is trusted.
- `pages/api/admin/*` requires the cookie **and** membership of `admin_roles`
  (`requireAdmin`), plus anti-CSRF headers (`x-requested-with: pugnera` + origin check).

---

## 4. Security model

- RLS is enabled on every table; policies only ever compare `auth.uid()`.
- A `profiles` row is created automatically for every new auth user
  (`handle_new_user` trigger). Boxer/fan rows are upserted by the service-role
  endpoints after registration.
- `boxers.status`, `boxers.verified` and the official record columns can **only** be
  changed through security-definer functions that check `is_admin()` on the caller:
  `admin_set_boxer_status`, `admin_set_boxer_record`, `admin_toggle_verification`.
  Guard triggers block any other path, including the service role.
- Every admin mutation is written to `public.audit_logs`.
- Admin "roles" cannot be self-assigned; `admin_grant_role` / `admin_revoke_role`
  are admin-only functions too.

---

## 5. API surface (Next.js, under `/api`)

| Route | Purpose |
| --- | --- |
| `POST /api/auth/register` | Creates the auth user with the service role; pre-checks username; fakes nothing. Returns 503 when Supabase is not configured. |
| `GET  /api/auth/username` | Username availability check. |
| `POST /api/auth/session` | Reflects the token into the httpOnly cookie. |
| `PUT  /api/profiles/boxer` | Save/replace a boxer profile (`lib/validate.js` schema). |
| `PUT  /api/profiles/fan` | Save/replace a fan profile. |
| `POST/DELETE /api/media` | Avatar upload (≤2MB data URL) / removal on `fighter-media`. |
| `GET/POST/DELETE /api/follows` | Follow/unfollow a fighter (owner-only). |
| `/api/admin/*` | Dashboard data + actions. All require admin. |
| `/api/admin/refdata` | Countries, weight classes, boxer choices for admin forms. |

---

## 6. Fallback behaviour (no fake data)

- Supabase configured + data → rows served from Postgres.
- Supabase configured + empty → explicit **empty state** on the page, never fabricated rows.
- Supabase not configured → existing static editorial content.

---

## 7. Testing

```bash
npm test          # node --test (discovers tests/*.test.js)
```

Unit tests cover validation schemas (`lib/validate.js`) and the rate limiter
(`lib/rate-limit.js`).

Local dev: `npm run dev` starts the custom Express server (`server.js`). Run
`npm run build` after code changes so the served `.next` build is current.