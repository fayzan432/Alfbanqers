-- Atomically marks a workout complete, awarding XP/coins/attributes once.
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
