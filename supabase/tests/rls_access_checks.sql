-- Testes de acesso RLS para garantir isolamento entre usuários.
-- Execute como usuário A e usuário B em diferentes sessões do Supabase.

-- 1) Usuário A cria veículo:
-- INSERT INTO public.vehicles (user_id, name, vehicle_type, is_default, is_active)
-- VALUES (auth.uid(), 'Honda CG 160', 'motorcycle', true, true);

-- 2) Usuário B tenta listar veículos de A:
-- SELECT * FROM public.vehicles WHERE user_id = '<id-do-usuario-a>'::uuid;
-- Resultado esperado: 0 linhas, porque a policy usa user_id = auth.uid().

-- 3) Usuário B tenta listar turnos de A:
-- SELECT * FROM public.work_sessions WHERE user_id = '<id-do-usuario-a>'::uuid;
-- Resultado esperado: 0 linhas.

-- 4) Usuário B tenta listar ganhos de A:
-- SELECT * FROM public.earnings WHERE user_id = '<id-do-usuario-a>'::uuid;
-- Resultado esperado: 0 linhas.

-- 5) Usuário B tenta listar despesas de A:
-- SELECT * FROM public.expenses WHERE user_id = '<id-do-usuario-a>'::uuid;
-- Resultado esperado: 0 linhas.

-- 6) Usuário B tenta listar metas de A:
-- SELECT * FROM public.goals WHERE user_id = '<id-do-usuario-a>'::uuid;
-- Resultado esperado: 0 linhas.

-- 7) Teste de função de resumo do usuário autenticado:
-- SELECT * FROM public.get_financial_summary('2026-09-01'::date, '2026-09-30'::date);
-- Resultado esperado: apenas os valores do usuário logado.

-- 8) Teste de função de metas:
-- SELECT * FROM public.get_goal_progress('2026-09-23'::date);
-- Resultado esperado: apenas as metas do usuário logado.

-- 9) Teste de plataforma por usuário:
-- SELECT * FROM public.get_platform_performance('2026-09-01'::date, '2026-09-30'::date);
-- Resultado esperado: somente plataformas de ganhos do usuário autenticado.
