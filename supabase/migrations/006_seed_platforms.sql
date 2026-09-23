INSERT INTO public.platforms (slug, name, platform_type, logo_url, is_system, is_active)
VALUES
  ('ifood', 'iFood', 'delivery', NULL, true, true),
  ('rappi', 'Rappi', 'delivery', NULL, true, true),
  ('uber', 'Uber', 'ride_hailing', NULL, true, true),
  ('99', '99', 'ride_hailing', NULL, true, true),
  ('lalamove', 'Lalamove', 'logistics', NULL, true, true),
  ('particular', 'Particular', 'private_client', NULL, true, true),
  ('outros', 'Outros', 'other', NULL, true, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  platform_type = EXCLUDED.platform_type,
  logo_url = EXCLUDED.logo_url,
  is_system = true,
  is_active = true,
  updated_at = now();

COMMENT ON TABLE public.platforms IS 'Catálogo global de plataformas de origem de ganho; dados básicos semestralmente atualizados e mantidos pelo sistema.';
