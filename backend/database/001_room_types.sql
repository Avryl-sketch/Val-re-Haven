create extension if not exists pgcrypto;

create table if not exists public.room_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_per_night numeric(12, 2),
  capacity integer,
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_types_name_unique unique (name),
  constraint room_types_price_nonnegative check (price_per_night is null or price_per_night >= 0),
  constraint room_types_capacity_positive check (capacity is null or capacity > 0),
  constraint room_types_features_array check (jsonb_typeof(features) = 'array')
);

insert into public.room_types (name, description, price_per_night, features)
values
  (
    'Standard',
    'A comfortable room designed for a relaxing and convenient stay.',
    3500,
    '["Queen Bed", "Bedside tables", "View", "Private comfort room", "Desk and coffee area"]'::jsonb
  ),
  (
    'Superior',
    'A spacious accommodation with additional space for relaxation.',
    4500,
    '["Queen Bed", "Large view", "Comfort room", "Desk and coffee area", "Sitting area"]'::jsonb
  ),
  (
    'Deluxe',
    'A refined room offering more space and premium features.',
    6000,
    '["King Bed", "Large view", "Comfort room with bathtub", "Desk and coffee area", "Sitting area", "Balcony"]'::jsonb
  ),
  (
    'Executive',
    'A premium accommodation offering generous space and comfort.',
    8000,
    '["King Bed", "Large view", "Comfort room with bathtub", "Desk and coffee area", "Sitting area", "Work desk", "Mini bar"]'::jsonb
  ),
  (
    'Suite',
    'A spacious and luxurious accommodation designed for extra comfort and privacy.',
    null,
    '["Separate bedroom", "King Bed", "Large view", "Living room", "Comfort room with bathtub", "Desk and coffee area", "Dining area", "Balcony"]'::jsonb
  )
on conflict (name) do update set
  description = excluded.description,
  price_per_night = excluded.price_per_night,
  features = excluded.features,
  updated_at = now();
