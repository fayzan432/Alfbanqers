-- Generic per-category streak advancement, reusable by nutrition/water/workout logging.
create or replace function log_streak_activity(p_streak_type text, p_local_date date)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile profiles%rowtype;
  v_type_streak record;
  v_overall_streak record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  if p_streak_type not in ('goal', 'workout', 'nutrition', 'water') then
    raise exception 'Invalid streak type: %', p_streak_type;
  end if;

  select * into v_profile from profiles where user_id = v_user_id for update;
  if not found then
    raise exception 'Profile not found';
  end if;

  if p_streak_type = 'goal' then
    select * into v_type_streak from advance_streak(
      v_profile.goal_streak_current, v_profile.goal_streak_longest, v_profile.goal_streak_last_date, p_local_date
    );
    update profiles set
      goal_streak_current = v_type_streak.new_current,
      goal_streak_longest = v_type_streak.new_longest,
      goal_streak_last_date = v_type_streak.new_last_date
    where user_id = v_user_id;
  elsif p_streak_type = 'workout' then
    select * into v_type_streak from advance_streak(
      v_profile.workout_streak_current, v_profile.workout_streak_longest, v_profile.workout_streak_last_date, p_local_date
    );
    update profiles set
      workout_streak_current = v_type_streak.new_current,
      workout_streak_longest = v_type_streak.new_longest,
      workout_streak_last_date = v_type_streak.new_last_date
    where user_id = v_user_id;
  elsif p_streak_type = 'nutrition' then
    select * into v_type_streak from advance_streak(
      v_profile.nutrition_streak_current, v_profile.nutrition_streak_longest, v_profile.nutrition_streak_last_date, p_local_date
    );
    update profiles set
      nutrition_streak_current = v_type_streak.new_current,
      nutrition_streak_longest = v_type_streak.new_longest,
      nutrition_streak_last_date = v_type_streak.new_last_date
    where user_id = v_user_id;
  elsif p_streak_type = 'water' then
    select * into v_type_streak from advance_streak(
      v_profile.water_streak_current, v_profile.water_streak_longest, v_profile.water_streak_last_date, p_local_date
    );
    update profiles set
      water_streak_current = v_type_streak.new_current,
      water_streak_longest = v_type_streak.new_longest,
      water_streak_last_date = v_type_streak.new_last_date
    where user_id = v_user_id;
  end if;

  select * into v_overall_streak from advance_streak(
    v_profile.overall_streak_current, v_profile.overall_streak_longest, v_profile.overall_streak_last_date, p_local_date
  );
  update profiles set
    overall_streak_current = v_overall_streak.new_current,
    overall_streak_longest = v_overall_streak.new_longest,
    overall_streak_last_date = v_overall_streak.new_last_date
  where user_id = v_user_id;
end;
$$;
