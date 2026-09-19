create table if not exists public.housekeeping_updates (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id),
  previous_status public.room_status,
  new_status public.room_status not null,
  notes text,
  updated_by text,
  created_at timestamptz not null default now()
);

create or replace function public.update_housekeeping_status(
  p_room_id uuid,
  p_status public.room_status,
  p_notes text default null,
  p_updated_by text default null
)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  room_row public.rooms;
begin
  select * into room_row
  from public.rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'Room not found';
  end if;

  if p_status not in ('DIRTY', 'CLEAN', 'INSPECTION') then
    raise exception 'Housekeeping status must be DIRTY, CLEAN, or INSPECTION';
  end if;

  insert into public.housekeeping_updates (
    room_id,
    previous_status,
    new_status,
    notes,
    updated_by
  ) values (
    room_row.id,
    room_row.status,
    p_status,
    p_notes,
    p_updated_by
  );

  update public.rooms
  set status = p_status,
      updated_at = now()
  where id = p_room_id
  returning * into room_row;

  return room_row;
end;
$$;
