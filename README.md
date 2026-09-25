# RotaX

Backend Supabase para o SaaS de controle financeiro de entregadores e profissionais autônomos.

## Estrutura do projeto

- [supabase/migrations](supabase/migrations): migrações SQL organizadas em ordem de execução.
- [supabase/tests/rls_access_checks.sql](supabase/tests/rls_access_checks.sql): exemplos de verificação de isolamento por usuário.

## Projeto Supabase

Use os valores do projeto informado para o ambiente do frontend:

- URL: `https://vnqjmqnkwtjmhuvixghg.supabase.co`
- Chave pública: `sb_publishable_EKJCByrq7sv6u2Ro-gwDHg_GqlD39Ka`

> Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend. O frontend deve consumir apenas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Variáveis de ambiente

Crie um arquivo `.env.local` com:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vnqjmqnkwtjmhuvixghg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_EKJCByrq7sv6u2Ro-gwDHg_GqlD39Ka
```

## Ordem de migração

1. `001_enums_and_extensions.sql`
2. `002_profiles_vehicles_platforms.sql`
3. `003_work_sessions_earnings_expenses.sql`
4. `004_goals_maintenance_records.sql`
5. `005_functions_triggers_views_rls.sql`
6. `006_seed_platforms.sql`

## Cenário coberto

O banco foi modelado para suportar:

- perfil do usuário e onboarding
- veículos por usuário
- turnos de trabalho
- ganhos e despesas
- metas financeiras
- manutenção de veículos
- relatórios por período e por plataforma
- políticas RLS isolando dados por usuário
- valores monetários em `numeric` e horários em `timestamptz`

## Como aplicar no Supabase

Com o Supabase CLI instalado, execute:

```bash
npx supabase link --project-ref vnqjmqnkwtjmhuvixghg
npx supabase db push
```

Se preferir, aplique as migrações diretamente no SQL Editor do Supabase na ordem acima.

## Observação importante

Neste ambiente local, a execução remota do SQL no projeto Supabase não foi possível porque o CLI do Supabase não está instalado e não foram fornecidos credenciais de administração para autenticação no projeto. Os arquivos SQL e a configuração de ambiente foram preparados para o uso no projeto real.

## Exemplo de chamada RPC

```ts
const { data, error } = await supabase.rpc('get_financial_summary', {
  p_start_date: '2026-09-01',
  p_end_date: '2026-09-30'
});
```
