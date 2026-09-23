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

      <div className="grid gap-4 md:grid-cols-3">
        {(vehicles.length > 0 ? vehicles : [{ id: "empty", name: "Nenhum veículo", model: "Cadastre o seu primeiro veículo", is_default: false, is_active: true }]).map((vehicle) => (
          <Card key={vehicle.id ?? vehicle.name} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{vehicle.name}</h3>
              <span className="rounded-full bg-brand-500/10 px-2 py-1 text-xs font-medium text-brand-300">
                {vehicle.is_default ? "Padrão" : vehicle.is_active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-400">{vehicle.model ?? "Veículo sem modelo"}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{vehicle.vehicle_type ?? "Cadastro"}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
