import Link from "next/link";
import {
  BarChart3,
  Gauge,
  LogOut,
  Settings,
  Target,
  Truck,
  Wallet,
  Clock3,
  ChartColumnBig,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menu = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/ganhos", label: "Ganhos", icon: Wallet },
  { href: "/despesas", label: "Despesas", icon: BarChart3 },
  { href: "/turnos", label: "Turnos", icon: Clock3 },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/veiculos", label: "Veículos", icon: Truck },
  { href: "/relatorios", label: "Relatórios", icon: ChartColumnBig },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 font-bold text-slate-950">
              G
            </div>
            <div>
              <p className="text-lg font-semibold">Giro Líquido</p>
              <p className="text-xs text-slate-400">Painel do motorista</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menu.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border-t border-slate-800 pt-6">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Dashboard</p>
                <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
              </div>
              <Button variant="secondary">+ Novo registro</Button>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
