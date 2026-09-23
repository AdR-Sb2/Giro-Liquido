import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

export default function ConfiguracoesPage() {
  return (
    <AppShell title="Configurações">
      <Card className="p-6">
        <p className="text-slate-300">Configurações da conta em desenvolvimento.</p>
      </Card>
    </AppShell>
  );
}
