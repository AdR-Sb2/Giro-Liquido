import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

const maintenance = [
  { title: "Troca de óleo", vehicle: "Moto 1", date: "20/09", value: "R$ 420" },
  { title: "Pneu traseiro", vehicle: "Carro", date: "15/09", value: "R$ 310" },
  { title: "Revisão geral", vehicle: "Moto 2", date: "08/09", value: "R$ 680" },
];

export default function ManutencoesPage() {
  return (
    <AppShell title="Manutenções">
      <div className="grid gap-4 md:grid-cols-3">
        {maintenance.map((item) => (
          <Card key={item.title} className="p-5">
            <p className="text-sm text-slate-400">{item.title}</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{item.vehicle}</h3>
            <p className="mt-2 text-sm text-slate-300">{item.date}</p>
            <p className="mt-4 text-xl font-semibold text-brand-300">{item.value}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
