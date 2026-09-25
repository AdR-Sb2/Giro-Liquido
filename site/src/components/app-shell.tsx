"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ChevronRight,
  Clock3,
  Gauge,
  LogOut,
  Menu,
  Settings,
  Target,
  Truck,
  Wallet,
  X,
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

const quickActions = [
  { href: "/ganhos/novo", label: "Novo ganho" },
  { href: "/despesas/novo", label: "Nova despesa" },
  { href: "/veiculos/novo", label: "Novo veículo" },
];

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (href: string) => {
    if (pathname === href) {
      return true;
    }

    return pathname.startsWith(`${href}/`);
  };

  const closeMenus = () => {
    setQuickMenuOpen(false);
    setMobileNavOpen(false);
  };

  const navItems = (
    <nav className="space-y-2">
      {menu.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={closeMenus}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
            isActive(href) ? "bg-brand-500/10 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closeMenus}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 pb-24 lg:px-8 lg:pb-6">
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

          {navItems}

          <div className="mt-8 border-t border-slate-800 pt-6">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </aside>

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-xs flex-col border-r border-slate-800 bg-slate-900/95 p-5 shadow-2xl transition-transform duration-200 lg:hidden",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 font-bold text-slate-950">
                G
              </div>
              <div>
                <p className="text-base font-semibold">Giro Líquido</p>
                <p className="text-[11px] text-slate-400">Painel do motorista</p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Fechar menu"
              onClick={closeMenus}
              className="rounded-full border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {navItems}

          <div className="mt-auto border-t border-slate-800 pt-5">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </aside>

        <main className="flex-1 space-y-6 pb-20 lg:pb-0">
          <header className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Abrir menu"
                  onClick={() => setMobileNavOpen(true)}
                  className="rounded-full border border-slate-700 bg-slate-800 p-2.5 text-slate-200 transition hover:bg-slate-700 lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </button>

                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Dashboard</p>
                  <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
                </div>
              </div>

              <div className="relative">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setQuickMenuOpen((current) => !current)}
                  className="whitespace-nowrap"
                >
                  + Novo registro
                </Button>

                {quickMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Fechar opções de registro"
                      onClick={() => setQuickMenuOpen(false)}
                      className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
                    />

                    <div className="fixed inset-x-4 bottom-4 z-50 rounded-3xl border border-slate-700 bg-slate-900 p-3 shadow-2xl lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-2 lg:w-56 lg:rounded-2xl lg:p-2">
                      <div className="mb-2 flex items-center justify-between px-2 pt-1 text-xs uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        <span>Registro</span>
                        <button type="button" aria-label="Fechar" onClick={() => setQuickMenuOpen(false)}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {quickActions.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setQuickMenuOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-slate-100 transition hover:bg-slate-800 hover:text-white lg:py-2.5"
                        >
                          {label}
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 px-2 py-2 backdrop-blur-sm lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {menu.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={closeMenus}
              className={cn(
                "flex min-w-[84px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] transition",
                isActive(href)
                  ? "bg-brand-500/10 text-brand-300"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
