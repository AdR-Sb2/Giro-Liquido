CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    preferred_currency,
    timezone,
    onboarding_completed,
    accepted_terms_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    'BRL',
    'America/Sao_Paulo',
    false,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_profile_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'O campo id do profile é imutável.';
  END IF;

  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'O campo created_at do profile é imutável.';
  END IF;

  IF OLD.accepted_terms_at IS NOT NULL AND NEW.accepted_terms_at IS DISTINCT FROM OLD.accepted_terms_at THEN
    RAISE EXCEPTION 'accepted_terms_at não pode ser alterado após preenchido.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_immutable_fields ON public.profiles;
CREATE TRIGGER trg_profiles_immutable_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_immutable_fields();

CREATE OR REPLACE FUNCTION public.validate_work_session_vehicle_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_vehicle_user_id uuid;
BEGIN
  IF NEW.vehicle_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_vehicle_user_id
  FROM public.vehicles
  WHERE id = NEW.vehicle_id;

  IF v_vehicle_user_id IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'vehicle_id deve pertencer ao mesmo usuário da sessão de trabalho.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_earning_work_session_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_session_user_id uuid;
BEGIN
  IF NEW.work_session_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_session_user_id
  FROM public.work_sessions
  WHERE id = NEW.work_session_id;

  IF v_session_user_id IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'work_session_id deve pertencer ao mesmo usuário do ganho.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_expense_relationships()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_session_user_id uuid;
  v_vehicle_user_id uuid;
BEGIN
  IF NEW.work_session_id IS NOT NULL THEN
    SELECT user_id INTO v_session_user_id
    FROM public.work_sessions
    WHERE id = NEW.work_session_id;

    IF v_session_user_id IS DISTINCT FROM NEW.user_id THEN
      RAISE EXCEPTION 'work_session_id da despesa deve pertencer ao mesmo usuário.';
    END IF;
  END IF;

  IF NEW.vehicle_id IS NOT NULL THEN
    SELECT user_id INTO v_vehicle_user_id
    FROM public.vehicles
    WHERE id = NEW.vehicle_id;

    IF v_vehicle_user_id IS DISTINCT FROM NEW.user_id THEN
      RAISE EXCEPTION 'vehicle_id da despesa deve pertencer ao mesmo usuário.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_maintenance_vehicle_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_vehicle_user_id uuid;
BEGIN
  SELECT user_id INTO v_vehicle_user_id
  FROM public.vehicles
  WHERE id = NEW.vehicle_id;

  IF v_vehicle_user_id IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'vehicle_id do registro de manutenção deve pertencer ao mesmo usuário.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_work_session_vehicle_owner ON public.work_sessions;
CREATE TRIGGER trg_validate_work_session_vehicle_owner
BEFORE INSERT OR UPDATE ON public.work_sessions
FOR EACH ROW
EXECUTE FUNCTION public.validate_work_session_vehicle_owner();

DROP TRIGGER IF EXISTS trg_validate_earning_work_session_owner ON public.earnings;
CREATE TRIGGER trg_validate_earning_work_session_owner
BEFORE INSERT OR UPDATE ON public.earnings
FOR EACH ROW
EXECUTE FUNCTION public.validate_earning_work_session_owner();

DROP TRIGGER IF EXISTS trg_validate_expense_relationships ON public.expenses;
CREATE TRIGGER trg_validate_expense_relationships
BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.validate_expense_relationships();

