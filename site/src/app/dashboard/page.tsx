import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { createServerSupabase } from "@/lib/supabase/server";

const metrics = [
  { label: "Faturamento", value: "R$ 12.480", hint: "+18,4%" },
  { label: "Lucro líquido", value: "R$ 4.760", hint: "+8,2%" },
  { label: "Horas", value: "286h", hint: "+34h" },
  { label: "Km rodados", value: "2.940 km", hint: "+11,1%" },
];

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  return (
    <AppShell title="Resumo financeiro">
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
            <h3 className="text-lg font-medium">Desempenho por plataforma</h3>
            <span className="text-sm text-slate-400">Últimos 30 dias</span>
          </div>

          <div className="space-y-4">
            {[
              ["iFood", "R$ 5.480"],
              ["Uber", "R$ 3.120"],
              ["99", "R$ 1.940"],
              ["Particular", "R$ 1.940"],
            ].map(([name, value]) => (
              <div key={name} className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3">
                <span className="text-slate-300">{name}</span>
                <strong className="font-medium text-white">{value}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-lg font-medium">Meta do mês</h3>
          <div className="space-y-3">
            <div>
              <div className="mb-2 flex justify-between text-sm text-slate-300">
                <span>R$ 8.000</span>
                <span>65%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[65%] rounded-full bg-brand-500" />
              </div>
            </div>
            <p className="text-sm text-slate-400">Você está R$ 2.300 distante da meta atual.</p>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
