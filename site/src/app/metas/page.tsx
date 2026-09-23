import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { formatCurrency, getGoals } from "@/lib/supabase/queries";

export default async function MetasPage() {
  const goals = await getGoals();

  const mappedGoals = (goals.length > 0 ? goals : [{ id: "empty", name: "Nenhuma meta cadastrada", target_amount: 0, start_date: new Date().toISOString(), end_date: null, goal_type: "revenue", goal_period: "monthly" }]).map((goal) => ({
    id: goal.id,
    title: goal.name ?? "Meta sem nome",
    current: formatCurrency(Number(goal.target_amount ?? 0)),
    target: formatCurrency(Number(goal.target_amount ?? 0)),
    progress: 0,
  }));

  return (
    <AppShell title="Metas">
      <div className="grid gap-4 md:grid-cols-3">
        {mappedGoals.map((goal) => (
          <Card key={goal.id} className="p-5">
            <p className="text-sm text-slate-400">{goal.title}</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{goal.current}</h3>
            <p className="mt-2 text-sm text-slate-300">Meta: {goal.target}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${goal.progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-brand-300">{goal.progress}% concluído</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
