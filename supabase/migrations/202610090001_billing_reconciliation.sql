alter table public.invoices
  add column if not exists amount_paid numeric(12, 2) not null default 0,
  add column if not exists finalized_at timestamptz,
  add column if not exists billing_model_version smallint not null default 1,
  add column if not exists vat_rate numeric(5, 4) not null default 0.1200;

alter table public.invoices
  add column if not exists outstanding_balance numeric(12, 2)
    generated always as (greatest(subtotal + tax_amount - discount_amount - deposit_applied - amount_paid, 0)) stored;

alter table public.payments
  add column if not exists invoice_id uuid references public.invoices(id),
  add column if not exists idempotency_key uuid,
  add column if not exists provider_confirmed_at timestamptz;

alter table public.invoice_items
  add column if not exists idempotency_key uuid;

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;

revoke all on public.invoices, public.invoice_items, public.payments from anon, authenticated;
grant all on public.invoices, public.invoice_items, public.payments to service_role;

create unique index if not exists payments_idempotency_key_unique
  on public.payments (idempotency_key) where idempotency_key is not null;

create unique index if not exists invoice_items_idempotency_key_unique
  on public.invoice_items (invoice_id, idempotency_key) where idempotency_key is not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'invoices_amount_paid_nonnegative') then
    alter table public.invoices add constraint invoices_amount_paid_nonnegative check (amount_paid >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'invoices_billing_model_version_valid') then
    alter table public.invoices add constraint invoices_billing_model_version_valid check (billing_model_version in (1, 2));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'invoices_vat_rate_valid') then
    alter table public.invoices add constraint invoices_vat_rate_valid check (vat_rate >= 0 and vat_rate <= 1);
  end if;
end;
$$;

create or replace function public.guard_invoice_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if old.finalized_at is not null and (
      new.subtotal is distinct from old.subtotal
      or new.tax_amount is distinct from old.tax_amount
      or new.discount_amount is distinct from old.discount_amount
      or new.deposit_applied is distinct from old.deposit_applied
    ) then
      raise exception 'Finalized folio amounts cannot be changed';
    end if;

    if old.finalized_at is not null and new.finalized_at is null then
      raise exception 'A finalized folio cannot be reopened';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists invoices_guard_mutation on public.invoices;
create trigger invoices_guard_mutation
before update on public.invoices
for each row execute function public.guard_invoice_mutation();

create or replace function public.guard_invoice_item_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_invoice_id uuid;
  invoice_row public.invoices;
begin
  target_invoice_id := case when tg_op = 'DELETE' then old.invoice_id else new.invoice_id end;

  select * into invoice_row
  from public.invoices
  where id = target_invoice_id
  for update;

  if not found then
    raise exception 'Invoice not found';
  end if;

  if invoice_row.billing_model_version <> 2
    or invoice_row.finalized_at is not null
    or invoice_row.status = 'VOID' then
    raise exception 'Charges cannot be changed on a finalized or void folio';
  end if;

  if tg_op = 'UPDATE' and old.invoice_id is distinct from new.invoice_id then
    raise exception 'Invoice items cannot be moved between folios';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists invoice_items_guard_mutation on public.invoice_items;
create trigger invoice_items_guard_mutation
before insert or update or delete on public.invoice_items
for each row execute function public.guard_invoice_item_mutation();

create or replace function public.recalculate_invoice_items()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_invoice_id uuid;
  recalculated_subtotal numeric(12, 2);
begin
  for target_invoice_id in
    select distinct item_invoice_id
    from unnest(array[
      case when tg_op in ('UPDATE', 'DELETE') then old.invoice_id end,
      case when tg_op in ('INSERT', 'UPDATE') then new.invoice_id end
    ]) as changed(item_invoice_id)
    where item_invoice_id is not null
  loop
    select coalesce(sum(ii.amount), 0) into recalculated_subtotal
    from public.invoice_items ii
    where ii.invoice_id = target_invoice_id;

    update public.invoices i
    set subtotal = recalculated_subtotal,
        tax_amount = round(greatest(recalculated_subtotal - i.discount_amount, 0) * i.vat_rate, 2),
        status = case
          when i.status = 'VOID' then i.status
          when recalculated_subtotal + round(greatest(recalculated_subtotal - i.discount_amount, 0) * i.vat_rate, 2) - i.discount_amount > 0
            and i.amount_paid >= recalculated_subtotal + round(greatest(recalculated_subtotal - i.discount_amount, 0) * i.vat_rate, 2) - i.discount_amount
            then 'PAID'::public.invoice_status
          when i.amount_paid > 0
            then 'PARTIALLY_PAID'::public.invoice_status
          else 'OPEN'::public.invoice_status
        end,
        updated_at = now()
    where i.id = target_invoice_id
      and i.billing_model_version = 2
      and i.finalized_at is null;
  end loop;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists invoice_items_recalculate_total on public.invoice_items;
