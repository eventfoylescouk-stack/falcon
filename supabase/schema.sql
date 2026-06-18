-- Falcon backend storage schema for Supabase.
-- Run this in the Supabase SQL editor before enabling the backend.

create table if not exists public.bookings (
  id text primary key,
  full_name text not null,
  phone text not null,
  email text,
  course_id text not null,
  course_name text not null,
  amount integer not null,
  schedule text not null,
  notes text,
  payment_reference text not null,
  payment_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id text primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists contacts_created_at_idx on public.contacts (created_at desc);
