import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

const summary = [
  { label: "Receita bruta", value: "R$ 14.350", change: "+12%" },
  { label: "Média por turno", value: "R$ 510", change: "+8%" },
  { label: "Receita por km", value: "R$ 4,88", change: "+3%" },
];

const rows = [
  { date: "23/09", platform: "iFood", vehicle: "Moto 1", amount: "R$ 920,00" },
  { date: "22/09", platform: "Uber", vehicle: "Moto 2", amount: "R$ 740,50" },
  { date: "21/09", platform: "99", vehicle: "Carro", amount: "R$ 1.120,00" },
  { date: "20/09", platform: "Particular", vehicle: "Moto 1", amount: "R$ 530,00" },
];

export default function GanhosPage() {
  return (
    <AppShell title="Ganhos">
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
            4 registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Plataforma</th>
                <th className="px-6 py-3 font-medium">Veículo</th>
                <th className="px-6 py-3 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.date}-${row.platform}`} className="border-t border-slate-800 text-slate-200">
                  <td className="px-6 py-4">{row.date}</td>
                  <td className="px-6 py-4">{row.platform}</td>
                  <td className="px-6 py-4">{row.vehicle}</td>
                  <td className="px-6 py-4 font-medium text-brand-300">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
