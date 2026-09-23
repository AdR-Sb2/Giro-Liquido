import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

const summary = [
  { label: "Turnos ativos", value: "0" },
  { label: "Horas no mês", value: "0h" },
  { label: "Distância total", value: "0 km" },
];

const rows: Array<{ day: string; hours: string; platform: string; revenue: string }> = [];

export default function TurnosPage() {
  return (
    <AppShell title="Turnos">
      <section className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{item.value}</h2>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Últimos turnos</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Dia</th>
                <th className="px-6 py-3 font-medium">Horas</th>
                <th className="px-6 py-3 font-medium">Plataforma</th>
                <th className="px-6 py-3 font-medium">Receita</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr className="border-t border-slate-800 text-slate-300">
                  <td colSpan={4} className="px-6 py-8 text-center">
                    Nenhum turno registrado ainda.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.day}-${row.platform}`} className="border-t border-slate-800 text-slate-200">
                    <td className="px-6 py-4">{row.day}</td>
                    <td className="px-6 py-4">{row.hours}</td>
                    <td className="px-6 py-4">{row.platform}</td>
                    <td className="px-6 py-4 font-medium text-brand-300">{row.revenue}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
