import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

export default function VeiculosPage() {
  return (
    <AppShell title="Veículos">
      <Card className="p-6">
        <p className="text-slate-300">Gestão de veículos em desenvolvimento.</p>
      </Card>
    </AppShell>
  );
}
