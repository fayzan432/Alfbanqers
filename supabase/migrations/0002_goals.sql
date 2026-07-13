-- Goals (quests) and their completion ledger.

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'personal'
    check (category in ('workout', 'nutrition', 'water', 'sleep', 'study', 'discipline', 'personal', 'custom')),
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard', 'elite')),
  xp_reward int not null default 10 check (xp_reward >= 0),
  coin_reward int not null default 5 check (coin_reward >= 0),
  deadline timestamptz,
  repetition text not null default 'one_time'
    check (repetition in ('one_time', 'daily', 'weekly', 'weekdays', 'custom_interval')),
  repetition_weekdays int[],
  repetition_interval_days int check (repetition_interval_days is null or repetition_interval_days > 0),
  reminder_enabled boolean not null default false,
  progress_type text not null default 'checkbox'
    check (progress_type in ('checkbox', 'numeric', 'duration', 'quantity')),
  target_value numeric not null default 1 check (target_value > 0),
  current_progress numeric not null default 0 check (current_progress >= 0),
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_goals_user_id on goals(user_id);
create index if not exists idx_goals_user_status on goals(user_id, status);

alter table goals enable row level security;

create policy "Goals are viewable by owner" on goals for select using (auth.uid() = user_id);
create policy "Goals are insertable by owner" on goals for insert with check (auth.uid() = user_id);
create policy "Goals are updatable by owner" on goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Goals are deletable by owner" on goals for delete using (auth.uid() = user_id);

create trigger goals_set_updated_at
  before update on goals
  for each row execute function set_updated_at();

-- One row per rewarded completion "period" (dedupe key = goal_id + period_key).
create table if not exists goal_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references goals(id) on delete cascade,
  period_key text not null,
  xp_awarded int not null default 0,
  coins_awarded int not null default 0,
  completed_at timestamptz not null default now(),
  unique (goal_id, period_key)
);

create index if not exists idx_goal_completions_user_id on goal_completions(user_id);
create index if not exists idx_goal_completions_goal_id on goal_completions(goal_id);

alter table goal_completions enable row level security;

create policy "Goal completions are viewable by owner" on goal_completions for select using (auth.uid() = user_id);
create policy "Goal completions are insertable by owner" on goal_completions for insert with check (auth.uid() = user_id);
create policy "Goal completions are deletable by owner" on goal_completions for delete using (auth.uid() = user_id);
