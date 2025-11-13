create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  image text,
  plan text default 'FREE',
  stripe_customer_id text,
  created_at timestamptz default now()
);

create table public.palettes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  prompt text,
  tokens jsonb not null,
  tags text[] default '{}',
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  palette_generations int default 0
);

alter table public.profiles enable row level security;
alter table public.palettes enable row level security;
alter table public.usage enable row level security;

create policy "profiles are editable by owner"
  on public.profiles for all
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

create policy "palettes belong to user"
  on public.palettes for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create policy "usage belongs to user"
  on public.usage for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );
