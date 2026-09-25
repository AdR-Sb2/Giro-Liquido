-- Migration aditiva: personalização do onboarding (trabalho, prioridades, posse do veículo,
-- metas por horas/distância). Nenhuma coluna, tabela ou policy existente é alterada ou removida.

-- 1. Novas opções de tipo de meta
ALTER TYPE public.goal_type ADD VALUE IF NOT EXISTS 'hours';
ALTER TYPE public.goal_type ADD VALUE IF NOT EXISTS 'distance';

COMMENT ON TYPE public.goal_type IS 'Tipos de meta financeira: revenue, profit, savings, hours e distance';

-- 2. Perfil: tipos de trabalho e o que o usuário quer acompanhar
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS work_types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tracking_priorities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS planned_hours_per_day numeric(4,2);

COMMENT ON COLUMN public.profiles.work_types IS 'Como o usuário ganha dinheiro (delivery, ride_hailing, logistics, bicycle_delivery, private_client, other)';
COMMENT ON COLUMN public.profiles.tracking_priorities IS 'Indicadores que o usuário quer priorizar no dashboard';
COMMENT ON COLUMN public.profiles.planned_hours_per_day IS 'Horas por dia que o usuário pretende trabalhar';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_planned_hours_positive') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_planned_hours_positive
      CHECK (planned_hours_per_day IS NULL OR (planned_hours_per_day > 0 AND planned_hours_per_day <= 24));
  END IF;
END $$;

-- 3. Veículo: tipo de posse e dados de aluguel
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS ownership_type text,
  ADD COLUMN IF NOT EXISTS rental_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS rental_periodicity text;

COMMENT ON COLUMN public.vehicles.ownership_type IS 'Posse do veículo: owned, rented, borrowed, financed ou other';
COMMENT ON COLUMN public.vehicles.rental_amount IS 'Valor do aluguel do veículo';
COMMENT ON COLUMN public.vehicles.rental_periodicity IS 'Periodicidade do aluguel: daily, weekly ou monthly';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_ownership_type_check') THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_ownership_type_check
      CHECK (ownership_type IS NULL OR ownership_type IN ('owned', 'rented', 'borrowed', 'financed', 'other'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_rental_periodicity_check') THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_rental_periodicity_check
      CHECK (rental_periodicity IS NULL OR rental_periodicity IN ('daily', 'weekly', 'monthly'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_rental_amount_non_negative') THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_rental_amount_non_negative
      CHECK (rental_amount IS NULL OR rental_amount >= 0);
  END IF;
END $$;
