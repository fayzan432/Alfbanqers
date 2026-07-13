-- Personal rewards (Ascension Coin sinks) and in-app reminders.

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  coin_cost int not null check (coin_cost >= 0),
  required_level int not null default 1 check (required_level >= 1),
  required_streak int not null default 0 check (required_streak >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_rewards_user_id on rewards(user_id);
alter table rewards enable row level security;
create policy "Rewards are viewable by owner" on rewards for select using (auth.uid() = user_id);
create policy "Rewards are insertable by owner" on rewards for insert with check (auth.uid() = user_id);
create policy "Rewards are updatable by owner" on rewards for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Rewards are deletable by owner" on rewards for delete using (auth.uid() = user_id);
create trigger rewards_set_updated_at before update on rewards for each row execute function set_updated_at();

create table if not exists reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_id uuid not null references rewards(id) on delete cascade,
  coin_cost int not null,
  redeemed_at timestamptz not null default now()
);
create index if not exists idx_reward_redemptions_user_id on reward_redemptions(user_id, redeemed_at desc);
alter table reward_redemptions enable row level security;
create policy "Reward redemptions are viewable by owner" on reward_redemptions for select using (auth.uid() = user_id);
create policy "Reward redemptions are insertable by owner" on reward_redemptions for insert with check (auth.uid() = user_id);

create or replace function redeem_reward(p_reward_id uuid)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_reward rewards%rowtype;
  v_profile profiles%rowtype;
  v_current_level int;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_reward from rewards where id = p_reward_id and user_id = v_user_id for update;
  if not found then
    raise exception 'Reward not found';
  end if;
  if not v_reward.active then
    raise exception 'This reward is not currently active';
  end if;

  select * into v_profile from profiles where user_id = v_user_id for update;
  v_current_level := level_for_xp(v_profile.total_xp);

  if v_profile.coins < v_reward.coin_cost then
    raise exception 'Not enough Ascension Coins';
  end if;
  if v_current_level < v_reward.required_level then
    raise exception 'Level % required', v_reward.required_level;
  end if;
  if v_profile.overall_streak_current < v_reward.required_streak then
    raise exception 'A % day streak is required', v_reward.required_streak;
  end if;

  update profiles set coins = coins - v_reward.coin_cost where user_id = v_user_id;
  insert into reward_redemptions (user_id, reward_id, coin_cost) values (v_user_id, p_reward_id, v_reward.coin_cost);
  insert into coin_events (user_id, amount, source, reference_id) values (v_user_id, -v_reward.coin_cost, 'reward_redeemed', p_reward_id);
  insert into activity_history (user_id, activity_type, title, description, metadata)
  values (
    v_user_id, 'reward_redeemed', v_reward.name,
    format('Spent %s coins', v_reward.coin_cost),
    jsonb_build_object('reward_id', p_reward_id, 'coin_cost', v_reward.coin_cost)
  );

  return jsonb_build_object('newCoins', v_profile.coins - v_reward.coin_cost);
end;
$$;

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text,
  reminder_type text not null check (reminder_type in ('workout', 'meal', 'water', 'goal', 'sleep', 'weight', 'custom')),
  date date not null,
  time time not null,
  repeat_pattern text not null default 'none' check (repeat_pattern in ('none', 'daily', 'weekly', 'weekdays')),
  goal_id uuid references goals(id) on delete set null,
  enabled boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_reminders_user_id on reminders(user_id, date, time);
alter table reminders enable row level security;
create policy "Reminders are viewable by owner" on reminders for select using (auth.uid() = user_id);
create policy "Reminders are insertable by owner" on reminders for insert with check (auth.uid() = user_id);
create policy "Reminders are updatable by owner" on reminders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Reminders are deletable by owner" on reminders for delete using (auth.uid() = user_id);
create trigger reminders_set_updated_at before update on reminders for each row execute function set_updated_at();
