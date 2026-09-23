CREATE TABLE IF NOT EXISTS public.work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  status public.work_session_status NOT NULL DEFAULT 'completed',
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  work_date date NOT NULL,
  duration_minutes integer,
  distance_km numeric(10,2) NOT NULL DEFAULT 0,
  odometer_start_km numeric(12,2),
  odometer_end_km numeric(12,2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT work_sessions_started_before_ended CHECK (ended_at IS NULL OR started_at <= ended_at),
  CONSTRAINT work_sessions_duration_non_negative CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  CONSTRAINT work_sessions_distance_non_negative CHECK (distance_km >= 0),
  CONSTRAINT work_sessions_odometer_valid CHECK (
    odometer_start_km IS NULL OR odometer_end_km IS NULL OR odometer_end_km >= odometer_start_km
  )
);

COMMENT ON TABLE public.work_sessions IS 'Turnos ou jornadas de trabalho de cada usuário';
COMMENT ON COLUMN public.work_sessions.status IS 'Status do turno';
COMMENT ON COLUMN public.work_sessions.started_at IS 'Início da jornada';
COMMENT ON COLUMN public.work_sessions.ended_at IS 'Fim da jornada';
COMMENT ON COLUMN public.work_sessions.work_date IS 'Data da jornada; usada para filtros e relatórios';
COMMENT ON COLUMN public.work_sessions.duration_minutes IS 'Duração total em minutos';
COMMENT ON COLUMN public.work_sessions.distance_km IS 'Distância percorrida na jornada';
COMMENT ON COLUMN public.work_sessions.odometer_start_km IS 'Odômetro inicial da jornada';
COMMENT ON COLUMN public.work_sessions.odometer_end_km IS 'Odômetro final da jornada';

CREATE TABLE IF NOT EXISTS public.earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_session_id uuid REFERENCES public.work_sessions(id) ON DELETE SET NULL,
  platform_id uuid REFERENCES public.platforms(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  tips_amount numeric(12,2) NOT NULL DEFAULT 0,
  bonus_amount numeric(12,2) NOT NULL DEFAULT 0,
  earned_at timestamptz NOT NULL DEFAULT now(),
  earning_date date NOT NULL,
  description text,
  source public.entry_source NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT earnings_amount_positive CHECK (amount > 0),
  CONSTRAINT earnings_tips_non_negative CHECK (tips_amount >= 0),
  CONSTRAINT earnings_bonus_non_negative CHECK (bonus_amount >= 0)
);

COMMENT ON TABLE public.earnings IS 'Lançamentos de ganhos por usuário';
COMMENT ON COLUMN public.earnings.amount IS 'Valor base da receita';
COMMENT ON COLUMN public.earnings.tips_amount IS 'Valor de gorjetas';
COMMENT ON COLUMN public.earnings.bonus_amount IS 'Bônus recebido';
COMMENT ON COLUMN public.earnings.earning_date IS 'Data do ganho usada em filtros e relatórios';
COMMENT ON COLUMN public.earnings.source IS 'Origem do lançamento (manual, import ou system)';

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_session_id uuid REFERENCES public.work_sessions(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  category public.expense_category NOT NULL,
  amount numeric(12,2) NOT NULL,
  expense_at timestamptz NOT NULL DEFAULT now(),
  expense_date date NOT NULL,
  description text,
  is_recurring boolean NOT NULL DEFAULT false,
  source public.entry_source NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT expenses_amount_positive CHECK (amount > 0)
);

COMMENT ON TABLE public.expenses IS 'Lançamentos de despesas financeiras';
COMMENT ON COLUMN public.expenses.category IS 'Categoria da despesa';
COMMENT ON COLUMN public.expenses.amount IS 'Montante da despesa';
COMMENT ON COLUMN public.expenses.expense_date IS 'Data da despesa';
COMMENT ON COLUMN public.expenses.is_recurring IS 'Indica se a despesa é recorrente';

CREATE INDEX IF NOT EXISTS idx_work_sessions_user_date ON public.work_sessions (user_id, work_date DESC);
CREATE INDEX IF NOT EXISTS idx_work_sessions_vehicle_id ON public.work_sessions (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_started_at ON public.work_sessions (started_at);
CREATE INDEX IF NOT EXISTS idx_earnings_user_date ON public.earnings (user_id, earning_date DESC);
CREATE INDEX IF NOT EXISTS idx_earnings_work_session_id ON public.earnings (work_session_id);
CREATE INDEX IF NOT EXISTS idx_earnings_platform_id ON public.earnings (platform_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses (user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_work_session_id ON public.expenses (work_session_id);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle_id ON public.expenses (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (category);
