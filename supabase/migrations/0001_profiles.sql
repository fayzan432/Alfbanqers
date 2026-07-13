-- LEVEL UP MULLICK: core profile schema
-- Run this after creating a new Supabase project (SQL Editor or supabase CLI).

create extension if not exists "pgcrypto";

-- Generic trigger function to keep updated_at columns fresh.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null default 'Adventurer',
  age int check (age is null or (age between 13 and 120)),
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm numeric check (height_cm is null or height_cm > 0),
  current_weight_kg numeric check (current_weight_kg is null or current_weight_kg > 0),
  target_weight_kg numeric check (target_weight_kg is null or target_weight_kg > 0),
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  main_goal text check (main_goal in ('lose_weight', 'gain_muscle', 'maintain_weight', 'improve_fitness', 'build_discipline')),
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  daily_calorie_goal int not null default 2000 check (daily_calorie_goal >= 0),
  daily_protein_goal int not null default 120 check (daily_protein_goal >= 0),
  daily_carb_goal int not null default 220 check (daily_carb_goal >= 0),
  daily_fat_goal int not null default 65 check (daily_fat_goal >= 0),
  daily_water_goal_ml int not null default 2500 check (daily_water_goal_ml >= 0),
  total_xp bigint not null default 0 check (total_xp >= 0),
  coins bigint not null default 0 check (coins >= 0),
  onboarding_completed boolean not null default false,
  attr_strength int not null default 0 check (attr_strength >= 0),
  attr_endurance int not null default 0 check (attr_endurance >= 0),
  attr_discipline int not null default 0 check (attr_discipline >= 0),
  attr_agility int not null default 0 check (attr_agility >= 0),
  attr_consistency int not null default 0 check (attr_consistency >= 0),
  goal_streak_current int not null default 0 check (goal_streak_current >= 0),
  goal_streak_longest int not null default 0 check (goal_streak_longest >= 0),
  goal_streak_last_date date,
  workout_streak_current int not null default 0 check (workout_streak_current >= 0),
  workout_streak_longest int not null default 0 check (workout_streak_longest >= 0),
  workout_streak_last_date date,
  nutrition_streak_current int not null default 0 check (nutrition_streak_current >= 0),
  nutrition_streak_longest int not null default 0 check (nutrition_streak_longest >= 0),
  nutrition_streak_last_date date,
  water_streak_current int not null default 0 check (water_streak_current >= 0),
  water_streak_longest int not null default 0 check (water_streak_longest >= 0),
  water_streak_last_date date,
  overall_streak_current int not null default 0 check (overall_streak_current >= 0),
  overall_streak_longest int not null default 0 check (overall_streak_longest >= 0),
  overall_streak_last_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_user_id on profiles(user_id);

alter table profiles enable row level security;

create policy "Profiles are viewable by owner" on profiles
  for select using (auth.uid() = user_id);

create policy "Profiles are insertable by owner" on profiles
  for insert with check (auth.uid() = user_id);

create policy "Profiles are updatable by owner" on profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Profiles are deletable by owner" on profiles
  for delete using (auth.uid() = user_id);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Automatically create a profile row whenever a new auth user is created.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Adventurer'))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
