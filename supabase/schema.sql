-- Falcon production persistence schema for Supabase.
-- Run this once in Supabase SQL Editor before deploying paid booking flows.

create table if not exists public.bookings (
  id text primary key,
  full_name text not null,
  phone text not null,
  email text not null,
  course_id text not null,
  schedule text not null,
  notes text,
  reference text not null unique,
  amount numeric not null default 0,
  status text not null default 'paid',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists bookings_email_idx on public.bookings (email);
create index if not exists bookings_reference_idx on public.bookings (reference);

create table if not exists public.paystack_webhook_events (
  reference text primary key,
  processed_at timestamptz not null default now()
);

alter table public.bookings enable row level security;
alter table public.paystack_webhook_events enable row level security;

-- The Express API uses SUPABASE_SERVICE_ROLE_KEY on the server, which bypasses RLS.
-- Do not expose service-role credentials to the browser. Add read policies later only if
-- you intentionally build direct client-side dashboard reads from Supabase.
