do $$
begin
  create type public.room_status as enum (
    'AVAILABLE',
    'RESERVED',
    'OCCUPIED',
    'DIRTY',
    'CLEAN',
    'INSPECTION',
    'MAINTENANCE',
    'OUT_OF_SERVICE'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null,
  room_type_id uuid not null references public.room_types(id),
  floor integer not null,
  status public.room_status not null default 'AVAILABLE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_room_number_unique unique (room_number),
  constraint rooms_floor_positive check (floor > 0)
);

insert into public.rooms (room_number, room_type_id, floor, status)
select inventory.room_number,
       room_types.id,
       inventory.floor,
       'AVAILABLE'::public.room_status
from (
  select room_number, floor, room_type from (
    select generate_series(201, 208)::text as room_number, 2 as floor, 'Standard' as room_type
    union all select generate_series(301, 308)::text, 3, 'Standard'
    union all select generate_series(401, 406)::text, 4, 'Standard'
    union all select generate_series(407, 408)::text, 4, 'Superior'
    union all select generate_series(501, 508)::text, 5, 'Superior'
    union all select generate_series(601, 604)::text, 6, 'Superior'
    union all select generate_series(605, 608)::text, 6, 'Deluxe'
    union all select generate_series(701, 704)::text, 7, 'Deluxe'
    union all select generate_series(705, 708)::text, 7, 'Executive'
    union all select generate_series(801, 804)::text, 8, 'Executive'
    union all select generate_series(805, 808)::text, 8, 'Suite'
  ) defined_inventory
) inventory
join public.room_types on room_types.name = inventory.room_type
on conflict (room_number) do update set
  room_type_id = excluded.room_type_id,
  floor = excluded.floor,
  updated_at = now();
