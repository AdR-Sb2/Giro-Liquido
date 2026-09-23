import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, getRecentExpenses } from "@/lib/supabase/queries";

export default async function DespesasPage() {
  const rows = await getRecentExpenses();

  const total = rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  const summary = [
    { label: "Despesas totais", value: formatCurrency(total), change: "-6%" },
    { label: "Combustível", value: formatCurrency(rows.filter((row) => row.category === "fuel").reduce((sum, item) => sum + Number(item.amount ?? 0), 0)), change: "-2%" },
    { label: "Manutenção", value: formatCurrency(rows.filter((row) => row.category === "maintenance").reduce((sum, item) => sum + Number(item.amount ?? 0), 0)), change: "+12%" },
  ];

  return (
    <AppShell title="Despesas">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/despesas/novo">+ Nova despesa</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{item.value}</h2>
            <p className="mt-2 text-sm text-red-300">{item.change} vs. mês anterior</p>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Despesas recentes</h3>
          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300">
            {rows.length || 0} lançamentos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Categoria</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {(rows.length > 0 ? rows : [{ id: "empty", expense_at: new Date().toISOString(), category: "other", description: "Nenhuma despesa registrada", amount: 0 }]).map((row) => (
                <tr key={row.id} className="border-t border-slate-800 text-slate-200">
                  <td className="px-6 py-4">{new Date(row.expense_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-6 py-4">{row.category ?? "other"}</td>
                  <td className="px-6 py-4">{row.description ?? "Sem descrição"}</td>
                  <td className="px-6 py-4 font-medium text-red-300">-{formatCurrency(Number(row.amount ?? 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
