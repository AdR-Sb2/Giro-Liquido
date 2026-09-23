import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { formatCurrency, getDashboardData } from "@/lib/supabase/queries";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/entrar");
  }

  const { profile, summary, vehicles, goals } = data;

  const metrics = [
    { label: "Faturamento", value: formatCurrency(summary.total_revenue), hint: "+18,4%" },
    { label: "Lucro líquido", value: formatCurrency(summary.total_profit), hint: "+8,2%" },
    { label: "Horas", value: `${Math.round(summary.total_worked_minutes / 60)}h`, hint: "+34h" },
    { label: "Km rodados", value: `${summary.total_distance_km.toFixed(0)} km`, hint: "+11,1%" },
  ];

  const goalProgress = goals[0];

  return (
    <AppShell title={profile?.full_name ? `Olá, ${profile.full_name.split(" ")[0]}` : "Resumo financeiro"}>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-5">
            <p className="text-sm text-slate-400">{metric.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <h2 className="text-2xl font-semibold text-white">{metric.value}</h2>
              <span className="rounded-full bg-brand-500/15 px-2 py-1 text-xs font-medium text-brand-300">
                {metric.hint}
              </span>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Veículos ativos</h3>
            <span className="text-sm text-slate-400">{vehicles.length} cadastros</span>
          </div>

          <div className="space-y-4">
            {(vehicles.length > 0 ? vehicles : [{ name: "Nenhum veículo", model: "Cadastre seu primeiro veículo" }]).map((vehicle) => (
              <div key={vehicle.id ?? vehicle.name} className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3">
                <span className="text-slate-300">{vehicle.name}</span>
                <strong className="font-medium text-white">{vehicle.model ?? "Ativo"}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-lg font-medium">Meta do mês</h3>
          <div className="space-y-3">
            {goalProgress ? (
              <>
                <div>
                  <div className="mb-2 flex justify-between text-sm text-slate-300">
                    <span>{goalProgress.name}</span>
                    <span>{Math.min(100, Math.round((Number(goalProgress.target_amount || 0) > 0 ? Number(summary.total_profit) / Number(goalProgress.target_amount) : 0) * 100))}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{
                        width: `${Math.min(100, Math.round((Number(goalProgress.target_amount || 0) > 0 ? Number(summary.total_profit) / Number(goalProgress.target_amount) : 0) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  {goalProgress.target_amount ? `Meta: ${formatCurrency(Number(goalProgress.target_amount))}` : "Meta ainda não cadastrada"}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-400">Ainda não há meta ativa cadastrada.</p>
            )}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
