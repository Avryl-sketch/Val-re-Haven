do $$
begin
  create type public.maintenance_status as enum (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id),
  reason text not null,
  start_date date not null,
  expected_end_date date not null,
  status public.maintenance_status not null default 'SCHEDULED',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint maintenance_reason_not_blank check (length(trim(reason)) > 0),
  constraint maintenance_date_range_valid check (expected_end_date > start_date)
);

create index if not exists maintenance_records_room_dates_idx
  on public.maintenance_records (room_id, start_date, expected_end_date)
  where status in ('SCHEDULED', 'IN_PROGRESS');
