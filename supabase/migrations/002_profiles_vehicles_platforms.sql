CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  city text,
  state char(2),
  avatar_url text,
  preferred_currency char(3) NOT NULL DEFAULT 'BRL',
  timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  onboarding_completed boolean NOT NULL DEFAULT false,
  accepted_terms_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_state_format CHECK (state IS NULL OR (state ~ '^[A-Z]{2}$')),
  CONSTRAINT profiles_currency_check CHECK (preferred_currency = 'BRL')
);

COMMENT ON TABLE public.profiles IS 'Perfil do usuário autenticado complementar ao auth.users';
COMMENT ON COLUMN public.profiles.id IS 'Mesmo UUID do usuário autenticado';
COMMENT ON COLUMN public.profiles.full_name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.phone IS 'Telefone do usuário';
COMMENT ON COLUMN public.profiles.city IS 'Cidade do usuário';
COMMENT ON COLUMN public.profiles.state IS 'Estado em sigla com 2 letras maiúsculas';
COMMENT ON COLUMN public.profiles.preferred_currency IS 'Moeda preferencial (atualmente BRL)';
COMMENT ON COLUMN public.profiles.timezone IS 'Time zone do usuário';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Indica se o onboarding foi concluído';
COMMENT ON COLUMN public.profiles.accepted_terms_at IS 'Data e hora em que o usuário aceitou os termos';

CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  vehicle_type public.vehicle_type NOT NULL,
  make text,
  model text,
  model_year integer,
  license_plate text,
  fuel_type text,
  average_consumption_km_per_liter numeric(8,2),
  estimated_fuel_price numeric(12,2),
  fixed_monthly_cost numeric(12,2) NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicles_average_consumption_positive CHECK (average_consumption_km_per_liter IS NULL OR average_consumption_km_per_liter > 0),
  CONSTRAINT vehicles_estimated_fuel_price_non_negative CHECK (estimated_fuel_price IS NULL OR estimated_fuel_price >= 0),
  CONSTRAINT vehicles_fixed_monthly_cost_non_negative CHECK (fixed_monthly_cost >= 0),
  CONSTRAINT vehicles_model_year_valid CHECK (model_year IS NULL OR (model_year BETWEEN 1900 AND EXTRACT(YEAR FROM now()) + 1)),
  CONSTRAINT vehicles_name_not_blank CHECK (length(trim(name)) > 0)
);

COMMENT ON TABLE public.vehicles IS 'Veículos cadastrados por cada usuário';
COMMENT ON COLUMN public.vehicles.average_consumption_km_per_liter IS 'Consumo médio do veículo em km por litro';
COMMENT ON COLUMN public.vehicles.estimated_fuel_price IS 'Preço estimado do combustível para cálculo de custo';
COMMENT ON COLUMN public.vehicles.fixed_monthly_cost IS 'Custo mensal fixo do veículo';
COMMENT ON COLUMN public.vehicles.is_default IS 'Veículo padrão do usuário';
COMMENT ON COLUMN public.vehicles.is_active IS 'Indica se o veículo está ativo';

CREATE TABLE IF NOT EXISTS public.platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  platform_type public.platform_type NOT NULL,
  logo_url text,
  is_system boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT platforms_slug_not_blank CHECK (length(trim(slug)) > 0),
  CONSTRAINT platforms_name_not_blank CHECK (length(trim(name)) > 0)
);

COMMENT ON TABLE public.platforms IS 'Catálogo global de plataformas de origem de ganho';
COMMENT ON COLUMN public.platforms.slug IS 'Identificador técnico único da plataforma';
COMMENT ON COLUMN public.platforms.is_system IS 'Indica se a plataforma faz parte do catálogo do sistema';
COMMENT ON COLUMN public.platforms.is_active IS 'Indica se a plataforma está ativa para uso';

CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles (user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_default_active ON public.vehicles (user_id, is_default, is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_default_active_unique ON public.vehicles (user_id)
WHERE is_default = true AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_platforms_active ON public.platforms (is_active, platform_type);
