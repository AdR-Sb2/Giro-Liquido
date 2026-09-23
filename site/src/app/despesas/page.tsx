import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

const summary = [
  { label: "Despesas totais", value: "R$ 7.720", change: "-6%" },
  { label: "Combustível", value: "R$ 2.860", change: "-2%" },
  { label: "Manutenção", value: "R$ 1.420", change: "+12%" },
];

const rows = [
  { date: "23/09", category: "Combustível", desc: "Posto Nobre", amount: "R$ 180,00" },
  { date: "22/09", category: "Alimentação", desc: "Refeição no trânsito", amount: "R$ 64,90" },
  { date: "21/09", category: "Manutenção", desc: "Troca de óleo", amount: "R$ 420,00" },
  { date: "20/09", category: "Outros", desc: "Celular + internet", amount: "R$ 110,00" },
];

export default function DespesasPage() {
  return (
    <AppShell title="Despesas">
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
            4 lançamentos
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
              {rows.map((row) => (
                <tr key={`${row.date}-${row.category}`} className="border-t border-slate-800 text-slate-200">
                  <td className="px-6 py-4">{row.date}</td>
                  <td className="px-6 py-4">{row.category}</td>
                  <td className="px-6 py-4">{row.desc}</td>
                  <td className="px-6 py-4 font-medium text-red-300">-{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
