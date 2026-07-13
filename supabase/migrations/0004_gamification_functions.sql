-- Server-side mirrors of the XP/level/rank formulas in src/utils/xp.ts,
-- plus the atomic quest-completion transaction.

create or replace function xp_required_for_level(p_level int)
returns int
language sql
immutable
as $$
  select round(100 * power(p_level::double precision, 1.35))::int;
$$;

create or replace function level_for_xp(p_total_xp bigint)
returns int
language plpgsql
immutable
as $$
declare
  v_level int := 1;
  v_remaining bigint := greatest(0, p_total_xp);
  v_needed int;
begin
  loop
    v_needed := xp_required_for_level(v_level);
    exit when v_remaining < v_needed or v_level > 9999;
    v_remaining := v_remaining - v_needed;
    v_level := v_level + 1;
  end loop;
  return v_level;
end;
$$;

create or replace function rank_for_level(p_level int)
returns text
language sql
immutable
as $$
  select case
    when p_level <= 5 then 'E'
    when p_level <= 10 then 'D'
    when p_level <= 20 then 'C'
    when p_level <= 35 then 'B'
    when p_level <= 50 then 'A'
    when p_level <= 75 then 'S'
    else 'ASCENDANT'
  end;
$$;

-- Advances (or resets) a streak state given the previous active local date.
create or replace function advance_streak(
  p_current int, p_longest int, p_last_date date, p_activity_date date
)
returns table (new_current int, new_longest int, new_last_date date)
language plpgsql
immutable
as $$
begin
  if p_last_date is not null and p_activity_date = p_last_date then
    return query select p_current, p_longest, p_last_date;
  elsif p_last_date is null or p_activity_date - p_last_date = 1 then
    return query select p_current + 1, greatest(p_longest, p_current + 1), p_activity_date;
  elsif p_activity_date - p_last_date > 1 then
    return query select 1, greatest(p_longest, 1), p_activity_date;
  else
    -- backdated activity (activity_date before last_date): no streak change
    return query select p_current, p_longest, p_last_date;
  end if;
end;
$$;

-- Completes a quest exactly once per recurrence period, atomically awarding
-- XP, coins, attribute points, updating streaks, and logging history.
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
