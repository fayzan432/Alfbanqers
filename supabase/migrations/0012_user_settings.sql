-- Cross-device sync for theme/animation/notification preferences.
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  theme text not null default 'dark_fantasy' check (theme in ('dark_fantasy', 'dark_calm', 'light')),
  reduced_motion boolean not null default false,
  animations_enabled boolean not null default true,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_user_settings_user_id on user_settings(user_id);
alter table user_settings enable row level security;
create policy "User settings are viewable by owner" on user_settings for select using (auth.uid() = user_id);
create policy "User settings are insertable by owner" on user_settings for insert with check (auth.uid() = user_id);
create policy "User settings are updatable by owner" on user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger user_settings_set_updated_at before update on user_settings for each row execute function set_updated_at();
