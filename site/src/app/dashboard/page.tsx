import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDistance, formatMinutes, getDashboardData, getPercentChange } from "@/lib/supabase/queries";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/entrar");
  }

  const { profile, summary, comparisonSummary, activeSession, vehicles, goals } = data;

  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const revenueComparison = getPercentChange(summary.total_revenue, comparisonSummary.total_revenue);
  const expensesComparison = getPercentChange(summary.total_expenses, comparisonSummary.total_expenses);
  const profitComparison = getPercentChange(summary.total_profit, comparisonSummary.total_profit);
  const hoursComparison = getPercentChange(summary.total_worked_minutes, comparisonSummary.total_worked_minutes);
  const distanceComparison = getPercentChange(summary.total_distance_km, comparisonSummary.total_distance_km);

  const sessionDurationMinutes = activeSession?.started_at
    ? Math.max(0, (Date.now() - new Date(activeSession.started_at).getTime()) / 60000)
    : 0;

  const metrics = [
    { label: "Faturamento", value: formatCurrency(summary.total_revenue), comparison: revenueComparison, tone: "positive" },
    { label: "Despesas", value: formatCurrency(summary.total_expenses), comparison: expensesComparison, tone: "negative" },
    { label: "Lucro líquido", value: formatCurrency(summary.total_profit), comparison: profitComparison, tone: "positive" },
    { label: "Horas", value: formatMinutes(summary.total_worked_minutes), comparison: hoursComparison, tone: "neutral" },
    { label: "Km rodados", value: formatDistance(summary.total_distance_km), comparison: distanceComparison, tone: "neutral" },
    { label: "R$/hora", value: summary.profit_per_hour ? formatCurrency(summary.profit_per_hour) : "Sem dados", comparison: null, tone: "neutral" },
    { label: "R$/km", value: summary.profit_per_km ? formatCurrency(summary.profit_per_km) : "Sem dados", comparison: null, tone: "neutral" },
  ];

  const goalProgress = goals[0];
  const goalTarget = Number(goalProgress?.target_amount ?? 0);
  const goalPercent = goalTarget > 0 ? Math.min(100, (summary.total_profit / goalTarget) * 100) : 0;

  return (
    <AppShell title="Dashboard">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Resumo do dia</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                {profile?.full_name ? `Olá, ${profile.full_name.split(" ")[0]} 👋` : "Olá 👋"}
              </h1>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
              {activeSession ? "Turno ativo" : "Turno não iniciado"}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-300 capitalize">{dateLabel}</p>
            {activeSession ? (
              <div className="flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-200">
                <span className="h-2 w-2 rounded-full bg-brand-400" />
                {formatMinutes(Math.round(sessionDurationMinutes))}
              </div>
            ) : (
              <span className="text-sm text-slate-400">Aguardando início do turno</span>
            )}
          </div>

          {activeSession ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-200">Turno em andamento</p>
                <p className="mt-1 text-base font-medium text-white">{formatMinutes(Math.round(sessionDurationMinutes))}</p>
              </div>
              <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto">
                Finalizar turno
              </Button>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-4 sm:p-5" title={
              metric.label === "Faturamento"
                ? "Soma dos ganhos registrados no período."
                : metric.label === "Despesas"
                  ? "Total de despesas registradas no período."
                  : metric.label === "Lucro líquido"
                    ? "Faturamento menos despesas registradas no período."
                    : metric.label === "Horas"
                      ? "Total de horas trabalhadas no período."
                      : metric.label === "Km rodados"
                        ? "Distância total registrada no período."
                        : metric.label === "R$/hora"
                          ? "Lucro líquido dividido pelas horas trabalhadas."
                          : "Lucro líquido dividido pelos quilômetros registrados."
            }>
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
                {metric.comparison !== null ? (
                  <span
                    className={[
                      "rounded-full px-2 py-1 text-[10px] font-medium",
                      metric.tone === "positive" ? "bg-brand-500/10 text-brand-300" : metric.tone === "negative" ? "bg-red-500/10 text-red-300" : "bg-slate-800 text-slate-300",
                    ].join(" ")}
                  >
                    {Number.isFinite(metric.comparison) ? `${metric.comparison >= 0 ? "+" : ""}${metric.comparison.toFixed(1)}%` : "Sem comparação"}
                  </span>
                ) : null}
              </div>

              <div className="mt-4">
                <h2 className="text-2xl font-semibold tracking-tight text-white">{metric.value}</h2>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-base font-medium text-white">Ações rápidas</h3>
            <span className="text-xs text-slate-400">Hoje</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="default" className="justify-center">
              <a href="/ganhos/novo">+ Ganho</a>
            </Button>
            <Button asChild variant="secondary" className="justify-center">
              <a href="/despesas/novo">+ Despesa</a>
            </Button>
            <Button asChild variant="secondary" className="justify-center">
              <a href="/turnos">{activeSession ? "Finalizar turno" : "Iniciar turno"}</a>
            </Button>
            <Button asChild variant="ghost" className="justify-center">
              <a href="/despesas/novo">Abastecimento</a>
            </Button>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-base font-medium text-white">Meta</h3>
            {goalProgress ? <span className="text-xs text-slate-400">{goalPercent.toFixed(0)}%</span> : null}
          </div>

          {goalProgress ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-sm text-slate-300">
                  <span>{goalProgress.name}</span>
                  <span>{formatCurrency(summary.total_profit)} / {formatCurrency(goalTarget)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${goalPercent}%` }} />
                </div>
              </div>
              <p className="text-sm text-slate-400">Falta {formatCurrency(Math.max(0, goalTarget - summary.total_profit))} para atingir a meta.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">Ainda não há uma meta cadastrada.</p>
              <Button asChild variant="secondary" className="w-full justify-center">
                <a href="/metas">+ Criar meta</a>
              </Button>
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-medium text-white">Veículos</h3>
            <span className="text-xs text-slate-400">{vehicles.length} ativos</span>
          </div>

          <div className="space-y-3">
            {vehicles.length > 0 ? (
              vehicles.slice(0, 3).map((vehicle) => (
                <div key={vehicle.id ?? vehicle.name} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2.5">
                  <span className="text-sm text-slate-300">{vehicle.name ?? "Veículo"}</span>
                  <span className="text-sm font-medium text-white">{vehicle.license_plate ?? "Sem placa"}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Nenhum veículo cadastrado.</p>
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <h3 className="mb-4 text-base font-medium text-white">Indicadores</h3>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-xl bg-slate-900/70 px-3 py-2">
              <span>Receita por hora</span>
              <strong className="text-brand-300">{summary.profit_per_hour ? formatCurrency(summary.profit_per_hour) : "Sem dados"}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-900/70 px-3 py-2">
              <span>Receita por km</span>
              <strong className="text-brand-300">{summary.profit_per_km ? formatCurrency(summary.profit_per_km) : "Sem dados"}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-900/70 px-3 py-2">
              <span>Registros</span>
              <strong>{(summary as any).earnings_count ?? 0} ganhos · {(summary as any).expenses_count ?? 0} despesas</strong>
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