create trigger invoice_items_recalculate_total
after insert or update or delete on public.invoice_items
for each row execute function public.recalculate_invoice_items();

create or replace function public.guard_payment_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  matching_invoice_id uuid;
  matching_currency text;
  matching_billing_model_version smallint;
  reservation_total numeric(12, 2);
begin
  select total_amount into reservation_total
  from public.reservations
  where id = new.reservation_id
  for update;

  if not found then
    raise exception 'Reservation not found';
  end if;

  if tg_op = 'UPDATE' and (
    new.reservation_id is distinct from old.reservation_id
    or new.amount is distinct from old.amount
    or new.currency is distinct from old.currency
    or new.method is distinct from old.method
    or new.idempotency_key is distinct from old.idempotency_key
    or (old.invoice_id is not null and new.invoice_id is distinct from old.invoice_id)
  ) then
    raise exception 'Payment identity and amount fields are immutable';
  end if;

  if tg_op = 'UPDATE' and old.invoice_id is not null and old.invoice_id is distinct from new.invoice_id then
    raise exception 'A payment already applied to a folio cannot be reassigned';
  end if;

  if new.status = 'SUCCEEDED'
    and (tg_op = 'INSERT' or old.status is distinct from new.status or old.invoice_id is distinct from new.invoice_id)
    and new.method not in ('CASH', 'BANK_TRANSFER')
    and new.provider_confirmed_at is null then
    raise exception 'External payment requires trusted provider confirmation';
  end if;

  if tg_op = 'INSERT' and new.invoice_id is null then
    select id, currency, billing_model_version
    into matching_invoice_id, matching_currency, matching_billing_model_version
    from public.invoices
    where reservation_id = new.reservation_id
      and billing_model_version = 2
      and status <> 'VOID'
    for update;

    if matching_invoice_id is not null then
      new.invoice_id := matching_invoice_id;
    end if;
  end if;

  if new.invoice_id is not null then
    select reservation_id, currency, billing_model_version
    into matching_invoice_id, matching_currency, matching_billing_model_version
    from public.invoices
    where id = new.invoice_id
    for update;

    if not found or matching_invoice_id <> new.reservation_id then
      raise exception 'Payment invoice must belong to its reservation';
    end if;
    if matching_billing_model_version <> 2 then
      raise exception 'Historical folios cannot receive automatically reconciled payments';
    end if;

    if matching_currency <> new.currency then
      raise exception 'Payment currency must match its folio currency';
    end if;

    if new.status = 'SUCCEEDED'
      and (tg_op = 'INSERT' or old.status is distinct from new.status or old.invoice_id is distinct from new.invoice_id) then
      if (select coalesce(sum(amount), 0) from public.payments
          where invoice_id = new.invoice_id
            and status = 'SUCCEEDED'
            and id is distinct from new.id) + new.amount
          > (select total_amount - deposit_applied from public.invoices where id = new.invoice_id) then
        raise exception 'Payment exceeds the remaining folio balance';
      end if;
    end if;
  elsif new.status = 'SUCCEEDED'
    and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    if (select coalesce(sum(amount), 0) from public.payments
        where reservation_id = new.reservation_id
          and currency = 'PHP'
          and status = 'SUCCEEDED'
          and id is distinct from new.id) + new.amount > reservation_total then
      raise exception 'Payment exceeds the remaining reservation balance';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists payments_guard_mutation on public.payments;
create trigger payments_guard_mutation
before insert or update on public.payments
for each row execute function public.guard_payment_mutation();

create or replace function public.reconcile_payment_change()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  affected_invoice_id uuid;
  affected_reservation_id uuid;
  retained_total numeric(12, 2);
  invoice_row public.invoices;
  authoritative_balance numeric(12, 2);
  authoritative_paid numeric(12, 2);
  authoritative_invoice_id uuid;
  authoritative_refund boolean;
  reservation_row public.reservations;
  has_refund boolean;
