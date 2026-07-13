-- Workouts, strength exercises, sets, and reusable templates.

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  workout_type text not null check (workout_type in (
    'strength', 'running', 'walking', 'cycling', 'swimming', 'hiit', 'yoga', 'stretching', 'sports', 'custom'
  )),
  date date not null,
  start_time time,
  duration_minutes int not null default 0 check (duration_minutes >= 0),
  calories_burned numeric check (calories_burned is null or calories_burned >= 0),
  distance_km numeric check (distance_km is null or distance_km >= 0),
  notes text,
  difficulty text check (difficulty in ('easy', 'medium', 'hard', 'elite')),
  completed boolean not null default false,
  template_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_workouts_user_date on workouts(user_id, date desc);
alter table workouts enable row level security;
create policy "Workouts are viewable by owner" on workouts for select using (auth.uid() = user_id);
create policy "Workouts are insertable by owner" on workouts for insert with check (auth.uid() = user_id);
create policy "Workouts are updatable by owner" on workouts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Workouts are deletable by owner" on workouts for delete using (auth.uid() = user_id);
create trigger workouts_set_updated_at before update on workouts for each row execute function set_updated_at();

create table if not exists workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_name text not null,
  muscle_group text,
  order_index int not null default 0,
  rest_seconds int check (rest_seconds is null or rest_seconds >= 0),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_workout_exercises_workout_id on workout_exercises(workout_id);
create index if not exists idx_workout_exercises_user_name on workout_exercises(user_id, exercise_name);
alter table workout_exercises enable row level security;
create policy "Workout exercises are viewable by owner" on workout_exercises for select using (auth.uid() = user_id);
create policy "Workout exercises are insertable by owner" on workout_exercises for insert with check (auth.uid() = user_id);
create policy "Workout exercises are updatable by owner" on workout_exercises for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Workout exercises are deletable by owner" on workout_exercises for delete using (auth.uid() = user_id);

create table if not exists exercise_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_exercise_id uuid not null references workout_exercises(id) on delete cascade,
  set_number int not null default 1 check (set_number > 0),
  reps int check (reps is null or reps >= 0),
  weight_kg numeric check (weight_kg is null or weight_kg >= 0),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_exercise_sets_workout_exercise_id on exercise_sets(workout_exercise_id);
alter table exercise_sets enable row level security;
create policy "Exercise sets are viewable by owner" on exercise_sets for select using (auth.uid() = user_id);
create policy "Exercise sets are insertable by owner" on exercise_sets for insert with check (auth.uid() = user_id);
create policy "Exercise sets are updatable by owner" on exercise_sets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Exercise sets are deletable by owner" on exercise_sets for delete using (auth.uid() = user_id);

create table if not exists workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  workout_type text not null check (workout_type in (
    'strength', 'running', 'walking', 'cycling', 'swimming', 'hiit', 'yoga', 'stretching', 'sports', 'custom'
  )),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_workout_templates_user_id on workout_templates(user_id);
alter table workout_templates enable row level security;
create policy "Workout templates are viewable by owner" on workout_templates for select using (auth.uid() = user_id);
create policy "Workout templates are insertable by owner" on workout_templates for insert with check (auth.uid() = user_id);
create policy "Workout templates are updatable by owner" on workout_templates for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Workout templates are deletable by owner" on workout_templates for delete using (auth.uid() = user_id);
create trigger workout_templates_set_updated_at before update on workout_templates for each row execute function set_updated_at();
