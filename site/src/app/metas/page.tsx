import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

const goals = [
  { title: "Meta mensal", current: "R$ 5.200", target: "R$ 8.000", progress: 65 },
  { title: "Meta de quilometragem", current: "1.800 km", target: "2.500 km", progress: 72 },
  { title: "Meta de focos de lucro", current: "4/6", target: "6", progress: 67 },
];

export default function MetasPage() {
  return (
    <AppShell title="Metas">
      <div className="grid gap-4 md:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal.title} className="p-5">
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
