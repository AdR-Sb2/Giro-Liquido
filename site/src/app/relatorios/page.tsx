import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDistance, formatMinutes, getDashboardData } from "@/lib/supabase/queries";

export default async function RelatoriosPage() {
  const data = await getDashboardData();

  const summary = data?.summary ?? {
    total_revenue: 0,
    total_expenses: 0,
    total_profit: 0,
    total_worked_minutes: 0,
    total_distance_km: 0,
    profit_per_hour: null,
    profit_per_km: null,
  };

  const metrics = [
    { label: "Receita total", value: formatCurrency(Number(summary.total_revenue ?? 0)), tone: "text-brand-300" },
    { label: "Despesas", value: formatCurrency(Number(summary.total_expenses ?? 0)), tone: "text-red-300" },
    { label: "Lucro líquido", value: formatCurrency(Number(summary.total_profit ?? 0)), tone: "text-emerald-300" },
    { label: "Horas trabalhadas", value: formatMinutes(Number(summary.total_worked_minutes ?? 0)), tone: "text-slate-200" },
  ];

  return (
    <AppShell title="Relatórios">
      <div className="flex flex-wrap gap-2">
        {[
          "Hoje",
          "Semana",
          "Mês",
        ].map((period) => (
          <button
            key={period}
            type="button"
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300"
          >
            {period}
          </button>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-5">
            <p className="text-sm text-slate-400">{metric.label}</p>
            <h2 className={`mt-3 text-2xl font-semibold ${metric.tone}`}>{metric.value}</h2>
          </Card>
        ))}
      </section>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">Resumo do período</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-400">Receita</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(Number(summary.total_revenue ?? 0))}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-400">Despesas</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(Number(summary.total_expenses ?? 0))}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-400">Distância</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatDistance(Number(summary.total_distance_km ?? 0))}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-400">Lucro por hora</p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.profit_per_hour ? formatCurrency(Number(summary.profit_per_hour)) : "R$ 0,00"}</p>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