begin
  for affected_invoice_id in
    select distinct payment_invoice_id
    from unnest(array[
      case when tg_op in ('UPDATE', 'DELETE') then old.invoice_id end,
      case when tg_op in ('INSERT', 'UPDATE') then new.invoice_id end
    ]) as changed(payment_invoice_id)
    where payment_invoice_id is not null
  loop
    select * into invoice_row
    from public.invoices
    where id = affected_invoice_id
    for update;

    if found then
      select coalesce(sum(amount), 0) into retained_total
      from public.payments
      where invoice_id = affected_invoice_id
        and status = 'SUCCEEDED';

      update public.invoices
      set amount_paid = retained_total,
          status = case
            when status = 'VOID' then status
            when total_amount > 0 and retained_total + deposit_applied >= total_amount then 'PAID'::public.invoice_status
            when retained_total + deposit_applied > 0 then 'PARTIALLY_PAID'::public.invoice_status
            else 'OPEN'::public.invoice_status
          end,
          updated_at = now()
      where id = affected_invoice_id;
    end if;
  end loop;

  for affected_reservation_id in
    select distinct payment_reservation_id
    from unnest(array[
      case when tg_op in ('UPDATE', 'DELETE') then old.reservation_id end,
      case when tg_op in ('INSERT', 'UPDATE') then new.reservation_id end
    ]) as changed(payment_reservation_id)
    where payment_reservation_id is not null
  loop
    select * into reservation_row
    from public.reservations
    where id = affected_reservation_id
    for update;

        if found then
          select coalesce(sum(amount) filter (where status = 'SUCCEEDED'), 0),
            coalesce(bool_or(status = 'REFUNDED'), false)
            into retained_total, has_refund
      from public.payments
      where reservation_id = affected_reservation_id
        and currency = 'PHP'
        and status in ('SUCCEEDED', 'REFUNDED');

      select outstanding_balance, amount_paid, id
      into authoritative_balance, authoritative_paid, authoritative_invoice_id
      from public.invoices
      where reservation_id = affected_reservation_id
        and billing_model_version >= 2;

      if authoritative_invoice_id is not null then
        select coalesce(bool_or(status = 'REFUNDED'), false)
        into authoritative_refund
        from public.payments
        where invoice_id = authoritative_invoice_id;
      else
        authoritative_refund := false;
      end if;

      update public.reservations
      set payment_status = case
        when authoritative_balance is not null and authoritative_balance = 0 and authoritative_paid > 0 then 'PAID'::public.payment_status
        when authoritative_balance is not null and authoritative_paid > 0 then 'PARTIALLY_PAID'::public.payment_status
        when authoritative_balance is not null and authoritative_refund then 'REFUNDED'::public.payment_status
        when authoritative_balance is not null then 'UNPAID'::public.payment_status
        when retained_total >= reservation_row.total_amount and retained_total > 0 then 'PAID'::public.payment_status
        when retained_total > 0 then 'PARTIALLY_PAID'::public.payment_status
        when has_refund then 'REFUNDED'::public.payment_status
        else 'UNPAID'::public.payment_status
      end,
      updated_at = now()
      where id = affected_reservation_id;
    end if;
  end loop;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists payments_reconcile_after_change on public.payments;
create trigger payments_reconcile_after_change
after insert or update or delete on public.payments
for each row execute function public.reconcile_payment_change();

create or replace function public.billing_create_invoice(
  p_reservation_id uuid,
  p_currency text,
  p_tax_amount numeric,
  p_discount_amount numeric,
  p_deposit_applied numeric,
  p_notes text,
  p_actor_id uuid
)
returns public.invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  invoice_row public.invoices;
  inserted_id uuid;
