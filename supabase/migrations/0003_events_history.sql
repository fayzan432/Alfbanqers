-- Ledger tables for XP, coins, attributes, and the unified activity timeline.

create table if not exists xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  source text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_xp_events_user_id on xp_events(user_id, created_at desc);
alter table xp_events enable row level security;
create policy "Xp events are viewable by owner" on xp_events for select using (auth.uid() = user_id);
create policy "Xp events are insertable by owner" on xp_events for insert with check (auth.uid() = user_id);

create table if not exists coin_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  source text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_coin_events_user_id on coin_events(user_id, created_at desc);
alter table coin_events enable row level security;
create policy "Coin events are viewable by owner" on coin_events for select using (auth.uid() = user_id);
create policy "Coin events are insertable by owner" on coin_events for insert with check (auth.uid() = user_id);

create table if not exists attribute_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  attribute text not null check (attribute in ('strength', 'endurance', 'discipline', 'agility', 'consistency')),
  amount int not null,
  source text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_attribute_events_user_id on attribute_events(user_id, created_at desc);
alter table attribute_events enable row level security;
create policy "Attribute events are viewable by owner" on attribute_events for select using (auth.uid() = user_id);
create policy "Attribute events are insertable by owner" on attribute_events for insert with check (auth.uid() = user_id);

create table if not exists activity_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in (
    'goal_completed', 'workout_logged', 'food_logged', 'water_logged', 'weight_logged',
    'level_up', 'rank_promotion', 'achievement_unlocked', 'reward_redeemed', 'xp_event'
  )),
  title text not null,
  description text,
  category text,
  metadata jsonb,
  occurred_at timestamptz not null default now()
);
create index if not exists idx_activity_history_user_id on activity_history(user_id, occurred_at desc);
create index if not exists idx_activity_history_type on activity_history(user_id, activity_type);
alter table activity_history enable row level security;
create policy "Activity history is viewable by owner" on activity_history for select using (auth.uid() = user_id);
create policy "Activity history is insertable by owner" on activity_history for insert with check (auth.uid() = user_id);
create policy "Activity history is deletable by owner" on activity_history for delete using (auth.uid() = user_id);
