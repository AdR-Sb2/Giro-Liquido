"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Bike,
  BriefcaseBusiness,
  CarFront,
  Check,
  CircleDollarSign,
  Footprints,
  Sparkles,
  Target,
  Truck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const STORAGE_KEY = "giro_liquido_onboarding_v1";

const workTypeSchema = z.object({
  workType: z.enum([
    "delivery",
    "ride_hailing",
    "logistics",
    "private_client",
    "other",
  ]),
});

type WorkType = z.infer<typeof workTypeSchema>["workType"];
type VehicleType = "moto" | "carro" | "bicicleta" | "pedestre" | "nao_quero";

type OnboardingDraft = {
  currentStep: number;
  workType?: WorkType;
  vehicleType?: VehicleType;
  vehicleName?: string;
  vehicleBrand?: string;
  averageConsumption?: string;
  fuelPrice?: string;
  monthlyCost?: string;
  vehicleIsDefault?: boolean;
  goalType?: "revenue" | "profit" | "later";
  goalPeriod?: "daily" | "weekly" | "monthly";
  goalTarget?: string;
  goalName?: string;
  firstEarningAmount?: string;
  firstEarningPlatform?: string;
  firstEarningDescription?: string;
  firstEarningHasBonus?: boolean;
  skippedAt?: string;
  completedAt?: string;
};

const defaultDraft: OnboardingDraft = {
  currentStep: 0,
  vehicleType: "nao_quero",
  vehicleIsDefault: true,
  goalType: "later",
  goalPeriod: "monthly",
};

const workTypeOptions = [
  {
    id: "delivery",
    label: "Entregas",
    description: "iFood, Rappi, entregas locais e outros pedidos.",
    icon: Truck,
  },
  {
    id: "ride_hailing",
    label: "Corridas por aplicativo",
    description: "Uber, 99 e corridas particulares.",
    icon: CarFront,
  },
  {
    id: "logistics",
    label: "Fretes e logística",
    description: "Coletas, pequenas cargas e serviços de transporte.",
    icon: BriefcaseBusiness,
  },
  {
    id: "private_client",
    label: "Trabalho particular",
    description: "Serviços diretos para clientes.",
    icon: Wallet,
  },
  {
    id: "other",
    label: "Outro",
    description: "Use o Giro Líquido para acompanhar seu trabalho autônomo.",
    icon: Sparkles,
  },
] as const;

const vehicleOptions = [
  { id: "moto", label: "Moto", icon: Bike },
  { id: "carro", label: "Carro", icon: CarFront },
  { id: "bicicleta", label: "Bicicleta", icon: Bike },
  { id: "pedestre", label: "Trabalho a pé", icon: Footprints },
  { id: "nao_quero", label: "Não quero cadastrar agora", icon: Sparkles },
] as const;

const steps = [
  { label: "Lucro", key: "profit" },
  { label: "Trabalho", key: "work" },
  { label: "Veículo", key: "vehicle" },
  { label: "Meta", key: "goal" },
  { label: "Ganhos", key: "earning" },
  { label: "Concluir", key: "finish" },
];

function formatCurrency(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);

  if (Number.isNaN(numeric)) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numeric);
}

