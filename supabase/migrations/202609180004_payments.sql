do $$
begin
  create type public.payment_method as enum (
    'CREDIT_DEBIT_CARD',
    'GCASH',
    'MAYA',
    'CASH',
    'BANK_TRANSFER'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_record_status as enum (
    'PENDING',
    'SUCCEEDED',
    'FAILED',
    'REFUNDED'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id),
  amount numeric(12, 2) not null,
  currency text not null default 'PHP',
  method public.payment_method not null,
  status public.payment_record_status not null default 'PENDING',
  provider text,
  provider_reference text,
  notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_positive check (amount > 0),
  constraint payments_currency_length check (length(currency) = 3),
  constraint payments_provider_reference_unique unique (provider, provider_reference)
);
