-- Achievement catalog (read-only reference data) and per-user unlocks.

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text not null,
  icon text not null,
  xp_reward int not null default 0 check (xp_reward >= 0),
  coin_reward int not null default 0 check (coin_reward >= 0)
);

alter table achievements enable row level security;
create policy "Achievements are readable by authenticated users" on achievements
  for select using (auth.role() = 'authenticated');

insert into achievements (key, name, description, icon, xp_reward, coin_reward) values
  ('first_quest', 'First Quest', 'Complete your first quest.', 'swords', 20, 10),
  ('first_workout', 'First Workout', 'Log and complete your first workout.', 'dumbbell', 20, 10),
  ('first_level_up', 'First Level-Up', 'Reach Level 2 for the first time.', 'trending-up', 25, 15),
  ('seven_day_streak', 'Seven-Day Streak', 'Reach a 7-day overall activity streak.', 'flame', 40, 20),
  ('thirty_day_streak', 'Thirty-Day Streak', 'Reach a 30-day overall activity streak.', 'flame', 150, 75),
  ('ten_workouts', 'Ten Workouts', 'Complete 10 workouts.', 'dumbbell', 60, 30),
  ('fifty_workouts', 'Fifty Workouts', 'Complete 50 workouts.', 'dumbbell', 200, 100),
  ('hundred_goals', 'One Hundred Goals', 'Complete 100 quests.', 'swords', 250, 125),
  ('hydration_hero', 'Hydration Hero', 'Log water intake on 7 different days.', 'droplets', 40, 20),
  ('nutrition_tracker', 'Nutrition Tracker', 'Log food on 7 different days.', 'apple', 40, 20),
  ('rank_promotion', 'Rank Promotion', 'Achieve your first rank promotion.', 'shield-half', 50, 25),
  ('consistency_master', 'Consistency Master', 'Maintain goal, workout, nutrition, and water streaks of 7+ days simultaneously.', 'repeat-2', 300, 150)
on conflict (key) do nothing;

create table if not exists user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);
create index if not exists idx_user_achievements_user_id on user_achievements(user_id);
alter table user_achievements enable row level security;
create policy "User achievements are viewable by owner" on user_achievements for select using (auth.uid() = user_id);
create policy "User achievements are insertable by owner" on user_achievements for insert with check (auth.uid() = user_id);
