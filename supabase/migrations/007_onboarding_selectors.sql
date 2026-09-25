-- Migration aditiva: campos usados pelos seletores do onboarding.
-- Nenhuma coluna, tabela, função ou policy existente é alterada ou removida.
-- Todas as colunas novas são nullable ou possuem DEFAULT, portanto o app segue funcionando
-- mesmo para usuários que já concluíram o onboarding.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS favorite_platforms text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS custom_platforms text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_expense_categories public.expense_category[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS custom_expense_categories text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.profiles.birth_date IS 'Data de nascimento informada no onboarding';
COMMENT ON COLUMN public.profiles.neighborhood IS 'Bairro informado no onboarding';
COMMENT ON COLUMN public.profiles.favorite_platforms IS 'Slugs das plataformas de origem de ganho selecionadas no onboarding';
COMMENT ON COLUMN public.profiles.custom_platforms IS 'Nomes de fontes de renda cadastradas manualmente no onboarding';
COMMENT ON COLUMN public.profiles.preferred_expense_categories IS 'Categorias de despesa selecionadas no onboarding';
COMMENT ON COLUMN public.profiles.custom_expense_categories IS 'Nomes de categorias de despesa cadastradas manualmente no onboarding';

ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS work_days smallint[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.goals.work_days IS 'Dias da semana trabalhados (1 = segunda ... 7 = domingo)';

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS odometer_km numeric(12,2);

COMMENT ON COLUMN public.vehicles.odometer_km IS 'Quilometragem atual informada no cadastro do veículo';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_odometer_non_negative'
  ) THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_odometer_non_negative
      CHECK (odometer_km IS NULL OR odometer_km >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'goals_work_days_range'
  ) THEN
    ALTER TABLE public.goals
      ADD CONSTRAINT goals_work_days_range
      CHECK (
        work_days <@ ARRAY[1,2,3,4,5,6,7]::smallint[]
      );
  END IF;
END $$;
