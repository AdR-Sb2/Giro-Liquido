CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  goal_type public.goal_type NOT NULL,
  goal_period public.goal_period NOT NULL,
  target_amount numeric(12,2) NOT NULL,
  start_date date NOT NULL,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT goals_target_amount_positive CHECK (target_amount > 0),
  CONSTRAINT goals_end_date_valid CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT goals_name_not_blank CHECK (length(trim(name)) > 0)
);

COMMENT ON TABLE public.goals IS 'Metas financeiras do usuário';
COMMENT ON COLUMN public.goals.target_amount IS 'Valor alvo da meta';
COMMENT ON COLUMN public.goals.start_date IS 'Data inicial do período da meta';
COMMENT ON COLUMN public.goals.end_date IS 'Data final opcional da meta';
COMMENT ON COLUMN public.goals.is_active IS 'Indica se a meta está ativa';

CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  category public.maintenance_category NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  maintenance_date date NOT NULL,
  odometer_km numeric(12,2),
  next_due_date date,
  next_due_odometer_km numeric(12,2),
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT maintenance_amount_non_negative CHECK (amount >= 0),
  CONSTRAINT maintenance_odometer_non_negative CHECK (odometer_km IS NULL OR odometer_km >= 0),
  CONSTRAINT maintenance_next_odometer_non_negative CHECK (next_due_odometer_km IS NULL OR next_due_odometer_km >= 0)
);

COMMENT ON TABLE public.maintenance_records IS 'Registros de manutenção do veículo';
COMMENT ON COLUMN public.maintenance_records.category IS 'Tipo de manutenção executada';
COMMENT ON COLUMN public.maintenance_records.amount IS 'Custo da manutenção';
COMMENT ON COLUMN public.maintenance_records.maintenance_date IS 'Data em que a manutenção foi realizada';
COMMENT ON COLUMN public.maintenance_records.odometer_km IS 'Odômetro no momento da manutenção';
COMMENT ON COLUMN public.maintenance_records.next_due_date IS 'Próxima data recomendada para manutenção';
COMMENT ON COLUMN public.maintenance_records.next_due_odometer_km IS 'Próximo odômetro para manutenção';

CREATE INDEX IF NOT EXISTS idx_goals_user_active ON public.goals (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_maintenance_user_date ON public.maintenance_records (user_id, maintenance_date DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_date ON public.maintenance_records (vehicle_id, maintenance_date DESC);
