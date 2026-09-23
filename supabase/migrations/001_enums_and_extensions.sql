CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type') THEN
    CREATE TYPE public.vehicle_type AS ENUM ('motorcycle', 'car', 'bicycle', 'walking', 'other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_type') THEN
    CREATE TYPE public.platform_type AS ENUM ('delivery', 'ride_hailing', 'logistics', 'private_client', 'other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_category') THEN
    CREATE TYPE public.expense_category AS ENUM (
      'fuel', 'food', 'maintenance', 'oil_change', 'tires', 'insurance',
      'vehicle_rental', 'vehicle_financing', 'parking', 'toll', 'platform_fee',
      'mobile_internet', 'equipment', 'taxes', 'other'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_type') THEN
    CREATE TYPE public.goal_type AS ENUM ('revenue', 'profit', 'savings');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_period') THEN
    CREATE TYPE public.goal_period AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_category') THEN
    CREATE TYPE public.maintenance_category AS ENUM (
      'oil_change', 'tires', 'brake', 'chain', 'battery', 'engine',
      'revision', 'repair', 'cleaning', 'other'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entry_source') THEN
    CREATE TYPE public.entry_source AS ENUM ('manual', 'import', 'system');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_session_status') THEN
    CREATE TYPE public.work_session_status AS ENUM ('draft', 'completed', 'cancelled');
  END IF;
END $$;

COMMENT ON TYPE public.vehicle_type IS 'Tipos de veículo permitidos no Giro Líquido';
COMMENT ON TYPE public.platform_type IS 'Tipos de plataforma de ganho ou origem de receita';
COMMENT ON TYPE public.expense_category IS 'Categorias de despesa financeira';
COMMENT ON TYPE public.goal_type IS 'Tipos de meta financeira';
COMMENT ON TYPE public.goal_period IS 'Período de acompanhamento da meta';
COMMENT ON TYPE public.maintenance_category IS 'Categorias de manutenção veicular';
COMMENT ON TYPE public.entry_source IS 'Origem do lançamento';
COMMENT ON TYPE public.work_session_status IS 'Status do turno ou jornada de trabalho';
