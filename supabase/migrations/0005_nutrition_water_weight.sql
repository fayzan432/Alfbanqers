-- Nutrition, hydration, and body-weight tracking tables.

create table if not exists saved_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_name text not null,
  calories numeric not null default 0 check (calories >= 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  carbs_g numeric not null default 0 check (carbs_g >= 0),
  fat_g numeric not null default 0 check (fat_g >= 0),
  serving_amount numeric not null default 1 check (serving_amount > 0),
  serving_unit text not null default 'serving',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_saved_foods_user_id on saved_foods(user_id);
alter table saved_foods enable row level security;
create policy "Saved foods are viewable by owner" on saved_foods for select using (auth.uid() = user_id);
create policy "Saved foods are insertable by owner" on saved_foods for insert with check (auth.uid() = user_id);
create policy "Saved foods are updatable by owner" on saved_foods for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Saved foods are deletable by owner" on saved_foods for delete using (auth.uid() = user_id);

create table if not exists food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_name text not null,
  calories numeric not null default 0 check (calories >= 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  carbs_g numeric not null default 0 check (carbs_g >= 0),
  fat_g numeric not null default 0 check (fat_g >= 0),
  serving_amount numeric not null default 1 check (serving_amount > 0),
  serving_unit text not null default 'serving',
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  date date not null,
  time time,
  saved_food_id uuid references saved_foods(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_food_entries_user_date on food_entries(user_id, date);
alter table food_entries enable row level security;
create policy "Food entries are viewable by owner" on food_entries for select using (auth.uid() = user_id);
create policy "Food entries are insertable by owner" on food_entries for insert with check (auth.uid() = user_id);
create policy "Food entries are updatable by owner" on food_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Food entries are deletable by owner" on food_entries for delete using (auth.uid() = user_id);

create table if not exists water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_ml int not null check (amount_ml > 0),
  date date not null,
  logged_at timestamptz not null default now()
);
create index if not exists idx_water_entries_user_date on water_entries(user_id, date);
alter table water_entries enable row level security;
create policy "Water entries are viewable by owner" on water_entries for select using (auth.uid() = user_id);
create policy "Water entries are insertable by owner" on water_entries for insert with check (auth.uid() = user_id);
create policy "Water entries are deletable by owner" on water_entries for delete using (auth.uid() = user_id);

create table if not exists weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric not null check (weight_kg > 0 and weight_kg < 500),
  date date not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists idx_weight_entries_user_date on weight_entries(user_id, date desc);
alter table weight_entries enable row level security;
create policy "Weight entries are viewable by owner" on weight_entries for select using (auth.uid() = user_id);
create policy "Weight entries are insertable by owner" on weight_entries for insert with check (auth.uid() = user_id);
create policy "Weight entries are updatable by owner" on weight_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Weight entries are deletable by owner" on weight_entries for delete using (auth.uid() = user_id);
