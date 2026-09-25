import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, getRecentEarnings } from "@/lib/supabase/queries";

export default async function GanhosPage() {
  const rows = await getRecentEarnings();
  const total = rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const avgValue = rows.length ? total / rows.length : 0;
  const lastValue = rows[0] ? Number(rows[0].amount ?? 0) : 0;

  const summary = [
    { label: "Receita bruta", value: formatCurrency(total), tone: "text-brand-300" },
    { label: "Média por registro", value: formatCurrency(avgValue), tone: "text-slate-200" },
    { label: "Último ganho", value: formatCurrency(lastValue), tone: "text-emerald-300" },
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
            <h2 className={`mt-3 text-2xl font-semibold ${item.tone}`}>{item.value}</h2>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 sm:px-6">
          <h3 className="text-lg font-semibold text-white">Últimos ganhos</h3>
          <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-300">
            {rows.length || 0} registros
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-base font-medium text-white">Nenhum ganho registrado.</p>
            <p className="mt-2 text-sm text-slate-400">Comece lançando a primeira receita do dia para manter o dashboard atualizado.</p>
            <div className="mt-4 flex justify-center">
              <Button asChild>
                <Link href="/ganhos/novo">+ Registrar ganho</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-6">Data</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Plataforma</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Descrição</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Valor</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const platformRecord = (row as any)?.platforms;
                  const platformName = Array.isArray(platformRecord)
                    ? platformRecord[0]?.name ?? "-"
                    : platformRecord?.name ?? "-";

                  return (
                    <tr key={row.id} className="border-t border-slate-800 text-slate-200">
                      <td className="px-4 py-4 sm:px-6">{new Date(row.earned_at).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-4 sm:px-6">{platformName}</td>
                      <td className="px-4 py-4 sm:px-6">{row.description ?? "Sem descrição"}</td>
                      <td className="px-4 py-4 sm:px-6 font-medium text-brand-300">{formatCurrency(Number(row.amount ?? 0))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
