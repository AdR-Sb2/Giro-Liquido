import Link from "next/link";

import { Button } from "@/components/ui/button";

const metrics = [
  { label: "Faturamento do mês", value: "R$ 12.480", change: "+18,4%" },
  { label: "Lucro líquido", value: "R$ 4.760", change: "+9,2%" },
  { label: "Horas trabalhadas", value: "286h", change: "+34h" },
  { label: "Km rodados", value: "2.940 km", change: "+11,1%" },
];

const features = [
  {
    title: "Controle por turno",
    description: "Registre jornadas, duração, veículo e faturamento em um único lugar.",
  },
  {
    title: "Despesas financeiras",
    description: "Acompanhe combustível, alimentação, manutenção e outros custos em BRL.",
  },
  {
    title: "Metas e evolução",
    description: "Defina objetivos mensais e acompanhe seu progresso em tempo real.",
  },
  {
    title: "Dashboard claro",
    description: "Veja lucro por hora, por km e desempenho por origem em poucos segundos.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 text-white sm:px-6 lg:px-8">
      <header className="sticky top-4 z-20 mb-8 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 font-bold text-slate-950">
            G
          </div>
          <span className="text-lg font-semibold">Giro Líquido</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#funcionalidades" className="hover:text-white">Funcionalidades</a>
          <a href="#indicadores" className="hover:text-white">Indicadores</a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/entrar">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/cadastro">Começar agora</Link>
          </Button>
        </div>
      </header>

      <section className="grid items-center gap-8 pb-16 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-7">
          <span className="inline-flex rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-brand-300">
            Controle financeiro para quem vive no volante
          </span>

          <div className="space-y-5">
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Veja o lucro real do seu dia, semana e mês.
            </h1>
            <p className="max-w-xl text-lg text-slate-300">
              O Giro Líquido ajuda entregadores, motoboys e profissionais autônomos a registrar
              ganhos, despesas, veículos e metas em um único painel claro e seguro.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/cadastro">Cadastrar grátis</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/dashboard">Ver demonstração</Link>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-5 text-sm text-slate-300">
            <li>• Sem planilha bagunçada</li>
            <li>• Valores em BRL</li>
            <li>• Dados isolados por usuário</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-glow">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-slate-300">Resumo financeiro</span>
            <span className="rounded-full bg-brand-500/10 px-2 py-1 text-xs font-medium text-brand-300">
              +18,4%
            </span>
          </div>

          <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/15 to-sky-500/10 p-4">
            <p className="text-sm text-slate-300">Lucro líquido</p>
            <p className="mt-2 text-3xl font-semibold text-white">R$ 4.760</p>
            <p className="mt-2 text-sm text-slate-300">Comparado ao mês anterior</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Receita</p>
              <p className="mt-2 text-xl font-semibold">R$ 12.480</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Despesas</p>
              <p className="mt-2 text-xl font-semibold">R$ 7.720</p>
            </div>
          </div>

          <div className="mt-5 flex h-28 items-end gap-2">
            {[38, 52, 68, 84, 100, 88, 72].map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-xl bg-gradient-to-t from-brand-500 to-sky-400"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="indicadores" className="grid gap-4 py-8 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
            <p className="mt-2 text-sm text-brand-300">{item.change}</p>
          </div>
        ))}
      </section>

      <section id="funcionalidades" className="py-16">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Tudo em um só lugar</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Para você trabalhar melhor e cobrar mais pelo seu tempo.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-lg text-brand-300">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="gratuito" className="py-10">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Acesso total</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Tudo gratuito para começar a controlar seu dinheiro melhor.
          </h2>
        </div>

        <div className="mx-auto max-w-2xl rounded-3xl border border-brand-500/30 bg-slate-900/80 p-8 text-center shadow-glow">
          <div className="mb-4 inline-flex items-center rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-300">
            Grátis para sempre
          </div>
          <h3 className="text-3xl font-semibold text-white">Giro Líquido</h3>
          <p className="mt-4 text-lg text-slate-300">
            Sem mensalidade, sem cobrança escondida e sem limite para começar a organizar seus ganhos,
            despesas e metas do dia a dia.
          </p>
          <ul className="mt-6 space-y-3 text-left text-slate-300">
            <li>• Veículos e turnos ilimitados</li>
            <li>• Ganhos e despesas por categoria</li>
            <li>• Metas e relatórios por período</li>
            <li>• Suporte direto com acesso completo</li>
          </ul>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/cadastro">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
