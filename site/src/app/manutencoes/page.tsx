import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { formatCurrency, getMaintenanceRecords } from "@/lib/supabase/queries";

export default async function ManutencoesPage() {
  const maintenance = await getMaintenanceRecords(8);

  const total = maintenance.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

  return (
    <AppShell title="Manutenções">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-400">Últimas manutenções</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{maintenance.length}</h2>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-400">Gasto total</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{formatCurrency(total)}</h2>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-400">Próximo ciclo</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">A definir</h2>
        </Card>
      </div>

      {maintenance.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-xl font-semibold text-white">Nenhuma manutenção registrada.</p>
          <p className="mt-2 text-sm text-slate-400">Registre cada revisão para controlar os custos e o estado do veículo.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-800 px-4 py-4 sm:px-6">
            <h3 className="text-lg font-semibold text-white">Histórico</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-6">Tipo</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Veículo</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Data</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Valor</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map((item) => (
                  <tr key={item.id} className="border-t border-slate-800 text-slate-200">
                    <td className="px-4 py-4 sm:px-6">{item.category}</td>
                    <td className="px-4 py-4 sm:px-6">{(item as any).vehicles?.name ?? "Veículo"}</td>
                    <td className="px-4 py-4 sm:px-6">{new Date(item.maintenance_date).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-4 sm:px-6 font-medium text-brand-300">{formatCurrency(Number(item.amount ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
