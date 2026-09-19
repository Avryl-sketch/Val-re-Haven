do $$
begin
  create type public.staff_role as enum (
    'OWNER',
    'ADMIN',
    'RECEPTIONIST',
    'CASHIER',
    'ACCOUNTANT',
    'STAFF',
    'GUEST'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.staff_role not null default 'STAFF',
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_profiles_role_idx
  on public.staff_profiles (role)
  where active = true;