begin
  perform 1 from public.reservations where id = p_reservation_id;
  if not found then
    raise exception 'Reservation not found';
  end if;
  if coalesce(p_deposit_applied, 0) <> 0 then
    raise exception 'New folios apply credits through reconciled payments';
  end if;
  if coalesce(p_tax_amount, 0) <> 0 then
    raise exception 'VAT is calculated from the configured folio rate';
  end if;
  if coalesce(p_discount_amount, 0) <> 0 then
    raise exception 'Set discounts after folio charges are posted';
  end if;

  select * into invoice_row
  from public.invoices
  where reservation_id = p_reservation_id
  for update;

  if found then
    return invoice_row;
  end if;

  insert into public.invoices (
    reservation_id, currency, tax_amount, discount_amount, deposit_applied, notes,
    vat_rate, billing_model_version
  ) values (
    p_reservation_id, coalesce(p_currency, 'PHP'), 0,
    coalesce(p_discount_amount, 0), 0, p_notes, 0.12, 2
  ) on conflict (reservation_id) do nothing
  returning id into inserted_id;

  if inserted_id is null then
    select * into invoice_row
    from public.invoices
    where reservation_id = p_reservation_id
    for update;
    return invoice_row;
  end if;

  insert into public.audit_logs (user_id, action, entity_type, entity_id, details)
  values (p_actor_id, 'CREATE_FOLIO', 'invoice', inserted_id,
    jsonb_build_object('reservationId', p_reservation_id));

  select * into invoice_row from public.invoices where id = inserted_id;
  return invoice_row;
end;
$$;

create or replace function public.billing_add_invoice_item(
  p_invoice_id uuid,
  p_description text,
  p_quantity numeric,
  p_unit_price numeric,
  p_idempotency_key uuid,
  p_actor_id uuid
)
returns public.invoice_items
language plpgsql
security definer
set search_path = public
as $$
declare
  item_row public.invoice_items;
  invoice_row public.invoices;
  inserted_id uuid;
