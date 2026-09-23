import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, getRecentEarnings } from "@/lib/supabase/queries";

export default async function GanhosPage() {
  const rows = await getRecentEarnings();

  const summary = [
    { label: "Receita bruta", value: formatCurrency(rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0)), change: "+12%" },
    { label: "Participação", value: `${rows.length || 0} registros`, change: "+8%" },
    { label: "Último ganho", value: rows[0] ? formatCurrency(Number(rows[0].amount ?? 0)) : "R$ 0,00", change: "+3%" },
  ];

  return (
    <AppShell title="Ganhos">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/ganhos/novo">+ Novo ganho</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{item.value}</h2>
            <p className="mt-2 text-sm text-brand-300">{item.change} vs. semana anterior</p>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Últimos ganhos</h3>
          <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-300">
            {rows.length || 0} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Plataforma</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {(rows.length > 0 ? rows : [{ id: "empty", earned_at: new Date().toISOString(), description: "Nenhum ganho registrado", amount: 0, platforms: { name: "-" } }]).map((row) => {
                const platformName = Array.isArray(row.platforms)
                  ? row.platforms[0]?.name
                  : row.platforms?.name;

                return (
                  <tr key={row.id} className="border-t border-slate-800 text-slate-200">
                    <td className="px-6 py-4">{new Date(row.earned_at).toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-4">{platformName ?? "-"}</td>
                    <td className="px-6 py-4">{row.description ?? "Sem descrição"}</td>
                    <td className="px-6 py-4 font-medium text-brand-300">{formatCurrency(Number(row.amount ?? 0))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
