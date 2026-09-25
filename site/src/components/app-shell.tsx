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
  MoreHorizontal,
  Plus,
  Settings,
  Target,
  Truck,
  Wallet,
  X,
  ChartColumnBig,
  House,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const desktopMenu = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/ganhos", label: "Ganhos", icon: Wallet },
  { href: "/despesas", label: "Despesas", icon: BarChart3 },
  { href: "/turnos", label: "Turnos", icon: Clock3 },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/veiculos", label: "Veículos", icon: Truck },
  { href: "/relatorios", label: "Relatórios", icon: ChartColumnBig },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const moreMenu = [
  { href: "/despesas", label: "Despesas", icon: BarChart3 },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/veiculos", label: "Veículos", icon: Truck },
  { href: "/relatorios", label: "Relatórios", icon: ChartColumnBig },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const quickActions = [
  { href: "/ganhos/novo", label: "+ Ganho" },
  { href: "/despesas/novo", label: "+ Despesa" },
  { href: "/turnos", label: "Iniciar turno" },
  { href: "/despesas/novo", label: "Abastecimento" },
];

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (pathname === href) {
      return true;
    }

    return pathname.startsWith(`${href}/`);
  };

  const closeMenus = () => {
    setQuickMenuOpen(false);
    setMobileNavOpen(false);
    setMoreMenuOpen(false);
  };

  const navItems = (
    <nav className="space-y-2">
      {desktopMenu.map(({ href, label, icon: Icon }) => (
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

      {moreMenuOpen && (
        <button
          type="button"
          aria-label="Fechar mais opções"
          onClick={closeMenus}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 pb-24 lg:px-8 lg:pb-6">
        <aside className="hidden w-72 shrink-0 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 font-bold text-slate-950">G</div>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 font-bold text-slate-950">G</div>
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

        <main className="flex-1 space-y-6 pb-24 lg:pb-0">
          <header className="sticky top-0 z-20 rounded-2xl border border-slate-800/90 bg-slate-900/80 px-4 py-3 shadow-[0_10px_30px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:px-5">
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
                  <p className="text-[10px] uppercase tracking-[0.25em] text-brand-300">Giro Líquido</p>
                  <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{title}</h1>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <Button type="button" variant="secondary" onClick={() => setQuickMenuOpen((current) => !current)} className="whitespace-nowrap">
                  + Novo registro
                </Button>

                {quickMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Fechar opções de registro"
                      onClick={() => setQuickMenuOpen(false)}
                      className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
                    />

                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
                      {quickActions.map(({ href, label }) => (
                        <Link
                          key={href + label}
                          href={href}
                          onClick={() => setQuickMenuOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-100 transition hover:bg-slate-800 hover:text-white"
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

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800/80 bg-slate-950/95 px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-10px_25px_rgba(2,6,23,0.5)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-center gap-2">
          <Link href="/dashboard" onClick={closeMenus} className={cn("flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] transition", isActive("/dashboard") ? "bg-brand-500/10 text-brand-300" : "text-slate-300") }>
            <House className="h-4 w-4" />
            Início
          </Link>
          <Link href="/ganhos" onClick={closeMenus} className={cn("flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] transition", isActive("/ganhos") ? "bg-brand-500/10 text-brand-300" : "text-slate-300") }>
            <Wallet className="h-4 w-4" />
            Ganhos
          </Link>
          <button type="button" onClick={() => setQuickMenuOpen((current) => !current)} className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-xl font-semibold text-slate-950 shadow-lg shadow-brand-500/30 transition hover:scale-[1.02]">
            <Plus className="h-5 w-5" />
          </button>
          <Link href="/turnos" onClick={closeMenus} className={cn("flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] transition", isActive("/turnos") ? "bg-brand-500/10 text-brand-300" : "text-slate-300") }>
            <Clock3 className="h-4 w-4" />
            Turnos
          </Link>
          <button type="button" onClick={() => setMoreMenuOpen((current) => !current)} className={cn("flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] transition", moreMenuOpen ? "bg-brand-500/10 text-brand-300" : "text-slate-300") }>
            <MoreHorizontal className="h-4 w-4" />
            Mais
          </button>
        </div>
      </nav>

      {quickMenuOpen && (
        <div className="fixed inset-x-4 bottom-20 z-50 rounded-3xl border border-slate-700 bg-slate-900 p-3 shadow-2xl lg:hidden">
          <div className="mb-2 flex items-center justify-between px-1 text-xs uppercase tracking-[0.18em] text-slate-400">
            <span>Registro rápido</span>
            <button type="button" aria-label="Fechar" onClick={() => setQuickMenuOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          {quickActions.map(({ href, label }) => (
            <Link
              key={href + label}
              href={href}
              onClick={() => setQuickMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-slate-100 transition hover:bg-slate-800 hover:text-white"
            >
              {label}
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </Link>
          ))}
        </div>
      )}

      {moreMenuOpen && (
        <div className="fixed inset-x-4 bottom-20 z-50 rounded-3xl border border-slate-700 bg-slate-900 p-3 shadow-2xl lg:hidden">
          <div className="mb-2 flex items-center justify-between px-1 text-xs uppercase tracking-[0.18em] text-slate-400">
            <span>Mais</span>
            <button type="button" aria-label="Fechar" onClick={() => setMoreMenuOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          {moreMenu.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={closeMenus}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-3 text-sm text-slate-100 transition hover:bg-slate-800 hover:text-white",
                isActive(href) ? "bg-brand-500/10 text-white" : "text-slate-300",
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
