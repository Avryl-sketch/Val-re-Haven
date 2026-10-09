begin;

do $$
<<test_context>>
declare
  room_type_id uuid;
  guest_id uuid;
  room_id uuid;
  reservation_id uuid;
  external_payment_id uuid;
  invoice_row public.invoices;
  payment_row public.payments;
  first_payment_id uuid;
  room_status public.room_status;
  reservation_status public.reservation_status;
  event_count integer;
  caught_message text;
  first_payment_key uuid;
begin
  select id into room_type_id from public.room_types order by name limit 1;
  if room_type_id is null then
    raise exception 'Test requires at least one configured room type';
  end if;

  insert into public.guests (first_name, last_name, email)
  values ('Billing', 'Integration Test', 'folio-' || gen_random_uuid()::text || '@example.test')
  returning id into guest_id;

  insert into public.rooms (room_number, room_type_id, floor, status)
  values ('T' || substr(gen_random_uuid()::text, 1, 7), room_type_id, 99, 'OCCUPIED')
  returning id into room_id;

  insert into public.reservations (
    guest_id, room_type_id, room_id, check_in, check_out,
    number_of_guests, status, total_amount
  ) values (
    guest_id, room_type_id, room_id, current_date - 1, current_date,
    1, 'CHECKED_IN', 1000
  ) returning id into reservation_id;

  invoice_row := public.billing_create_invoice(
    reservation_id, 'PHP', 0, 0, 0, 'Integration test folio', null
  );

  perform public.billing_add_invoice_item(
    invoice_row.id, 'Room accommodation', 2, 400,
    gen_random_uuid(), null
  );

  if (select subtotal from public.invoices where id = invoice_row.id) <> 800 then
    raise exception 'Invoice subtotal did not recalculate from its first item';
  end if;

  perform public.billing_add_invoice_item(
    invoice_row.id, 'Additional charge', 1, 100,
    gen_random_uuid(), null
  );
  perform public.billing_add_invoice_item(
    invoice_row.id, 'Additional charge', 1, 100,
    (select idempotency_key from public.invoice_items where invoice_id = invoice_row.id and description = 'Additional charge'),
    null
  );

  select * into invoice_row from public.invoices where id = invoice_row.id;
  perform public.billing_update_invoice_discount(invoice_row.id, 20, null);
  select * into invoice_row from public.invoices where id = invoice_row.id;
  if invoice_row.subtotal <> 900 or invoice_row.tax_amount <> 105.60
    or invoice_row.total_amount <> 985.60 or invoice_row.outstanding_balance <> 985.60 then
    raise exception 'Invoice subtotal, tax, discount, or balance calculation is incorrect';
  end if;
  if (select count(*) from public.invoice_items where invoice_id = invoice_row.id) <> 2 then
    raise exception 'Repeated charge request created a duplicate invoice item';
  end if;

  perform public.billing_record_payment(
    reservation_id, invoice_row.id, 150, 'PHP', 'CASH', 'PENDING', null, null,
    'Pending test', gen_random_uuid(), null
  );
  perform public.billing_record_payment(
    reservation_id, invoice_row.id, 200, 'PHP', 'BANK_TRANSFER', 'FAILED', null, null,
    'Failed test', gen_random_uuid(), null
  );

  if (select amount_paid from public.invoices where id = invoice_row.id) <> 0 then
    raise exception 'Pending or failed payments incorrectly reduced the folio balance';
  end if;

  begin
    perform public.billing_record_payment(
      reservation_id, invoice_row.id, 10, 'PHP', 'GCASH', 'SUCCEEDED', 'untrusted', null,
      'Must be rejected', gen_random_uuid(), null
    );
    raise exception 'TEST_FAILURE: external payment success was accepted';
  exception when others then
    get stacked diagnostics caught_message = message_text;
    if caught_message like 'TEST_FAILURE:%'
      or position('External payment' in caught_message) = 0 then
      raise;
    end if;
  end;

  payment_row := public.billing_record_payment(
    reservation_id, invoice_row.id, 10, 'PHP', 'MAYA', 'PENDING', 'untrusted', null,
    'Pending external payment', gen_random_uuid(), null
  );
  external_payment_id := payment_row.id;
  begin
    perform public.billing_update_payment(
      external_payment_id, 'SUCCEEDED', null, null, null, null, null
    );
    raise exception 'TEST_FAILURE: generic payment update forged external success';
  exception when others then
    get stacked diagnostics caught_message = message_text;
    if caught_message like 'TEST_FAILURE:%'
      or position('External payment' in caught_message) = 0 then
      raise;
    end if;
  end;

  first_payment_key := gen_random_uuid();
  payment_row := public.billing_record_payment(
    reservation_id, invoice_row.id, 400, 'PHP', 'CASH', 'SUCCEEDED', null, null,
    'First settlement', first_payment_key, null
  );
  first_payment_id := payment_row.id;

  payment_row := public.billing_record_payment(
    reservation_id, invoice_row.id, 400, 'PHP', 'CASH', 'SUCCEEDED', null, null,
    'First settlement', first_payment_key, null
  );
  if payment_row.id <> first_payment_id then
    raise exception 'Payment retry did not resolve to the original payment record';
  end if;

  payment_row := public.billing_record_payment(
    reservation_id, invoice_row.id, 300, 'PHP', 'BANK_TRANSFER', 'SUCCEEDED', null, null,
    'Second settlement', gen_random_uuid(), null
  );

  if (select amount_paid from public.invoices where id = invoice_row.id) <> 700
    or (select outstanding_balance from public.invoices where id = invoice_row.id) <> 285.60
    or (select payment_status from public.reservations where id = reservation_id) <> 'PARTIALLY_PAID' then
    raise exception 'Multiple successful payments did not reconcile correctly';
  end if;

  begin
    perform public.check_out_reservation(reservation_id, null);
    raise exception 'TEST_FAILURE: unpaid checkout was allowed';
  exception when others then
    get stacked diagnostics caught_message = message_text;
    if caught_message like 'TEST_FAILURE:%'
      or position('outstanding balance' in lower(caught_message)) = 0 then
      raise;
    end if;
  end;

  perform public.billing_update_payment(
    payment_row.id, 'REFUNDED', null, null, null, 'Refund test', null
  );

  if (select amount_paid from public.invoices where id = invoice_row.id) <> 400
    or (select outstanding_balance from public.invoices where id = invoice_row.id) <> 585.60
    or (select payment_status from public.reservations where id = reservation_id) <> 'PARTIALLY_PAID' then
    raise exception 'Refund did not restore the outstanding balance';
  end if;

  payment_row := public.billing_record_payment(
    reservation_id, invoice_row.id, 585.60, 'PHP', 'CASH', 'SUCCEEDED', null, null,
    'Final settlement', gen_random_uuid(), null
  );

  if (select amount_paid from public.invoices where id = invoice_row.id) <> 985.60
    or (select outstanding_balance from public.invoices where id = invoice_row.id) <> 0
    or (select status from public.invoices where id = invoice_row.id) <> 'PAID'
    or (select payment_status from public.reservations where id = reservation_id) <> 'PAID' then
    raise exception 'Fully settled folio or reservation status is incorrect';
  end if;

  perform public.check_out_reservation(reservation_id, null);
  select status into reservation_status from public.reservations where id = reservation_id;
  select status into room_status from public.rooms where id = room_id;
  if reservation_status <> 'CHECKED_OUT' or room_status <> 'DIRTY' then
    raise exception 'Checkout did not update reservation and room state';
  end if;

  select count(*) into event_count from public.audit_logs
  where (entity_type = 'invoice' and entity_id = invoice_row.id
      and action in ('CREATE_FOLIO', 'ADD_FOLIO_CHARGE'))
     or (entity_type = 'payment' and entity_id in (
       select p.id from public.payments p where p.reservation_id = test_context.reservation_id
     ) and action in ('RECORD_PAYMENT', 'CHANGE_PAYMENT_STATUS'))
     or (entity_type = 'reservation' and entity_id = test_context.reservation_id
      and action = 'CHECK_OUT_RESERVATION');
  if event_count < 7 then
    raise exception 'Expected invoice, payment, reversal, and checkout audit events';
  end if;

  if has_function_privilege('anon', 'public.billing_create_invoice(uuid,text,numeric,numeric,numeric,text,uuid)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.billing_create_invoice(uuid,text,numeric,numeric,numeric,text,uuid)', 'EXECUTE') then
    raise exception 'Unauthenticated roles can execute the internal invoice function';
  end if;
end;
$$;

rollback;
