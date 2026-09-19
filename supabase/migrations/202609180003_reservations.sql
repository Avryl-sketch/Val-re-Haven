create extension if not exists btree_gist;

do $$
begin
  create type public.reservation_status as enum (
    'PENDING',
    'CONFIRMED',
    'CHECKED_IN',
    'CHECKED_OUT',
    'CANCELLED',
    'NO_SHOW'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.reservation_booking_type as enum (
    'INDIVIDUAL',
    'GROUP',
    'CORPORATE'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum (
    'UNPAID',
    'PARTIALLY_PAID',
    'PAID',
    'REFUNDED'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id),
  room_type_id uuid not null references public.room_types(id),
  room_id uuid references public.rooms(id),
  booking_type public.reservation_booking_type not null default 'INDIVIDUAL',
  check_in date not null,
  check_out date not null,
  number_of_guests integer not null default 1,
  status public.reservation_status not null default 'PENDING',
  total_amount numeric(12, 2) not null default 0,
  deposit_amount numeric(12, 2) not null default 0,
  balance_amount numeric(12, 2) generated always as (total_amount - deposit_amount) stored,
  payment_status public.payment_status not null default 'UNPAID',
  notes text,
  special_requests text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_date_range_valid check (check_out > check_in),
  constraint reservations_guest_count_positive check (number_of_guests > 0),
  constraint reservations_total_nonnegative check (total_amount >= 0),
  constraint reservations_deposit_valid check (deposit_amount >= 0 and deposit_amount <= total_amount)
);

alter table public.reservations
  drop constraint if exists reservations_active_room_overlap;

alter table public.reservations
  add constraint reservations_active_room_overlap
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (
    room_id is not null
    and status in ('PENDING', 'CONFIRMED', 'CHECKED_IN')
  );
