do $$
begin
  create type public.invoice_status as enum (
    'OPEN',
    'PARTIALLY_PAID',
    'PAID',
    'VOID'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references public.reservations(id),
  currency text not null default 'PHP',
  subtotal numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  deposit_applied numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) generated always as (subtotal + tax_amount - discount_amount) stored,
  balance_amount numeric(12, 2) generated always as (subtotal + tax_amount - discount_amount - deposit_applied) stored,
  status public.invoice_status not null default 'OPEN',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_subtotal_nonnegative check (subtotal >= 0),
  constraint invoices_tax_nonnegative check (tax_amount >= 0),
  constraint invoices_discount_nonnegative check (discount_amount >= 0),
  constraint invoices_discount_valid check (discount_amount <= subtotal + tax_amount),
  constraint invoices_deposit_nonnegative check (deposit_applied >= 0),
  constraint invoices_deposit_valid check (deposit_applied <= subtotal + tax_amount - discount_amount),
  constraint invoices_currency_length check (length(currency) = 3)
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 2) not null,
  amount numeric(12, 2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now(),
  constraint invoice_items_description_not_blank check (length(trim(description)) > 0),
  constraint invoice_items_quantity_positive check (quantity > 0),
  constraint invoice_items_unit_price_nonnegative check (unit_price >= 0)
);
