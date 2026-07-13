-- Evaluates all achievement conditions for the current user and unlocks any
-- newly satisfied ones, awarding their XP/coin rewards.
create or replace function check_and_unlock_achievements()
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile profiles%rowtype;
  v_goal_completions int;
  v_completed_workouts int;
  v_water_days int;
  v_food_days int;
  v_rank_promotions int;
  v_current_level int;
begin
  if v_user_id is null then
    return;
  end if;

  select * into v_profile from profiles where user_id = v_user_id for update;
  if not found then
    return;
  end if;

  select count(*) into v_goal_completions from goal_completions where user_id = v_user_id;
  select count(*) into v_completed_workouts from workouts where user_id = v_user_id and completed = true;
  select count(distinct date) into v_water_days from water_entries where user_id = v_user_id;
  select count(distinct date) into v_food_days from food_entries where user_id = v_user_id;
  select count(*) into v_rank_promotions from activity_history where user_id = v_user_id and activity_type = 'rank_promotion';
  v_current_level := level_for_xp(v_profile.total_xp);

  if v_goal_completions >= 1 then perform unlock_achievement(v_user_id, 'first_quest'); end if;
  if v_completed_workouts >= 1 then perform unlock_achievement(v_user_id, 'first_workout'); end if;
  if v_current_level >= 2 then perform unlock_achievement(v_user_id, 'first_level_up'); end if;
  if v_profile.overall_streak_longest >= 7 then perform unlock_achievement(v_user_id, 'seven_day_streak'); end if;
  if v_profile.overall_streak_longest >= 30 then perform unlock_achievement(v_user_id, 'thirty_day_streak'); end if;
  if v_completed_workouts >= 10 then perform unlock_achievement(v_user_id, 'ten_workouts'); end if;
  if v_completed_workouts >= 50 then perform unlock_achievement(v_user_id, 'fifty_workouts'); end if;
  if v_goal_completions >= 100 then perform unlock_achievement(v_user_id, 'hundred_goals'); end if;
  if v_water_days >= 7 then perform unlock_achievement(v_user_id, 'hydration_hero'); end if;
  if v_food_days >= 7 then perform unlock_achievement(v_user_id, 'nutrition_tracker'); end if;
  if v_rank_promotions >= 1 then perform unlock_achievement(v_user_id, 'rank_promotion'); end if;
  if v_profile.goal_streak_current >= 7 and v_profile.workout_streak_current >= 7
     and v_profile.nutrition_streak_current >= 7 and v_profile.water_streak_current >= 7 then
    perform unlock_achievement(v_user_id, 'consistency_master');
  end if;
end;
$$;

-- Unlocks a single achievement by key if not already unlocked, awarding its rewards.
create or replace function unlock_achievement(p_user_id uuid, p_key text)
returns void
language plpgsql
security invoker
as $$
declare
  v_achievement achievements%rowtype;
begin
  select * into v_achievement from achievements where key = p_key;
  if not found then
    return;
  end if;

  if exists (select 1 from user_achievements where user_id = p_user_id and achievement_id = v_achievement.id) then
    return;
  end if;

  insert into user_achievements (user_id, achievement_id) values (p_user_id, v_achievement.id);

  update profiles set
    total_xp = total_xp + v_achievement.xp_reward,
    coins = coins + v_achievement.coin_reward
  where user_id = p_user_id;

  insert into xp_events (user_id, amount, source, reference_id) values (p_user_id, v_achievement.xp_reward, 'achievement_unlocked', v_achievement.id);
  insert into coin_events (user_id, amount, source, reference_id) values (p_user_id, v_achievement.coin_reward, 'achievement_unlocked', v_achievement.id);
  insert into activity_history (user_id, activity_type, title, description, metadata)
  values (
    p_user_id, 'achievement_unlocked', v_achievement.name, v_achievement.description,
    jsonb_build_object('achievement_id', v_achievement.id, 'xp', v_achievement.xp_reward, 'coins', v_achievement.coin_reward)
  );
end;
$$;

