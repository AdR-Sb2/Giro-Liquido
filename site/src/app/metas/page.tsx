import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, getDashboardData, getGoals } from "@/lib/supabase/queries";

export default async function MetasPage() {
  const [dashboard, goals] = await Promise.all([getDashboardData(), getGoals()]);

  if (!goals.length) {
    return (
      <AppShell title="Metas">
        <Card className="p-6 text-center">
          <p className="text-xl font-semibold text-white">Ainda não há uma meta.</p>
          <p className="mt-2 text-sm text-slate-400">Defina uma meta e acompanhe seu progresso em poucos segundos.</p>
          <div className="mt-5 flex justify-center">
            <Button asChild>
              <Link href="/metas">+ Criar meta</Link>
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const summary = dashboard?.summary ?? {
    total_revenue: 0,
    total_profit: 0,
    total_worked_minutes: 0,
    total_distance_km: 0,
  };

  const mappedGoals = goals.map((goal) => {
    const target = Number(goal.target_amount ?? 0);
    const currentValue = goal.goal_type === "profit" ? Number(summary.total_profit ?? 0) : goal.goal_type === "revenue" ? Number(summary.total_revenue ?? 0) : Number(summary.total_profit ?? 0);
    const achieved = target > 0 ? Math.min(100, (currentValue / target) * 100) : 0;
    const remaining = Math.max(0, target - currentValue);
    const daysRemaining = goal.end_date ? Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - Date.now()) / 86400000)) : 0;
    const perDay = daysRemaining > 0 ? remaining / daysRemaining : 0;

    return {
      id: goal.id,
      title: goal.name ?? "Meta sem nome",
      current: currentValue,
      target,
      achieved,
      remaining,
      daysRemaining,
      perDay,
    };
  });

  return (
    <AppShell title="Metas">
      <div className="space-y-4">
        {mappedGoals.map((goal) => (
          <Card key={goal.id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Meta</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{goal.title}</h3>
              </div>
              <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-300">{goal.achieved.toFixed(0)}%</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Meta</span>
                <strong className="text-white">{formatCurrency(goal.target)}</strong>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Realizado</span>
                <strong className="text-brand-300">{formatCurrency(goal.current)}</strong>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Falta</span>
                <strong className="text-red-300">{formatCurrency(goal.remaining)}</strong>
              </div>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${goal.achieved}%` }} />
            </div>

            <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                <p className="text-slate-400">Dias restantes</p>
                <p className="mt-1 font-medium text-white">{goal.daysRemaining} dias</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                <p className="text-slate-400">Por dia</p>
                <p className="mt-1 font-medium text-white">{formatCurrency(goal.perDay)} </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
