# Vercel + Supabase production setup

This app can run locally with `bookings_db.json`, but Vercel serverless functions do not provide durable local file storage. Production bookings and Paystack webhook idempotency must be stored in Supabase.

## 1. Create Supabase project

1. Go to Supabase and create a project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql` from this repository.

The schema creates:

- `bookings`: paid booking records keyed by Paystack `reference`.
- `paystack_webhook_events`: processed webhook references so duplicate Paystack webhooks are ignored.

## 2. Add Vercel environment variables

Set these in **Vercel Project → Settings → Environment Variables** for Production and Preview as needed:

```bash
APP_URL="https://your-vercel-domain.vercel.app"
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_PAYSTACK_PUBLIC_KEY="pk_live_or_test_..."
PAYSTACK_SECRET_KEY="sk_live_or_test_..."
```

Important:

- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never prefix it with `VITE_` and never expose it in frontend code.
- `VITE_SUPABASE_ANON_KEY` is safe for the browser and is used by the frontend Supabase client.
- `PAYSTACK_SECRET_KEY` must be a secret key that starts with `sk_`, not a public key that starts with `pk_`.

## 3. Local JSON behavior

Local development can still use `bookings_db.json` when Supabase is not configured. In production (`NODE_ENV=production` or `VERCEL=1`), the API now refuses to use local JSON unless you explicitly set `ALLOW_LOCAL_JSON_DB=true` for non-production testing.

Do not enable `ALLOW_LOCAL_JSON_DB=true` for real production payments.