-- Wire achievement checks into the existing completion/streak functions.
create or replace function complete_goal(p_goal_id uuid, p_local_date date)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_goal goals%rowtype;
  v_profile profiles%rowtype;
  v_period_key text;
  v_old_level int;
  v_new_level int;
  v_new_total_xp bigint;
  v_new_coins bigint;
  v_goal_streak record;
  v_overall_streak record;
  v_attr_discipline int := 2;
  v_attr_strength int := 0;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_goal from goals where id = p_goal_id and user_id = v_user_id for update;
  if not found then
    raise exception 'Quest not found';
  end if;
  if v_goal.status = 'archived' then
    raise exception 'Cannot complete an archived quest';
  end if;

  v_period_key := case v_goal.repetition
    when 'one_time' then 'once'
    when 'weekly' then to_char(p_local_date, 'IYYY-"W"IW')
    else to_char(p_local_date, 'YYYY-MM-DD')
  end;

  if exists (select 1 from goal_completions where goal_id = p_goal_id and period_key = v_period_key) then
    raise exception 'Quest already completed for this period';
  end if;

  insert into goal_completions (user_id, goal_id, period_key, xp_awarded, coins_awarded)
  values (v_user_id, p_goal_id, v_period_key, v_goal.xp_reward, v_goal.coin_reward);

  update goals set
    current_progress = case when repetition = 'one_time' then target_value else 0 end,
    status = case when repetition = 'one_time' then 'completed' else status end,
    updated_at = now()
  where id = p_goal_id;

  select * into v_profile from profiles where user_id = v_user_id for update;

  v_old_level := level_for_xp(v_profile.total_xp);
  v_new_total_xp := v_profile.total_xp + v_goal.xp_reward;
  v_new_level := level_for_xp(v_new_total_xp);
  v_new_coins := v_profile.coins + v_goal.coin_reward;

  if v_goal.category = 'workout' then
    v_attr_strength := 1;
  end if;

  select * into v_goal_streak from advance_streak(
    v_profile.goal_streak_current, v_profile.goal_streak_longest, v_profile.goal_streak_last_date, p_local_date
  );
  select * into v_overall_streak from advance_streak(
    v_profile.overall_streak_current, v_profile.overall_streak_longest, v_profile.overall_streak_last_date, p_local_date
  );

  update profiles set
    total_xp = v_new_total_xp,
    coins = v_new_coins,
    attr_discipline = attr_discipline + v_attr_discipline,
    attr_strength = attr_strength + v_attr_strength,
    goal_streak_current = v_goal_streak.new_current,
    goal_streak_longest = v_goal_streak.new_longest,
    goal_streak_last_date = v_goal_streak.new_last_date,
    overall_streak_current = v_overall_streak.new_current,
    overall_streak_longest = v_overall_streak.new_longest,
    overall_streak_last_date = v_overall_streak.new_last_date
  where user_id = v_user_id;

  insert into xp_events (user_id, amount, source, reference_id) values (v_user_id, v_goal.xp_reward, 'goal_completed', p_goal_id);
  insert into coin_events (user_id, amount, source, reference_id) values (v_user_id, v_goal.coin_reward, 'goal_completed', p_goal_id);
  insert into attribute_events (user_id, attribute, amount, source) values (v_user_id, 'discipline', v_attr_discipline, 'goal_completed');
  if v_attr_strength > 0 then
    insert into attribute_events (user_id, attribute, amount, source) values (v_user_id, 'strength', v_attr_strength, 'goal_completed');
  end if;

  insert into activity_history (user_id, activity_type, title, description, category, metadata)
  values (
    v_user_id, 'goal_completed', v_goal.title,
    format('Earned %s XP and %s coins', v_goal.xp_reward, v_goal.coin_reward),
    v_goal.category,
    jsonb_build_object('goal_id', p_goal_id, 'xp', v_goal.xp_reward, 'coins', v_goal.coin_reward)
  );

  if v_new_level > v_old_level then
    insert into activity_history (user_id, activity_type, title, description, metadata)
    values (
      v_user_id, 'level_up', format('Reached Level %s', v_new_level), null,
      jsonb_build_object('old_level', v_old_level, 'new_level', v_new_level)
    );
    if rank_for_level(v_new_level) <> rank_for_level(v_old_level) then
      insert into activity_history (user_id, activity_type, title, description, metadata)
      values (
        v_user_id, 'rank_promotion', format('Promoted to %s Rank', rank_for_level(v_new_level)), null,
        jsonb_build_object('old_rank', rank_for_level(v_old_level), 'new_rank', rank_for_level(v_new_level))
      );
    end if;
  end if;

  perform check_and_unlock_achievements();

  return jsonb_build_object(
    'xpAwarded', v_goal.xp_reward,
    'coinsAwarded', v_goal.coin_reward,
    'oldLevel', v_old_level,
    'newLevel', v_new_level,
    'leveledUp', v_new_level > v_old_level,
    'oldRank', rank_for_level(v_old_level),
    'newRank', rank_for_level(v_new_level),
    'rankChanged', rank_for_level(v_new_level) <> rank_for_level(v_old_level),
    'newTotalXp', v_new_total_xp,
    'newCoins', v_new_coins
  );
end;
$$;

