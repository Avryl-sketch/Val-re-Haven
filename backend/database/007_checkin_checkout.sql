create or replace function public.check_in_reservation(
  p_reservation_id uuid,
  p_room_id uuid default null
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_row public.reservations;
  selected_room_id uuid;
  selected_room_status public.room_status;
begin
  select * into reservation_row
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'Reservation not found';
  end if;

  if reservation_row.status <> 'CONFIRMED' then
    raise exception 'Only CONFIRMED reservations can be checked in';
  end if;

  selected_room_id := reservation_row.room_id;

  if p_room_id is not null then
    selected_room_id := p_room_id;
  end if;

  if selected_room_id is null then
    select id into selected_room_id
    from public.rooms
    where room_type_id = reservation_row.room_type_id
      and status in ('AVAILABLE', 'CLEAN')
    order by floor, room_number
    for update skip locked
    limit 1;
  end if;

  if selected_room_id is null then
    raise exception 'No available room for this room type';
  end if;

  select status into selected_room_status
  from public.rooms
  where id = selected_room_id
  for update;

  if not found then
    raise exception 'Assigned room not found';
  end if;

  if selected_room_status not in ('AVAILABLE', 'CLEAN') then
    raise exception 'Assigned room is not available for check-in';
  end if;

  update public.rooms
  set status = 'OCCUPIED', updated_at = now()
  where id = selected_room_id;

  update public.reservations
  set room_id = selected_room_id,
      status = 'CHECKED_IN',
      updated_at = now()
  where id = p_reservation_id
  returning * into reservation_row;

  return reservation_row;
end;
$$;

create or replace function public.check_out_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_row public.reservations;
  successful_payments numeric(12, 2);
begin
  select * into reservation_row
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'Reservation not found';
  end if;

  if reservation_row.status <> 'CHECKED_IN' then
    raise exception 'Only CHECKED_IN reservations can be checked out';
  end if;

  select coalesce(sum(amount), 0) into successful_payments
  from public.payments
  where reservation_id = p_reservation_id
    and status = 'SUCCEEDED';

  if successful_payments < reservation_row.total_amount then
    raise exception 'Outstanding balance must be paid before check-out';
  end if;

  if reservation_row.room_id is not null then
    update public.rooms
    set status = 'DIRTY', updated_at = now()
    where id = reservation_row.room_id;
  end if;

  update public.reservations
  set status = 'CHECKED_OUT',
      updated_at = now()
  where id = p_reservation_id
  returning * into reservation_row;

  return reservation_row;
end;
$$;
