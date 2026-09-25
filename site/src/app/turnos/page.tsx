import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDistance, formatMinutes, getDashboardData, getWorkSessions } from "@/lib/supabase/queries";

export default async function TurnosPage() {
  const [dashboard, sessions] = await Promise.all([getDashboardData(), getWorkSessions(8)]);

  const activeSession = sessions.find((session) => !session.ended_at) ?? null;
  const totalMinutes = sessions.reduce((sum, session) => sum + Number(session.duration_minutes ?? 0), 0);
  const totalDistance = sessions.reduce((sum, session) => sum + Number(session.distance_km ?? 0), 0);

  const summary = [
    { label: "Turnos ativos", value: activeSession ? "1" : "0" },
    { label: "Horas no mês", value: formatMinutes(totalMinutes) },
    { label: "Distância total", value: formatDistance(totalDistance) },
  ];

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

      {activeSession ? (
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Turno ativo</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{formatMinutes(Math.max(0, (Date.now() - new Date(activeSession.started_at).getTime()) / 60000))}</h3>
            </div>
            <Button asChild variant="secondary">
              <Link href="/dashboard">Finalizar turno</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Turno não iniciado</h3>
            </div>
            <Button asChild>
              <Link href="/dashboard">Iniciar turno</Link>
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 sm:px-6">
          <h3 className="text-lg font-semibold text-white">Últimos turnos</h3>
          <span className="text-xs text-slate-400">{sessions.length} registros</span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-base font-medium text-white">Nenhum turno registrado.</p>
            <p className="mt-2 text-sm text-slate-400">Inicie sua jornada para começar a acompanhar horas e distância.</p>
            <div className="mt-4 flex justify-center">
              <Button asChild>
                <Link href="/dashboard">+ Iniciar turno</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-6">Data</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Duração</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Distância</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-t border-slate-800 text-slate-200">
                    <td className="px-4 py-4 sm:px-6">{new Date(session.started_at).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-4 sm:px-6">{formatMinutes(Number(session.duration_minutes ?? 0))}</td>
                    <td className="px-4 py-4 sm:px-6">{formatDistance(Number(session.distance_km ?? 0))}</td>
                    <td className="px-4 py-4 sm:px-6">
                      <span className={session.ended_at ? "text-brand-300" : "text-yellow-300"}>{session.ended_at ? "Concluído" : "Ativo"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
