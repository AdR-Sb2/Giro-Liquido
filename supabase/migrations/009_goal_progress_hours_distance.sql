-- Atualiza a RPC de progresso de metas para calcular também metas por horas trabalhadas
-- e por quilômetros. Mesma assinatura e mesmas colunas de retorno: nenhum consumidor quebra.

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
  ),
  session_agg AS (
    SELECT
      gw.goal_id,
      COALESCE(SUM(ws.duration_minutes), 0) AS minutes_total,
      COALESCE(SUM(ws.distance_km), 0) AS km_total
    FROM goal_windows gw
    LEFT JOIN public.work_sessions ws
      ON ws.user_id = v_user_id
     AND ws.work_date BETWEEN gw.effective_start AND gw.effective_end
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
      WHEN gw.goal_type = 'hours' THEN ROUND(COALESCE(sa.minutes_total, 0) / 60.0, 2)
      WHEN gw.goal_type = 'distance' THEN ROUND(COALESCE(sa.km_total, 0), 2)
      ELSE 0
    END AS current_amount,
    CASE
      WHEN gw.target_amount = 0 THEN 0
      ELSE ROUND(
        (CASE
          WHEN gw.goal_type = 'revenue' THEN COALESCE(ra.revenue_total, 0)
          WHEN gw.goal_type = 'profit' THEN COALESCE(ra.revenue_total, 0) - COALESCE(ea.expense_total, 0)
          WHEN gw.goal_type = 'hours' THEN COALESCE(sa.minutes_total, 0) / 60.0
          WHEN gw.goal_type = 'distance' THEN COALESCE(sa.km_total, 0)
          ELSE 0
        END / gw.target_amount) * 100, 2
      )
    END AS progress_percent,
    CASE
      WHEN gw.goal_type = 'revenue' THEN COALESCE(ra.revenue_total, 0) >= gw.target_amount
      WHEN gw.goal_type = 'profit' THEN (COALESCE(ra.revenue_total, 0) - COALESCE(ea.expense_total, 0)) >= gw.target_amount
      WHEN gw.goal_type = 'hours' THEN (COALESCE(sa.minutes_total, 0) / 60.0) >= gw.target_amount
      WHEN gw.goal_type = 'distance' THEN COALESCE(sa.km_total, 0) >= gw.target_amount
      WHEN gw.goal_type = 'savings' THEN false
      ELSE false
    END AS is_completed,
    CASE
      WHEN gw.goal_type = 'savings' THEN 'Esse cálculo será implementado quando existir módulo de saldo e reserva.'
      WHEN gw.goal_type = 'hours' THEN 'Horas trabalhadas no período, com base nos turnos finalizados.'
      WHEN gw.goal_type = 'distance' THEN 'Quilômetros registrados nos turnos do período.'
      ELSE NULL
    END AS progress_note
  FROM goal_windows gw
  LEFT JOIN revenue_agg ra ON ra.goal_id = gw.goal_id
  LEFT JOIN expense_agg ea ON ea.goal_id = gw.goal_id
  LEFT JOIN session_agg sa ON sa.goal_id = gw.goal_id
  WHERE gw.effective_start <= gw.effective_end
  ORDER BY gw.goal_id;
END;
$$;
