import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { formatCurrency, getDashboardData } from "@/lib/supabase/queries";

export default async function RelatoriosPage() {
  const data = await getDashboardData();

  const metrics = data
    ? [
        { label: "Receita líquida", value: formatCurrency(Number(data.summary.total_profit ?? 0)) },
        { label: "Lucro por hora", value: formatCurrency(Number(data.summary.total_worked_minutes > 0 ? data.summary.total_profit / (data.summary.total_worked_minutes / 60) : 0)) },
        { label: "Lucro por km", value: formatCurrency(Number(data.summary.total_distance_km > 0 ? data.summary.total_profit / data.summary.total_distance_km : 0)) },
      ]
    : [
        { label: "Receita líquida", value: "R$ 0,00" },
        { label: "Lucro por hora", value: "R$ 0,00" },
        { label: "Lucro por km", value: "R$ 0,00" },
      ];

  return (
    <AppShell title="Relatórios">
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-5">
            <p className="text-sm text-slate-400">{metric.label}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{metric.value}</h2>
          </Card>
        ))}
      </section>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">Resumo do período</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-400">Receita</p>
            <p className="mt-2 text-3xl font-semibold text-white">{data ? formatCurrency(Number(data.summary.total_revenue ?? 0)) : "R$ 0,00"}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-400">Despesas</p>
            <p className="mt-2 text-3xl font-semibold text-white">{data ? formatCurrency(Number(data.summary.total_expenses ?? 0)) : "R$ 0,00"}</p>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
