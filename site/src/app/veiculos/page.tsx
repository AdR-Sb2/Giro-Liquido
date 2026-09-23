import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

const vehicles = [
  { name: "Moto 1", model: "Honda CG 160", km: "18.640 km", status: "Ativa" },
  { name: "Moto 2", model: "Yamaha NMAX", km: "12.340 km", status: "Em uso" },
  { name: "Carro", model: "VW Gol", km: "46.980 km", status: "Ativa" },
];

export default function VeiculosPage() {
  return (
    <AppShell title="Veículos">
      <div className="grid gap-4 md:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.name} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{vehicle.name}</h3>
              <span className="rounded-full bg-brand-500/10 px-2 py-1 text-xs font-medium text-brand-300">
                {vehicle.status}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-400">{vehicle.model}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{vehicle.km}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
