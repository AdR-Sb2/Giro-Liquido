import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-2xl">
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Onboarding</p>
            <h1 className="mt-2 text-3xl font-semibold">Vamos configurar seu espaço</h1>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">1. Perfil</p>
                <p className="mt-2 font-medium">Dados pessoais</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">2. Veículo</p>
                <p className="mt-2 font-medium">Moto ou carro</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">3. Meta</p>
                <p className="mt-2 font-medium">Objetivo inicial</p>
              </div>
            </div>

            <p className="text-slate-300">
              Em seguida, você poderá registrar ganhos, despesas, turnos e acompanhar seu
              lucro em tempo real.
            </p>

            <div className="flex gap-3">
              <Button asChild>
                <Link href="/dashboard">Continuar</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/">Voltar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