create or replace function complete_workout(p_workout_id uuid, p_local_date date)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_workout workouts%rowtype;
  v_profile profiles%rowtype;
  v_old_level int;
  v_new_level int;
  v_new_total_xp bigint;
  v_new_coins bigint;
  v_xp_reward int;
  v_coin_reward int;
  v_magnitude int;
  v_attr_strength int := 0;
  v_attr_endurance int := 0;
  v_attr_agility int := 0;
  v_attr_discipline int := 1;
  v_workout_streak record;
  v_overall_streak record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_workout from workouts where id = p_workout_id and user_id = v_user_id for update;
  if not found then
    raise exception 'Workout not found';
  end if;
  if v_workout.completed then
    raise exception 'Workout already completed';
  end if;

  v_xp_reward := least(200, greatest(5, v_workout.duration_minutes));
  v_coin_reward := round(v_xp_reward / 2.0);
  v_magnitude := greatest(1, round(v_workout.duration_minutes / 15.0));

  if v_workout.workout_type = 'strength' then
    v_attr_strength := v_magnitude * 2;
  end if;
  if v_workout.workout_type in ('running', 'walking', 'cycling', 'swimming', 'hiit') then
    v_attr_endurance := v_magnitude * 2;
  end if;
  if v_workout.workout_type in ('hiit', 'yoga', 'stretching', 'sports') then
    v_attr_agility := v_magnitude;
  end if;

  update workouts set completed = true, updated_at = now() where id = p_workout_id;

  select * into v_profile from profiles where user_id = v_user_id for update;

  v_old_level := level_for_xp(v_profile.total_xp);
  v_new_total_xp := v_profile.total_xp + v_xp_reward;
  v_new_level := level_for_xp(v_new_total_xp);
  v_new_coins := v_profile.coins + v_coin_reward;

  select * into v_workout_streak from advance_streak(
    v_profile.workout_streak_current, v_profile.workout_streak_longest, v_profile.workout_streak_last_date, p_local_date
  );
  select * into v_overall_streak from advance_streak(
    v_profile.overall_streak_current, v_profile.overall_streak_longest, v_profile.overall_streak_last_date, p_local_date
  );

  update profiles set
    total_xp = v_new_total_xp,
    coins = v_new_coins,
    attr_strength = attr_strength + v_attr_strength,
    attr_endurance = attr_endurance + v_attr_endurance,
    attr_agility = attr_agility + v_attr_agility,
    attr_discipline = attr_discipline + v_attr_discipline,
    workout_streak_current = v_workout_streak.new_current,
    workout_streak_longest = v_workout_streak.new_longest,
    workout_streak_last_date = v_workout_streak.new_last_date,
    overall_streak_current = v_overall_streak.new_current,
    overall_streak_longest = v_overall_streak.new_longest,
    overall_streak_last_date = v_overall_streak.new_last_date
  where user_id = v_user_id;

  insert into xp_events (user_id, amount, source, reference_id) values (v_user_id, v_xp_reward, 'workout_completed', p_workout_id);
  insert into coin_events (user_id, amount, source, reference_id) values (v_user_id, v_coin_reward, 'workout_completed', p_workout_id);
  if v_attr_strength > 0 then
    insert into attribute_events (user_id, attribute, amount, source) values (v_user_id, 'strength', v_attr_strength, 'workout_completed');
  end if;
  if v_attr_endurance > 0 then
    insert into attribute_events (user_id, attribute, amount, source) values (v_user_id, 'endurance', v_attr_endurance, 'workout_completed');
  end if;
  if v_attr_agility > 0 then
    insert into attribute_events (user_id, attribute, amount, source) values (v_user_id, 'agility', v_attr_agility, 'workout_completed');
  end if;
  insert into attribute_events (user_id, attribute, amount, source) values (v_user_id, 'discipline', v_attr_discipline, 'workout_completed');

  insert into activity_history (user_id, activity_type, title, description, category, metadata)
  values (
    v_user_id, 'workout_logged', v_workout.name,
    format('Earned %s XP and %s coins', v_xp_reward, v_coin_reward),
    v_workout.workout_type,
    jsonb_build_object('workout_id', p_workout_id, 'xp', v_xp_reward, 'coins', v_coin_reward)
  );

  if v_new_level > v_old_level then
    insert into activity_history (user_id, activity_type, title, description, metadata)
    values (v_user_id, 'level_up', format('Reached Level %s', v_new_level), null, jsonb_build_object('old_level', v_old_level, 'new_level', v_new_level));
    if rank_for_level(v_new_level) <> rank_for_level(v_old_level) then
      insert into activity_history (user_id, activity_type, title, description, metadata)
      values (
        v_user_id, 'rank_promotion', format('Promoted to %s Rank', rank_for_level(v_new_level)), null,
        jsonb_build_object('old_rank', rank_for_level(v_old_level), 'new_rank', rank_for_level(v_new_level))
      );
    end if;
  end if;

  perform check_and_unlock_achievements();

  return jsonb_build_object(
    'xpAwarded', v_xp_reward,
    'coinsAwarded', v_coin_reward,
    'oldLevel', v_old_level,
    'newLevel', v_new_level,
    'leveledUp', v_new_level > v_old_level,
    'oldRank', rank_for_level(v_old_level),
    'newRank', rank_for_level(v_new_level),
    'rankChanged', rank_for_level(v_new_level) <> rank_for_level(v_old_level),
    'newTotalXp', v_new_total_xp,
    'newCoins', v_new_coins
  );
end;
$$;

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

  perform check_and_unlock_achievements();
end;
$$;