function readStoredDraft(): OnboardingDraft {
  if (typeof window === "undefined") {
    return defaultDraft;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultDraft;
    }

    const parsed = JSON.parse(saved) as Partial<OnboardingDraft>;
    return {
      ...defaultDraft,
      ...parsed,
      currentStep: parsed.currentStep ?? 0,
    };
  } catch {
    return defaultDraft;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(() => readStoredDraft().currentStep);
  const [draft, setDraft] = useState<OnboardingDraft>(() => readStoredDraft());
  const [firstName, setFirstName] = useState("motorista");

  const workTypeForm = useForm<z.infer<typeof workTypeSchema>>({
    resolver: zodResolver(workTypeSchema),
    defaultValues: {
      workType: draft.workType ?? "delivery",
    },
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      const fullName = data.user?.user_metadata?.full_name ?? data.user?.email ?? "motorista";
      const label = String(fullName).trim().split(" ")[0] || "motorista";
      setFirstName(label);
    });
  }, []);

  useEffect(() => {
    const payload = JSON.stringify({
      ...draft,
      currentStep,
      completedAt: draft.completedAt ?? undefined,
      skippedAt: draft.skippedAt ?? undefined,
    });

    window.localStorage.setItem(STORAGE_KEY, payload);
  }, [currentStep, draft]);

  useEffect(() => {
    if (draft.workType) {
      workTypeForm.reset({ workType: draft.workType });
    }
  }, [draft.workType, workTypeForm]);

  const isQuestionStep = currentStep >= 1 && currentStep <= 4;

  function updateDraft(updates: Partial<OnboardingDraft>) {
    setDraft((previous) => ({ ...previous, ...updates }));
  }

  function goNext() {
    setCurrentStep((previous) => Math.min(previous + 1, steps.length - 1));
  }

  function goBack() {
    setCurrentStep((previous) => Math.max(previous - 1, 0));
  }

  function handleExplore() {
    const nextDraft = { ...draft, skippedAt: new Date().toISOString() };
    setDraft(nextDraft);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
    router.push("/dashboard");
  }

  function finishOnboarding() {
    const completed = {
      ...draft,
      completedAt: new Date().toISOString(),
      currentStep: steps.length - 1,
    };

    setDraft(completed);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    router.push("/dashboard");
  }

  const workTypeValue = draft.workType ?? workTypeForm.getValues("workType");

  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-md sm:max-w-2xl">
        {welcomeOpen ? (
          <section className="space-y-5 pb-12 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 font-bold text-slate-950">
                  G
                </div>
                <div>
                  <p className="text-lg font-semibold">Giro Líquido</p>
                </div>
              </div>
              <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">
                Explorar
              </Link>
            </div>

            <Card className="overflow-hidden border-slate-800 bg-slate-900/80 p-5 sm:p-6">
              <div className="mb-5 inline-flex items-center rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-brand-300">
                Bem-vindo
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Bem-vindo, {firstName}!
              </h1>

              <p className="mt-4 text-base text-slate-300">
                Vamos descobrir quanto realmente sobra no seu corre?
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Em poucos passos, você organiza seus ganhos, gastos e acompanha seu lucro de verdade.
              </p>

              <div className="mt-6 rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-500/10 to-sky-500/10 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Ganhos</span>
                  <span>Saída</span>
                  <span>Lucro</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Entrada</p>
                    <p className="mt-2 text-lg font-semibold text-brand-300">R$ 200</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Saída</p>
                    <p className="mt-2 text-lg font-semibold text-rose-300">-R$ 60</p>
                  </div>
                  <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200">Lucro</p>
                    <p className="mt-2 text-lg font-semibold text-white">R$ 140</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    setWelcomeOpen(false);
                    setCurrentStep(0);
                  }}
                >
                  Começar configuração
                </Button>
                <Button variant="secondary" size="lg" className="flex-1" onClick={handleExplore}>
                  Explorar sem configurar agora
                </Button>
              </div>
            </Card>
          </section>
        ) : (
          <section className="space-y-5 py-2">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>
                Etapa {currentStep + 1} de {steps.length}
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {currentStep === 0 && (
              <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                  <CircleDollarSign className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Faturar não é a mesma coisa que lucrar.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Se você recebeu R$ 200,00, mas gastou R$ 60,00 com combustível e alimentação,
                  seu lucro foi R$ 140,00.
                </p>

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Ganhos</span>
                    <span className="font-medium text-brand-300">{formatCurrency(200)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                    <span>Gastos</span>
                    <span className="font-medium text-rose-300">- {formatCurrency(60)}</span>
                  </div>
                  <div className="mt-4 h-px bg-slate-800" />
                  <div className="mt-4 flex items-center justify-between text-base font-semibold text-white">
                    <span>Lucro real</span>
                    <span>{formatCurrency(140)}</span>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-400">
                  O Giro Líquido ajuda você a acompanhar esse resultado todos os dias.
                </p>

                <Button className="mt-6 w-full" size="lg" onClick={goNext}>
                  Entendi, continuar
                </Button>
              </Card>
            )}

            {currentStep === 1 && (
              <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
                <h2 className="text-2xl font-semibold text-white">Como é o seu corre?</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Vamos adaptar o Giro Líquido ao seu jeito de trabalhar.
                </p>

                <form
                  className="mt-6 space-y-3"
                  onSubmit={workTypeForm.handleSubmit((values) => {
                    updateDraft({ workType: values.workType });
                    goNext();
                  })}
                >
                  {workTypeOptions.map(({ id, label, description, icon: Icon }) => {
                    const selected = workTypeValue === id;

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => workTypeForm.setValue("workType", id, { shouldValidate: true })}
                        className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-brand-500 bg-brand-500/10"
                            : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                        }`}
                      >
                        <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-brand-300">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-base font-medium text-white">{label}</span>
                          <span className="mt-1 block text-sm text-slate-300">{description}</span>
                        </span>
                      </button>
                    );
                  })}

                  {workTypeForm.formState.errors.workType && (
                    <p className="text-sm text-rose-300">Selecione uma opção para continuar.</p>
                  )}

                  <div className="mt-6 flex gap-3">
                    <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Continuar
                    </Button>
                  </div>

                  <button
                    type="button"
                    className="mt-2 w-full text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
                    onClick={goNext}
                  >
                    Pular por enquanto
                  </button>
                </form>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
                <h2 className="text-2xl font-semibold text-white">Você usa algum veículo para trabalhar?</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Isso ajuda a acompanhar quilômetros, combustível e manutenção.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {vehicleOptions.map(({ id, label, icon: Icon }) => {
                    const selected = draft.vehicleType === id;

                    return (
                      <button
                        key={id}
                        type="button"
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-brand-500 bg-brand-500/10"
                            : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                        }`}
                        onClick={() => updateDraft({ vehicleType: id })}
                      >
                        <Icon className="mb-3 h-5 w-5 text-brand-300" />
                        <span className="block text-sm font-medium text-white">{label}</span>
                      </button>
                    );
                  })}
                </div>

                {(draft.vehicleType === "moto" || draft.vehicleType === "carro") && (
                  <div className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Nome do veículo</label>
                      <input
                        value={draft.vehicleName ?? ""}
                        onChange={(event) => updateDraft({ vehicleName: event.target.value })}
                        placeholder={draft.vehicleType === "moto" ? "Ex.: CG 160" : "Ex.: Corolla"}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-brand-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Marca/modelo</label>
                        <input
                          value={draft.vehicleBrand ?? ""}
                          onChange={(event) => updateDraft({ vehicleBrand: event.target.value })}
                          placeholder="Honda"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Consumo</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={draft.averageConsumption ?? ""}
                          onChange={(event) => updateDraft({ averageConsumption: event.target.value })}
                          placeholder="35 km/l"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Combustível</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.fuelPrice ?? ""}
                          onChange={(event) => updateDraft({ fuelPrice: event.target.value })}
                          placeholder="R$ 6,20"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Custo mensal</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.monthlyCost ?? ""}
                          onChange={(event) => updateDraft({ monthlyCost: event.target.value })}
                          placeholder="R$ 180"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={draft.vehicleIsDefault ?? true}
                        onChange={(event) => updateDraft({ vehicleIsDefault: event.target.checked })}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                      />
                      Usar como veículo principal.
                    </label>
                  </div>
                )}

                {draft.vehicleType === "bicicleta" && (
                  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                    <label className="mb-2 block text-slate-300">Nome da bicicleta</label>
                    <input
                      value={draft.vehicleName ?? ""}
                      onChange={(event) => updateDraft({ vehicleName: event.target.value })}
                      placeholder="Minha bike"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                    />
                  </div>
                )}

                {draft.vehicleType === "pedestre" && (
                  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
                    Sem problema. Você ainda pode registrar seus ganhos e despesas normalmente.
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button type="button" className="flex-1" onClick={goNext}>
                    Continuar
                  </Button>
                </div>

                <button
                  type="button"
                  className="mt-2 w-full text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
                  onClick={goNext}
                >
                  Pular por enquanto
                </button>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Quer trabalhar com uma meta?</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Uma meta ajuda você a acompanhar quanto falta para chegar no resultado que quer.
                </p>

                <div className="mt-6 grid gap-3">
                  {[
                    {
                      id: "revenue",
                      label: "Faturamento",
                      note: "Quanto entra antes dos gastos.",
                    },
                    {
                      id: "profit",
                      label: "Lucro",
                      note: "Quanto realmente sobra depois dos gastos.",
                    },
                    {
                      id: "later",
                      label: "Criar depois",
                      note: "Você poderá definir uma meta quando quiser.",
                    },
                  ].map((item) => {
                    const selected = draft.goalType === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateDraft({ goalType: item.id as OnboardingDraft["goalType"] })}
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-brand-500 bg-brand-500/10"
                            : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                        }`}
                      >
                        <span className="block text-base font-medium text-white">{item.label}</span>
                        <span className="mt-1 block text-sm text-slate-300">{item.note}</span>
                      </button>
                    );
                  })}
                </div>

                {draft.goalType === "revenue" || draft.goalType === "profit" ? (
                  <div className="mt-5 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Período</label>
                      <select
                        value={draft.goalPeriod ?? "monthly"}
                        onChange={(event) =>
                          updateDraft({ goalPeriod: event.target.value as OnboardingDraft["goalPeriod"] })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white focus:border-brand-500"
                      >
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Valor da meta</label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={draft.goalTarget ?? ""}
                        onChange={(event) => updateDraft({ goalTarget: event.target.value })}
                        placeholder="R$ 500,00"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Nome da meta</label>
                      <input
                        value={draft.goalName ?? (draft.goalType === "profit" ? "Meta de lucro" : "Meta de faturamento")}
                        onChange={(event) => updateDraft({ goalName: event.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button type="button" className="flex-1" onClick={goNext}>
                    Continuar
                  </Button>
                </div>

                <button
                  type="button"
                  className="mt-2 w-full text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
                  onClick={goNext}
                >
                  Pular meta por enquanto
                </button>
              </Card>
            )}

            {currentStep === 4 && (
              <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                  <Wallet className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Vamos registrar um ganho?</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Pode ser o valor que você recebeu hoje. Você poderá editar ou adicionar mais
                  lançamentos depois.
                </p>

                <div className="mt-6 grid gap-3">
                  <Button size="lg" onClick={() => updateDraft({ firstEarningAmount: draft.firstEarningAmount ?? "" })}>
                    Registrar um ganho agora
                  </Button>
                  <Button variant="secondary" size="lg" onClick={goNext}>
                    Vou fazer isso depois
                  </Button>
                </div>

                <div className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Valor recebido</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={draft.firstEarningAmount ?? ""}
                      onChange={(event) => updateDraft({ firstEarningAmount: event.target.value })}
                      placeholder="R$ 120,00"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Plataforma</label>
                    <select
                      value={draft.firstEarningPlatform ?? "ifood"}
                      onChange={(event) => updateDraft({ firstEarningPlatform: event.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white focus:border-brand-500"
                    >
                      <option value="ifood">iFood</option>
                      <option value="rappi">Rappi</option>
                      <option value="uber">Uber</option>
                      <option value="99">99</option>
                      <option value="lalamove">Lalamove</option>
                      <option value="particular">Particular</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={draft.firstEarningHasBonus ?? false}
                      onChange={(event) => updateDraft({ firstEarningHasBonus: event.target.checked })}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                    />
                    Teve gorjeta ou bônus?
                  </label>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Descrição</label>
                    <input
                      value={draft.firstEarningDescription ?? ""}
                      onChange={(event) => updateDraft({ firstEarningDescription: event.target.value })}
                      placeholder="Entrega do dia"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button type="button" className="flex-1" onClick={goNext}>
                    Continuar
                  </Button>
                </div>
              </Card>
            )}

            {currentStep === 5 && (
              <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                  <Check className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Seu painel está pronto.</h2>

                <div className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                  <p className="font-medium text-white">Você pode começar por:</p>
                  <ul className="space-y-2">
                    <li>• Registrar ganhos.</li>
                    <li>• Registrar gastos.</li>
                    <li>• Acompanhar lucro real.</li>
                    <li>• Criar metas.</li>
                    <li>• Consultar relatórios.</li>
                  </ul>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-300">
                  Quanto mais completo estiver seu registro, mais perto o painel ficará da realidade do seu trabalho.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="flex-1" onClick={finishOnboarding}>
                    Ir para meu painel
                  </Button>
                  <Button variant="secondary" size="lg" className="flex-1" onClick={handleExplore}>
                    Ver tutorial rápido
                  </Button>
                </div>
              </Card>
            )}

            {isQuestionStep && (
              <div className="text-center text-xs uppercase tracking-[0.2em] text-slate-500">
                Progresso do onboarding
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
