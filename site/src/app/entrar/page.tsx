import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function EntrarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 font-bold text-slate-950">
                R
              </div>
              <div>
                <p className="text-lg font-semibold">RotaX</p>
                <p className="text-sm text-slate-400">Acesse sua conta</p>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Bem-vindo de volta</h1>
            </div>
          </CardHeader>

          <CardContent>
            <AuthForm variant="login" />

            <div className="mt-5 text-center text-sm text-slate-400">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-medium text-brand-300 hover:text-brand-200">
                Criar conta
              </Link>
            </div>

            <div className="mt-4">
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/">Voltar ao início</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
