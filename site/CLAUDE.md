@AGENTS.md

# RotaX — contexto para agentes

SaaS de controle financeiro para entregadores e profissionais autônomos.
Monorepo: `site/` (Next.js App Router + Tailwind) + `supabase/migrations/` (schema e RLS).

## Comandos

Rodar sempre dentro de `site/`:

```bash
npx tsc --noEmit     # tipos
npm run lint         # hoje ainda falha com 8 erros preexistentes, nenhum nos arquivos tocados
npm run build        # precisa passar
```

## Regras do projeto

- Mudanças de banco são **aditivas**: nada de `DROP`, `ALTER` destrutivo ou mudança em RLS
  existente. Toda coluna nova precisa ser `nullable` ou ter `DEFAULT`, para não quebrar
  usuários que já concluíram o onboarding.
- Ao gravar uma coluna nova, o padrão é payload estendido + fallback para o payload antigo
  (`writeVehicle`/`writeGoal` no onboarding e `loadProfile` em `queries.ts`). Manter isso.
- `public.platforms` é catálogo do sistema com RLS somente leitura. Preferências do usuário
  (plataformas, categorias, tipos de trabalho, prioridades) vão em `profiles`, não em `platforms`.
- Dinheiro em `numeric`, datas em `date`, horários em `timestamptz`.
- Onboarding mantém rascunho em `localStorage` (`rotax_onboarding_v1`) e salva no Supabase a
  cada avanço de etapa.
- Ao criar um `enum` novo ou estender um existente, o valor só pode ser usado numa migration
  seguinte: por isso `008` (enum) e `009` (função) são separadas.

## Onboarding (8 etapas)

`site/src/app/onboarding/page.tsx`

Perfil → Como você ganha dinheiro? → Veículo → Fontes de renda → Despesas → O que acompanhar? → Meta → Resumo.

- Fluxo com `?editar=1` reabre o onboarding para quem já concluiu (permitido no `middleware.ts`).
- Barras de progresso e o banner do dashboard usam `getProfileCompletion` (`src/lib/profile-completion.ts`),
  que pontua 14 itens em 7 seções. Não recalcular isso em outro lugar.
- Inconsistências entre etapas são mostradas com `NoticeCard` (aviso, nunca bloqueio).
- "Pular por enquanto" só existe nas etapas opcionais e não apaga o rascunho.

## Funções de apoio

- `src/lib/profile-completion.ts` — percentual de configuração do perfil, compartilhado entre
  onboarding e dashboard.
- `src/lib/tracking.ts` — prioridades do usuário e o mapeamento `metricId` usado para ordenar os
  cards do dashboard.
- `src/lib/goals/options.ts` — tipos de meta (`revenue`, `profit`, `hours`, `distance`, `later`),
  unidades e formatação. `target_amount` guarda horas ou km quando o tipo não é financeiro.
- `src/lib/vehicles/options.ts` — marcas, anos, combustível, posse e periodicidade de aluguel.

## Banco

RPCs relevantes: `get_financial_summary`, `get_goal_progress`.
`get_goal_progress` cobre `revenue`, `profit`, `hours` e `distance`; `savings` ainda retorna
`progress_note` indicando cálculo pendente.

Ordem de migrations está no `README.md` da raiz — nunca pule etapa.
