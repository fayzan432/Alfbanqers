-- Wipes all gamification/tracking data for the calling user and resets
-- progress counters on their profile, without touching their account or
-- profile identity fields (name, body stats, goals, unit preferences).
create or replace function reset_my_progress()
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from goal_completions where user_id = v_user_id;
  delete from goals where user_id = v_user_id;
  delete from exercise_sets where user_id = v_user_id;
  delete from workout_exercises where user_id = v_user_id;
  delete from workouts where user_id = v_user_id;
  delete from workout_templates where user_id = v_user_id;
  delete from food_entries where user_id = v_user_id;
  delete from saved_foods where user_id = v_user_id;
  delete from water_entries where user_id = v_user_id;
  delete from weight_entries where user_id = v_user_id;
  delete from reminders where user_id = v_user_id;
  delete from user_achievements where user_id = v_user_id;
  delete from rewards where user_id = v_user_id;
  delete from reward_redemptions where user_id = v_user_id;
  delete from xp_events where user_id = v_user_id;
  delete from coin_events where user_id = v_user_id;
  delete from attribute_events where user_id = v_user_id;
  delete from activity_history where user_id = v_user_id;

  update profiles set
    total_xp = 0,
    coins = 0,
    attr_strength = 0,
    attr_endurance = 0,
    attr_discipline = 0,
    attr_agility = 0,
    attr_consistency = 0,
    goal_streak_current = 0,
    goal_streak_longest = 0,
    goal_streak_last_date = null,
    workout_streak_current = 0,
    workout_streak_longest = 0,
    workout_streak_last_date = null,
    nutrition_streak_current = 0,
    nutrition_streak_longest = 0,
    nutrition_streak_last_date = null,
    water_streak_current = 0,
    water_streak_longest = 0,
    water_streak_last_date = null,
    overall_streak_current = 0,
    overall_streak_longest = 0,
    overall_streak_last_date = null
  where user_id = v_user_id;
end;
$$;

-- Deletes all of the user's owned data (same as reset) as the data-removal
-- portion of account deletion. Removing the auth.users row itself requires
-- the Supabase service role key and must be done from a trusted server
-- context (e.g. a Supabase Edge Function) - never from this frontend.
create or replace function delete_my_data()
returns void
language plpgsql
security invoker
as $$
begin
  perform reset_my_progress();
  delete from user_settings where user_id = auth.uid();
  delete from profiles where user_id = auth.uid();
end;
$$;