DROP TRIGGER IF EXISTS trg_validate_maintenance_vehicle_owner ON public.maintenance_records;
CREATE TRIGGER trg_validate_maintenance_vehicle_owner
BEFORE INSERT OR UPDATE ON public.maintenance_records
FOR EACH ROW
EXECUTE FUNCTION public.validate_maintenance_vehicle_owner();

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER trg_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_platforms_updated_at ON public.platforms;
CREATE TRIGGER trg_platforms_updated_at
BEFORE UPDATE ON public.platforms
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_work_sessions_updated_at ON public.work_sessions;
CREATE TRIGGER trg_work_sessions_updated_at
BEFORE UPDATE ON public.work_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_earnings_updated_at ON public.earnings;
CREATE TRIGGER trg_earnings_updated_at
BEFORE UPDATE ON public.earnings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_expenses_updated_at ON public.expenses;
CREATE TRIGGER trg_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_goals_updated_at ON public.goals;
CREATE TRIGGER trg_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_maintenance_records_updated_at ON public.maintenance_records;
CREATE TRIGGER trg_maintenance_records_updated_at
BEFORE UPDATE ON public.maintenance_records
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.get_financial_summary(
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  total_revenue numeric,
  total_base_earnings numeric,
  total_tips numeric,
  total_bonus numeric,
  total_expenses numeric,
  total_profit numeric,
  total_worked_minutes bigint,
  total_distance_km numeric,
  profit_per_hour numeric,
  profit_per_km numeric,
  session_count bigint,
  earnings_count bigint,
  expenses_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Autenticação necessária para acessar o resumo financeiro.';
  END IF;

  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    RAISE EXCEPTION 'p_start_date e p_end_date são obrigatórios.';
  END IF;

  IF p_start_date > p_end_date THEN
    RAISE EXCEPTION 'p_start_date deve ser menor ou igual a p_end_date.';
  END IF;

  RETURN QUERY
  WITH earnings_agg AS (
    SELECT
      COALESCE(SUM(amount), 0) AS total_base_earnings,
      COALESCE(SUM(tips_amount), 0) AS total_tips,
      COALESCE(SUM(bonus_amount), 0) AS total_bonus,
      COALESCE(SUM(amount + tips_amount + bonus_amount), 0) AS total_revenue,
      COUNT(*) AS earnings_count
    FROM public.earnings
    WHERE user_id = v_user_id
      AND earning_date BETWEEN p_start_date AND p_end_date
  ),
  expenses_agg AS (
    SELECT
      COALESCE(SUM(amount), 0) AS total_expenses,
      COUNT(*) AS expenses_count
    FROM public.expenses
    WHERE user_id = v_user_id
      AND expense_date BETWEEN p_start_date AND p_end_date
  ),
  sessions_agg AS (
    SELECT
      COALESCE(SUM(duration_minutes), 0)::bigint AS total_worked_minutes,
      COALESCE(SUM(distance_km), 0) AS total_distance_km,
      COUNT(*) AS session_count
    FROM public.work_sessions
    WHERE user_id = v_user_id
      AND work_date BETWEEN p_start_date AND p_end_date
  )
  SELECT
    ROUND(e.total_revenue, 2) AS total_revenue,
    ROUND(e.total_base_earnings, 2) AS total_base_earnings,
    ROUND(e.total_tips, 2) AS total_tips,
    ROUND(e.total_bonus, 2) AS total_bonus,
    ROUND(ex.total_expenses, 2) AS total_expenses,
    ROUND(e.total_revenue - ex.total_expenses, 2) AS total_profit,
    s.total_worked_minutes,
    ROUND(s.total_distance_km, 2) AS total_distance_km,
    CASE
      WHEN s.total_worked_minutes = 0 THEN NULL
      ELSE ROUND(((e.total_revenue - ex.total_expenses) / s.total_worked_minutes) * 60, 2)
    END AS profit_per_hour,
    CASE
      WHEN s.total_distance_km = 0 THEN NULL
      ELSE ROUND((e.total_revenue - ex.total_expenses) / s.total_distance_km, 2)
    END AS profit_per_km,
    s.session_count,
    e.earnings_count,
    ex.expenses_count
  FROM earnings_agg e
  CROSS JOIN expenses_agg ex
  CROSS JOIN sessions_agg s;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_platform_performance(
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  platform_id uuid,
  platform_name text,
  platform_type public.platform_type,
  total_revenue numeric,
  base_earnings numeric,
  tips numeric,
  bonuses numeric,
  earnings_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Autenticação necessária para acessar o desempenho por plataforma.';
  END IF;

  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    RAISE EXCEPTION 'p_start_date e p_end_date são obrigatórios.';
  END IF;

  IF p_start_date > p_end_date THEN
    RAISE EXCEPTION 'p_start_date deve ser menor ou igual a p_end_date.';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS platform_id,
    p.name AS platform_name,
    p.platform_type,
    ROUND(COALESCE(SUM(e.amount + e.tips_amount + e.bonus_amount), 0), 2) AS total_revenue,
    ROUND(COALESCE(SUM(e.amount), 0), 2) AS base_earnings,
    ROUND(COALESCE(SUM(e.tips_amount), 0), 2) AS tips,
    ROUND(COALESCE(SUM(e.bonus_amount), 0), 2) AS bonuses,
    COUNT(*)::bigint AS earnings_count
  FROM public.earnings e
  JOIN public.platforms p ON p.id = e.platform_id
  WHERE e.user_id = v_user_id
    AND e.earning_date BETWEEN p_start_date AND p_end_date
  GROUP BY p.id, p.name, p.platform_type
  ORDER BY total_revenue DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_goal_progress(
  p_reference_date date DEFAULT current_date
)
RETURNS TABLE (
  goal_id uuid,
  name text,
  goal_type public.goal_type,
  goal_period public.goal_period,
  target_amount numeric,
  period_start date,
  period_end date,
  current_amount numeric,
  progress_percent numeric,
  is_completed boolean,
  progress_note text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Autenticação necessária para acessar o progresso das metas.';
  END IF;

  RETURN QUERY
  WITH goal_windows AS (
    SELECT
      g.id AS goal_id,
      g.name,
      g.goal_type,
      g.goal_period,
      g.target_amount,
      CASE
        WHEN g.goal_period = 'daily' THEN p_reference_date
        WHEN g.goal_period = 'weekly' THEN (p_reference_date - ((EXTRACT(DOW FROM p_reference_date)::int + 6) % 7))::date
        WHEN g.goal_period = 'monthly' THEN date_trunc('month', p_reference_date)::date
        WHEN g.goal_period = 'yearly' THEN date_trunc('year', p_reference_date)::date
      END AS period_start,
      CASE
        WHEN g.goal_period = 'daily' THEN p_reference_date
        WHEN g.goal_period = 'weekly' THEN (p_reference_date - ((EXTRACT(DOW FROM p_reference_date)::int + 6) % 7))::date + 6
        WHEN g.goal_period = 'monthly' THEN ((date_trunc('month', p_reference_date) + interval '1 month' - interval '1 day')::date)
        WHEN g.goal_period = 'yearly' THEN ((date_trunc('year', p_reference_date) + interval '1 year' - interval '1 day')::date)
      END AS period_end,
      GREATEST(g.start_date, CASE
        WHEN g.goal_period = 'daily' THEN p_reference_date
        WHEN g.goal_period = 'weekly' THEN (p_reference_date - ((EXTRACT(DOW FROM p_reference_date)::int + 6) % 7))::date
        WHEN g.goal_period = 'monthly' THEN date_trunc('month', p_reference_date)::date
        WHEN g.goal_period = 'yearly' THEN date_trunc('year', p_reference_date)::date
      END) AS effective_start,
      LEAST(COALESCE(g.end_date, CASE
        WHEN g.goal_period = 'daily' THEN p_reference_date
        WHEN g.goal_period = 'weekly' THEN (p_reference_date - ((EXTRACT(DOW FROM p_reference_date)::int + 6) % 7))::date + 6
        WHEN g.goal_period = 'monthly' THEN ((date_trunc('month', p_reference_date) + interval '1 month' - interval '1 day')::date)
        WHEN g.goal_period = 'yearly' THEN ((date_trunc('year', p_reference_date) + interval '1 year' - interval '1 day')::date)
      END), CASE
        WHEN g.goal_period = 'daily' THEN p_reference_date
        WHEN g.goal_period = 'weekly' THEN (p_reference_date - ((EXTRACT(DOW FROM p_reference_date)::int + 6) % 7))::date + 6
        WHEN g.goal_period = 'monthly' THEN ((date_trunc('month', p_reference_date) + interval '1 month' - interval '1 day')::date)
        WHEN g.goal_period = 'yearly' THEN ((date_trunc('year', p_reference_date) + interval '1 year' - interval '1 day')::date)
      END) AS effective_end
    FROM public.goals g
    WHERE g.user_id = v_user_id
      AND g.is_active = true
  ),
  revenue_agg AS (
    SELECT
      gw.goal_id,
      COALESCE(SUM(e.amount + e.tips_amount + e.bonus_amount), 0) AS revenue_total
    FROM goal_windows gw
    LEFT JOIN public.earnings e
      ON e.user_id = v_user_id
     AND e.earning_date BETWEEN gw.effective_start AND gw.effective_end
    GROUP BY gw.goal_id
  ),
  expense_agg AS (
    SELECT
      gw.goal_id,
      COALESCE(SUM(ex.amount), 0) AS expense_total
    FROM goal_windows gw
    LEFT JOIN public.expenses ex
      ON ex.user_id = v_user_id
     AND ex.expense_date BETWEEN gw.effective_start AND gw.effective_end
    GROUP BY gw.goal_id
  )
  SELECT
    gw.goal_id,
    gw.name,
    gw.goal_type,
    gw.goal_period,
    gw.target_amount,
    gw.period_start,
    gw.period_end,
    CASE
      WHEN gw.goal_type = 'revenue' THEN COALESCE(ra.revenue_total, 0)
      WHEN gw.goal_type = 'profit' THEN COALESCE(ra.revenue_total, 0) - COALESCE(ea.expense_total, 0)
      ELSE 0
    END AS current_amount,
    CASE
      WHEN gw.target_amount = 0 THEN 0
      ELSE ROUND((CASE
        WHEN gw.goal_type = 'revenue' THEN COALESCE(ra.revenue_total, 0)
        WHEN gw.goal_type = 'profit' THEN COALESCE(ra.revenue_total, 0) - COALESCE(ea.expense_total, 0)
        ELSE 0
      END / gw.target_amount) * 100, 2)
    END AS progress_percent,
    CASE
      WHEN gw.goal_type = 'revenue' THEN COALESCE(ra.revenue_total, 0) >= gw.target_amount
      WHEN gw.goal_type = 'profit' THEN (COALESCE(ra.revenue_total, 0) - COALESCE(ea.expense_total, 0)) >= gw.target_amount
      ELSE false
    END AS is_completed,
    CASE
      WHEN gw.goal_type = 'savings' THEN 'Esse cálculo será implementado quando existir módulo de saldo e reserva.'
      ELSE NULL
    END AS progress_note
  FROM goal_windows gw
  LEFT JOIN revenue_agg ra ON ra.goal_id = gw.goal_id
  LEFT JOIN expense_agg ea ON ea.goal_id = gw.goal_id
  WHERE gw.effective_start <= gw.effective_end
  ORDER BY gw.goal_id;
END;
$$;

CREATE OR REPLACE VIEW public.v_user_daily_financials AS
WITH earnings_daily AS (
  SELECT
    user_id,
    earning_date::date AS financial_date,
    SUM(amount + tips_amount + bonus_amount) AS total_revenue,
    COUNT(*) AS earnings_count
  FROM public.earnings
  GROUP BY user_id, earning_date::date
),
expenses_daily AS (
  SELECT
    user_id,
    expense_date::date AS financial_date,
    SUM(amount) AS total_expenses,
    COUNT(*) AS expenses_count
  FROM public.expenses
  GROUP BY user_id, expense_date::date
),
sessions_daily AS (
  SELECT
    user_id,
    work_date::date AS financial_date,
    SUM(duration_minutes) AS total_worked_minutes,
    SUM(distance_km) AS total_distance_km
  FROM public.work_sessions
  GROUP BY user_id, work_date::date
)
SELECT
  COALESCE(ed.user_id, ex.user_id, ss.user_id) AS user_id,
  COALESCE(ed.financial_date, ex.financial_date, ss.financial_date) AS financial_date,
  COALESCE(ed.total_revenue, 0) AS total_revenue,
  COALESCE(ex.total_expenses, 0) AS total_expenses,
  COALESCE(ed.total_revenue, 0) - COALESCE(ex.total_expenses, 0) AS total_profit,
  COALESCE(ss.total_worked_minutes, 0)::bigint AS total_worked_minutes,
  COALESCE(ss.total_distance_km, 0) AS total_distance_km,
  CASE
    WHEN COALESCE(ss.total_worked_minutes, 0) = 0 THEN NULL
    ELSE ROUND(((COALESCE(ed.total_revenue, 0) - COALESCE(ex.total_expenses, 0)) / ss.total_worked_minutes) * 60, 2)
  END AS profit_per_hour,
  CASE
    WHEN COALESCE(ss.total_distance_km, 0) = 0 THEN NULL
    ELSE ROUND((COALESCE(ed.total_revenue, 0) - COALESCE(ex.total_expenses, 0)) / ss.total_distance_km, 2)
  END AS profit_per_km
FROM earnings_daily ed
FULL OUTER JOIN expenses_daily ex
  ON ed.user_id = ex.user_id
 AND ed.financial_date = ex.financial_date
FULL OUTER JOIN sessions_daily ss
  ON COALESCE(ed.user_id, ex.user_id) = ss.user_id
 AND COALESCE(ed.financial_date, ex.financial_date) = ss.financial_date;

COMMENT ON VIEW public.v_user_daily_financials IS 'Resumo financeiro diário por usuário. O frontend deve filtrar user_id = auth.uid() ou usar a RPC de resumo quando necessário.';

CREATE OR REPLACE VIEW public.v_vehicle_maintenance_summary AS
SELECT
  mr.user_id,
  mr.vehicle_id,
  COUNT(*)::bigint AS maintenance_count,
  COALESCE(SUM(mr.amount), 0) AS total_maintenance_amount,
  MAX(mr.maintenance_date) AS latest_maintenance_date,
  MAX(mr.odometer_km) AS latest_odometer_km,
  MAX(mr.next_due_date) AS next_due_date,
  MAX(mr.next_due_odometer_km) AS next_due_odometer_km
FROM public.maintenance_records mr
GROUP BY mr.user_id, mr.vehicle_id;

COMMENT ON VIEW public.v_vehicle_maintenance_summary IS 'Resumo de manutenção por usuário e veículo';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.profiles FROM PUBLIC;
REVOKE ALL ON TABLE public.vehicles FROM PUBLIC;
REVOKE ALL ON TABLE public.platforms FROM PUBLIC;
REVOKE ALL ON TABLE public.work_sessions FROM PUBLIC;
REVOKE ALL ON TABLE public.earnings FROM PUBLIC;
REVOKE ALL ON TABLE public.expenses FROM PUBLIC;
REVOKE ALL ON TABLE public.goals FROM PUBLIC;
REVOKE ALL ON TABLE public.maintenance_records FROM PUBLIC;

REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.vehicles FROM anon;
REVOKE ALL ON TABLE public.platforms FROM anon;
REVOKE ALL ON TABLE public.work_sessions FROM anon;
REVOKE ALL ON TABLE public.earnings FROM anon;
REVOKE ALL ON TABLE public.expenses FROM anon;
REVOKE ALL ON TABLE public.goals FROM anon;
REVOKE ALL ON TABLE public.maintenance_records FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vehicles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.work_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.earnings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.maintenance_records TO authenticated;
GRANT SELECT ON TABLE public.platforms TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.platforms FROM authenticated;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_blocked" ON public.profiles;
CREATE POLICY "profiles_insert_blocked"
ON public.profiles
FOR INSERT
WITH CHECK (false);

DROP POLICY IF EXISTS "profiles_delete_blocked" ON public.profiles;
CREATE POLICY "profiles_delete_blocked"
ON public.profiles
FOR DELETE
USING (false);

DROP POLICY IF EXISTS "vehicles_select_own" ON public.vehicles;
CREATE POLICY "vehicles_select_own"
ON public.vehicles
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "vehicles_insert_own" ON public.vehicles;
CREATE POLICY "vehicles_insert_own"
ON public.vehicles
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "vehicles_update_own" ON public.vehicles;
CREATE POLICY "vehicles_update_own"
ON public.vehicles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "vehicles_delete_own" ON public.vehicles;
CREATE POLICY "vehicles_delete_own"
ON public.vehicles
FOR DELETE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "work_sessions_select_own" ON public.work_sessions;
CREATE POLICY "work_sessions_select_own"
ON public.work_sessions
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "work_sessions_insert_own" ON public.work_sessions;
CREATE POLICY "work_sessions_insert_own"
ON public.work_sessions
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "work_sessions_update_own" ON public.work_sessions;
CREATE POLICY "work_sessions_update_own"
ON public.work_sessions
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "work_sessions_delete_own" ON public.work_sessions;
CREATE POLICY "work_sessions_delete_own"
ON public.work_sessions
FOR DELETE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "earnings_select_own" ON public.earnings;
CREATE POLICY "earnings_select_own"
ON public.earnings
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "earnings_insert_own" ON public.earnings;
CREATE POLICY "earnings_insert_own"
ON public.earnings
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "earnings_update_own" ON public.earnings;
CREATE POLICY "earnings_update_own"
ON public.earnings
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "earnings_delete_own" ON public.earnings;
CREATE POLICY "earnings_delete_own"
ON public.earnings
FOR DELETE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "expenses_select_own" ON public.expenses;
CREATE POLICY "expenses_select_own"
ON public.expenses
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "expenses_insert_own" ON public.expenses;
CREATE POLICY "expenses_insert_own"
ON public.expenses
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "expenses_update_own" ON public.expenses;
CREATE POLICY "expenses_update_own"
ON public.expenses
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "expenses_delete_own" ON public.expenses;
CREATE POLICY "expenses_delete_own"
ON public.expenses
FOR DELETE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "goals_select_own" ON public.goals;
CREATE POLICY "goals_select_own"
ON public.goals
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "goals_insert_own" ON public.goals;
CREATE POLICY "goals_insert_own"
ON public.goals
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "goals_update_own" ON public.goals;
CREATE POLICY "goals_update_own"
ON public.goals
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "goals_delete_own" ON public.goals;
CREATE POLICY "goals_delete_own"
ON public.goals
FOR DELETE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "maintenance_select_own" ON public.maintenance_records;
CREATE POLICY "maintenance_select_own"
ON public.maintenance_records
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "maintenance_insert_own" ON public.maintenance_records;
CREATE POLICY "maintenance_insert_own"
ON public.maintenance_records
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "maintenance_update_own" ON public.maintenance_records;
CREATE POLICY "maintenance_update_own"
ON public.maintenance_records
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "maintenance_delete_own" ON public.maintenance_records;
CREATE POLICY "maintenance_delete_own"
ON public.maintenance_records
FOR DELETE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "platforms_select_active" ON public.platforms;
CREATE POLICY "platforms_select_active"
ON public.platforms
FOR SELECT
USING (auth.role() = 'authenticated' AND is_active = true);

DROP POLICY IF EXISTS "platforms_insert_blocked" ON public.platforms;
CREATE POLICY "platforms_insert_blocked"
ON public.platforms
FOR INSERT
WITH CHECK (false);

DROP POLICY IF EXISTS "platforms_update_blocked" ON public.platforms;
CREATE POLICY "platforms_update_blocked"
ON public.platforms
FOR UPDATE
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "platforms_delete_blocked" ON public.platforms;
CREATE POLICY "platforms_delete_blocked"
ON public.platforms
FOR DELETE
USING (false);

REVOKE ALL ON FUNCTION public.get_financial_summary(date, date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_financial_summary(date, date) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_financial_summary(date, date) TO authenticated;

REVOKE ALL ON FUNCTION public.get_platform_performance(date, date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_platform_performance(date, date) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_platform_performance(date, date) TO authenticated;

REVOKE ALL ON FUNCTION public.get_goal_progress(date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_goal_progress(date) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_goal_progress(date) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles (state);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles (onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles (user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_default_active ON public.vehicles (user_id) WHERE is_default = true AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_work_date ON public.work_sessions (user_id, work_date DESC);
CREATE INDEX IF NOT EXISTS idx_work_sessions_vehicle_id ON public.work_sessions (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_earnings_user_date ON public.earnings (user_id, earning_date DESC);
CREATE INDEX IF NOT EXISTS idx_earnings_work_session_id ON public.earnings (work_session_id);
CREATE INDEX IF NOT EXISTS idx_earnings_platform_id ON public.earnings (platform_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses (user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_work_session_id ON public.expenses (work_session_id);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle_id ON public.expenses (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (category);
CREATE INDEX IF NOT EXISTS idx_goals_user_active ON public.goals (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_maintenance_user_date ON public.maintenance_records (user_id, maintenance_date DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_date ON public.maintenance_records (vehicle_id, maintenance_date DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_default_active_unique
ON public.vehicles (user_id)
WHERE is_default = true AND is_active = true;
