import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

const settings = [
  { label: "Perfil", value: "Dados pessoais e contato" },
  { label: "Segurança", value: "2FA e recuperação de senha" },
  { label: "Notificações", value: "E-mails e lembretes" },
  { label: "Moeda", value: "BRL - Real Brasileiro" },
];

export default function ConfiguracoesPage() {
  return (
    <AppShell title="Configurações">
      <div className="grid gap-4 md:grid-cols-2">
        {settings.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{item.value}</h3>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
