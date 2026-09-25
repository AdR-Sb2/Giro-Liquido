import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getVehicles } from "@/lib/supabase/queries";

export default async function VeiculosPage() {
  const vehicles = await getVehicles();

  return (
    <AppShell title="Veículos">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/veiculos/novo">+ Novo veículo</Link>
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-xl font-semibold text-white">Nenhum veículo cadastrado.</p>
          <p className="mt-2 text-sm text-slate-400">Cadastre seu primeiro veículo para acompanhar manutenção, custo e uso.</p>
          <div className="mt-5 flex justify-center">
            <Button asChild>
              <Link href="/veiculos/novo">Cadastrar veículo</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">{vehicle.name}</h3>
                <span className="rounded-full bg-brand-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-brand-300">
                  {vehicle.is_default ? "Padrão" : vehicle.is_active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-400">{vehicle.model ?? "Veículo sem modelo"}</p>
              <div className="mt-4 grid gap-2 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Tipo</span>
                  <strong className="text-white">{vehicle.vehicle_type ?? "Cadastro"}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Placa</span>
                  <strong className="text-white">{vehicle.license_plate ?? "—"}</strong>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