begin
  if p_idempotency_key is null then
    raise exception 'Idempotency key is required';
  end if;

  select * into invoice_row from public.invoices where id = p_invoice_id for update;
  if not found then
    raise exception 'Invoice not found';
  end if;
  if invoice_row.billing_model_version <> 2
    or invoice_row.finalized_at is not null
    or invoice_row.status = 'VOID' then
    raise exception 'Charges cannot be added to a finalized or void folio';
  end if;

  select * into item_row
  from public.invoice_items
  where invoice_id = p_invoice_id and idempotency_key = p_idempotency_key;
  if found then
    if item_row.description <> p_description
      or item_row.quantity <> p_quantity
      or item_row.unit_price <> p_unit_price then
      raise exception 'Idempotency key was already used for a different folio charge';
    end if;
    return item_row;
  end if;

  insert into public.invoice_items (
    invoice_id, description, quantity, unit_price, idempotency_key
  ) values (
    p_invoice_id, p_description, p_quantity, p_unit_price, p_idempotency_key
  ) ON CONFLICT (invoice_id, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
  returning id into inserted_id;

  if inserted_id is null then
    select * into item_row from public.invoice_items
    where invoice_id = p_invoice_id and idempotency_key = p_idempotency_key;
    if item_row.description <> p_description
      or item_row.quantity <> p_quantity
      or item_row.unit_price <> p_unit_price then
      raise exception 'Idempotency key was already used for a different folio charge';
    end if;
    return item_row;
  end if;

  insert into public.audit_logs (user_id, action, entity_type, entity_id, details)
  values (p_actor_id, 'ADD_FOLIO_CHARGE', 'invoice', p_invoice_id,
    jsonb_build_object('itemId', inserted_id, 'quantity', p_quantity, 'unitPrice', p_unit_price));

  select * into item_row from public.invoice_items where id = inserted_id;
  return item_row;
end;
$$;

create or replace function public.billing_update_invoice_discount(
  p_invoice_id uuid,
  p_discount_amount numeric,
  p_actor_id uuid
)
returns public.invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  invoice_row public.invoices;
begin
  select * into invoice_row from public.invoices where id = p_invoice_id for update;
  if not found then raise exception 'Invoice not found'; end if;
  if invoice_row.billing_model_version <> 2
    or invoice_row.finalized_at is not null
    or invoice_row.status = 'VOID' then
    raise exception 'Only draft current folios can be discounted';
  end if;
  if p_discount_amount < 0 or p_discount_amount > invoice_row.subtotal then
    raise exception 'Discount must be between zero and folio subtotal';
  end if;

  update public.invoices
  set discount_amount = p_discount_amount,
      tax_amount = round(greatest(subtotal - p_discount_amount, 0) * vat_rate, 2),
      status = case
        when amount_paid >= subtotal + round(greatest(subtotal - p_discount_amount, 0) * vat_rate, 2) - p_discount_amount
          and subtotal + round(greatest(subtotal - p_discount_amount, 0) * vat_rate, 2) - p_discount_amount > 0
          then 'PAID'::public.invoice_status
        when amount_paid > 0 then 'PARTIALLY_PAID'::public.invoice_status
        else 'OPEN'::public.invoice_status
      end,
      updated_at = now()
  where id = p_invoice_id
  returning * into invoice_row;

  insert into public.audit_logs (user_id, action, entity_type, entity_id, details)
  values (p_actor_id, 'UPDATE_FOLIO_DISCOUNT', 'invoice', p_invoice_id,
    jsonb_build_object('discountAmount', p_discount_amount));

  return invoice_row;
end;
$$;

create or replace function public.billing_apply_payment_to_invoice(
  p_payment_id uuid,
  p_invoice_id uuid,
  p_actor_id uuid
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_row public.payments;
  invoice_row public.invoices;
  reservation_id_value uuid;
begin
  select reservation_id into reservation_id_value
  from public.payments where id = p_payment_id;
  if not found then raise exception 'Payment not found'; end if;

  perform 1 from public.reservations where id = reservation_id_value for update;
  select * into invoice_row from public.invoices where id = p_invoice_id for update;
  if not found then raise exception 'Invoice not found'; end if;
  if invoice_row.billing_model_version <> 2 then
    raise exception 'Historical folios require manual reconciliation';
  end if;
  if invoice_row.finalized_at is not null or invoice_row.status = 'VOID' then
    raise exception 'Payments cannot be applied to finalized or void folios';
  end if;
  if invoice_row.reservation_id <> reservation_id_value then
    raise exception 'Payment and folio must belong to the same reservation';
  end if;

  select * into payment_row from public.payments where id = p_payment_id for update;
  if payment_row.invoice_id = p_invoice_id then return payment_row; end if;
  if payment_row.invoice_id is not null then
    raise exception 'Payment is already applied to another folio';
  end if;

  update public.payments set invoice_id = p_invoice_id where id = p_payment_id
  returning * into payment_row;

  insert into public.audit_logs (user_id, action, entity_type, entity_id, details)
  values (p_actor_id, 'APPLY_PAYMENT_TO_FOLIO', 'payment', p_payment_id,
    jsonb_build_object('invoiceId', p_invoice_id, 'reservationId', reservation_id_value));

  return payment_row;
end;
$$;

create or replace function public.billing_finalize_invoice(
  p_invoice_id uuid,
  p_actor_id uuid
)
returns public.invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  invoice_row public.invoices;
  current_subtotal numeric(12, 2);
  current_total numeric(12, 2);
begin
  select * into invoice_row from public.invoices where id = p_invoice_id for update;
  if not found then raise exception 'Invoice not found'; end if;
  if invoice_row.billing_model_version <> 2 then
    raise exception 'Historical folios cannot be finalized by the new billing workflow';
  end if;
  if invoice_row.status = 'VOID' then raise exception 'Void folio cannot be finalized'; end if;
  if invoice_row.finalized_at is not null then return invoice_row; end if;

  select coalesce(sum(amount), 0) into current_subtotal
  from public.invoice_items
  where invoice_id = p_invoice_id;
  current_total := current_subtotal
    + round(greatest(current_subtotal - invoice_row.discount_amount, 0) * invoice_row.vat_rate, 2)
    - invoice_row.discount_amount;

  update public.invoices
  set subtotal = current_subtotal,
      tax_amount = round(greatest(current_subtotal - discount_amount, 0) * vat_rate, 2),
      finalized_at = now(),
      status = case
        when current_total > 0 and amount_paid >= current_total then 'PAID'::public.invoice_status
        when amount_paid > 0 then 'PARTIALLY_PAID'::public.invoice_status
        else 'OPEN'::public.invoice_status
      end,
      updated_at = now()
  where id = p_invoice_id
  returning * into invoice_row;

  insert into public.audit_logs (user_id, action, entity_type, entity_id, details)
  values (p_actor_id, 'FINALIZE_FOLIO', 'invoice', p_invoice_id,
    jsonb_build_object('totalAmount', invoice_row.total_amount, 'balanceAmount', invoice_row.outstanding_balance));

  return invoice_row;
end;
$$;

drop function if exists public.billing_record_payment(uuid, numeric, text, public.payment_method, public.payment_record_status, text, text, text, uuid, uuid);

create or replace function public.billing_record_payment(
  p_reservation_id uuid,
  p_invoice_id uuid,
  p_amount numeric,
  p_currency text,
  p_method public.payment_method,
  p_status public.payment_record_status,
  p_provider text,
  p_provider_reference text,
  p_notes text,
  p_idempotency_key uuid,
  p_actor_id uuid
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_row public.payments;
  inserted_id uuid;
begin
  if p_idempotency_key is null then raise exception 'Idempotency key is required'; end if;
  if p_status = 'SUCCEEDED' and p_method not in ('CASH', 'BANK_TRANSFER') then
    raise exception 'External payment must be confirmed by a trusted provider';
  end if;

  insert into public.payments (
    reservation_id, invoice_id, amount, currency, method, status, provider,
    provider_reference, notes, idempotency_key,
    paid_at
  ) values (
    p_reservation_id, p_invoice_id, p_amount, coalesce(p_currency, 'PHP'), p_method,
    coalesce(p_status, 'PENDING'), p_provider, p_provider_reference,
    p_notes, p_idempotency_key,
    case when p_status = 'SUCCEEDED' then now() else null end
  ) ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
  returning id into inserted_id;

  if inserted_id is null then
    select * into payment_row from public.payments
    where idempotency_key = p_idempotency_key;
    if payment_row.reservation_id <> p_reservation_id
      or payment_row.invoice_id is distinct from p_invoice_id
      or payment_row.amount <> p_amount
      or payment_row.method <> p_method
      or payment_row.currency <> coalesce(p_currency, 'PHP') then
      raise exception 'Idempotency key was already used for a different payment';
    end if;
    return payment_row;
  end if;

  insert into public.audit_logs (user_id, action, entity_type, entity_id, details)
  values (p_actor_id, 'RECORD_PAYMENT', 'payment', inserted_id,
    jsonb_build_object('reservationId', p_reservation_id, 'amount', p_amount, 'currency', coalesce(p_currency, 'PHP'), 'method', p_method, 'status', coalesce(p_status, 'PENDING')));

  select * into payment_row from public.payments where id = inserted_id;
  return payment_row;
end;
$$;

create or replace function public.billing_update_payment(
  p_payment_id uuid,
  p_status public.payment_record_status,
  p_currency text,
  p_provider text,
  p_provider_reference text,
  p_notes text,
  p_actor_id uuid
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_row public.payments;
  old_status public.payment_record_status;
begin
  select * into payment_row from public.payments where id = p_payment_id for update;
  if not found then raise exception 'Payment not found'; end if;
  old_status := payment_row.status;

  update public.payments
  set status = coalesce(p_status, status),
      currency = coalesce(p_currency, currency),
      provider = coalesce(p_provider, provider),
      provider_reference = coalesce(p_provider_reference, provider_reference),
      notes = coalesce(p_notes, notes),
      paid_at = case
        when coalesce(p_status, status) = 'SUCCEEDED' then coalesce(paid_at, now())
        when coalesce(p_status, status) in ('PENDING', 'FAILED') then null
        else paid_at
      end,
      updated_at = now()
  where id = p_payment_id
  returning * into payment_row;

  if old_status is distinct from payment_row.status then
    insert into public.audit_logs (user_id, action, entity_type, entity_id, details)
    values (p_actor_id, 'CHANGE_PAYMENT_STATUS', 'payment', p_payment_id,
      jsonb_build_object('from', old_status, 'to', payment_row.status, 'reservationId', payment_row.reservation_id));
  end if;

  return payment_row;
end;
$$;

create or replace function public.check_out_reservation(
  p_reservation_id uuid,
  p_actor_id uuid default null
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_row public.reservations;
  invoice_row public.invoices;
  successful_payments numeric(12, 2);
  folio_balance numeric(12, 2);
begin
  select * into reservation_row
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then raise exception 'Reservation not found'; end if;
  if reservation_row.status <> 'CHECKED_IN' then
    raise exception 'Only CHECKED_IN reservations can be checked out';
  end if;

  select * into invoice_row
  from public.invoices
  where reservation_id = p_reservation_id
  for update;

  if found and invoice_row.billing_model_version >= 2 then
    if invoice_row.status = 'VOID' then
      raise exception 'A void folio cannot be used to check out';
    end if;

    if reservation_row.total_amount > 0 and not exists (
      select 1 from public.invoice_items where invoice_id = invoice_row.id
    ) then
      raise exception 'Post the reservation room charge before check-out';
    end if;

    select coalesce(sum(amount), 0) into successful_payments
    from public.payments
    where invoice_id = invoice_row.id and status = 'SUCCEEDED';

    update public.invoices
    set amount_paid = successful_payments,
        subtotal = case when finalized_at is null then coalesce((
          select sum(amount) from public.invoice_items where invoice_id = invoice_row.id
        ), 0) else subtotal end,
        updated_at = now()
    where id = invoice_row.id
    returning * into invoice_row;

    folio_balance := invoice_row.outstanding_balance;
    if folio_balance > 0 then
      raise exception 'Folio outstanding balance must be paid before check-out';
    end if;

    if invoice_row.finalized_at is null then
      update public.invoices
      set finalized_at = now(),
          status = case
            when total_amount > 0 then 'PAID'::public.invoice_status
            else 'OPEN'::public.invoice_status
          end,
          updated_at = now()
      where id = invoice_row.id;

      insert into public.audit_logs (user_id, action, entity_type, entity_id, details)
      values (p_actor_id, 'FINALIZE_FOLIO', 'invoice', invoice_row.id,
        jsonb_build_object('totalAmount', invoice_row.total_amount, 'balanceAmount', 0, 'reason', 'checkout'));
    end if;
  else
    select coalesce(sum(amount), 0) into successful_payments
    from public.payments
    where reservation_id = p_reservation_id
      and currency = 'PHP'
      and status = 'SUCCEEDED';

    if successful_payments < reservation_row.total_amount then
      raise exception 'Outstanding reservation balance must be paid before check-out';
    end if;
  end if;

  if reservation_row.room_id is not null then
    update public.rooms set status = 'DIRTY', updated_at = now()
    where id = reservation_row.room_id;
  end if;

  update public.reservations
  set status = 'CHECKED_OUT', updated_at = now()
  where id = p_reservation_id
  returning * into reservation_row;

  insert into public.audit_logs (user_id, action, entity_type, entity_id, details)
  values (p_actor_id, 'CHECK_OUT_RESERVATION', 'reservation', p_reservation_id,
    jsonb_build_object('roomId', reservation_row.room_id, 'invoiceId', invoice_row.id));

  return reservation_row;
end;
$$;

create or replace function public.check_out_reservation(p_reservation_id uuid)
returns public.reservations
language sql
security definer
set search_path = public
as $$
  select public.check_out_reservation(p_reservation_id, null);
$$;

revoke all on function public.billing_create_invoice(uuid, text, numeric, numeric, numeric, text, uuid) from public, anon, authenticated;
revoke all on function public.billing_add_invoice_item(uuid, text, numeric, numeric, uuid, uuid) from public, anon, authenticated;
revoke all on function public.billing_finalize_invoice(uuid, uuid) from public, anon, authenticated;
revoke all on function public.billing_record_payment(uuid, uuid, numeric, text, public.payment_method, public.payment_record_status, text, text, text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.billing_update_payment(uuid, public.payment_record_status, text, text, text, text, uuid) from public, anon, authenticated;
revoke all on function public.billing_update_invoice_discount(uuid, numeric, uuid) from public, anon, authenticated;
revoke all on function public.billing_apply_payment_to_invoice(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.check_out_reservation(uuid) from public, anon, authenticated;
revoke all on function public.check_out_reservation(uuid, uuid) from public, anon, authenticated;

grant execute on function public.billing_create_invoice(uuid, text, numeric, numeric, numeric, text, uuid) to service_role;
grant execute on function public.billing_add_invoice_item(uuid, text, numeric, numeric, uuid, uuid) to service_role;
grant execute on function public.billing_finalize_invoice(uuid, uuid) to service_role;
grant execute on function public.billing_record_payment(uuid, uuid, numeric, text, public.payment_method, public.payment_record_status, text, text, text, uuid, uuid) to service_role;
grant execute on function public.billing_update_payment(uuid, public.payment_record_status, text, text, text, text, uuid) to service_role;
grant execute on function public.billing_update_invoice_discount(uuid, numeric, uuid) to service_role;
grant execute on function public.billing_apply_payment_to_invoice(uuid, uuid, uuid) to service_role;
grant execute on function public.check_out_reservation(uuid) to service_role;
grant execute on function public.check_out_reservation(uuid, uuid) to service_role;
