import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ConfirmPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <Card className="w-full max-w-lg border-slate-800 bg-slate-900/80">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Confirmação</p>
          <h1 className="mt-2 text-3xl font-semibold">Sua conta está pronta</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300">
            Verifique seu e-mail para confirmar a conta e ativar o acesso ao painel.
          </p>
          <Button asChild>
            <Link href="/entrar">Ir para login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
