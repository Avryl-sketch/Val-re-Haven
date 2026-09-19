create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  address text,
  identification_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guests_first_name_not_blank check (length(trim(first_name)) > 0),
  constraint guests_last_name_not_blank check (length(trim(last_name)) > 0)
);

create unique index if not exists guests_email_unique
  on public.guests (lower(email))
  where email is not null;
